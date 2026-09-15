from typing import TypedDict

from langgraph.graph import END, StateGraph

from app.models.schemas import Card, ChatMessage
from app.services.cards import build_card_summary, retrieve_card_context


class AssistantState(TypedDict):
    question: str
    history: list[ChatMessage]
    cards: list[Card]
    route: str
    context: str
    messages: list[dict[str, str]]


def route_question(state: AssistantState) -> AssistantState:
    question = state["question"]
    stats_words = ["总额度", "多少张", "几张", "最高", "最低", "平均", "免年费", "未免"]
    route = "cards" if any(word in question for word in stats_words) else "rag"
    return {**state, "route": route}


def build_context(state: AssistantState) -> AssistantState:
    summary = build_card_summary(state["cards"])
    rag_context = retrieve_card_context(state["question"], state["cards"])
    context = f"结构化统计：{summary}\n\nRAG 召回卡片内容：\n{rag_context}"
    return {**state, "context": context}


def build_messages(state: AssistantState) -> AssistantState:
    system = (
        "你是 iWallet 信用卡管理助手。只能基于提供的用户卡片数据回答。"
        "回答要简单直接，不要长篇分析，不主动给建议。"
        "如果用户询问年费日期、账单日、还款日、已用额度等未提供字段，直接说明当前卡片数据中没有记录。"
        "不要编造银行政策、权益或用户没有填写的数据。"
    )

    history = [
        {"role": item.role, "content": item.content}
        for item in state["history"][-8:]
        if item.role in {"user", "assistant"}
    ]
    messages = [
        {"role": "system", "content": system},
        {"role": "system", "content": f"当前问题类型：{state['route']}\n{state['context']}"},
        *history,
        {"role": "user", "content": state["question"]},
    ]
    return {**state, "messages": messages}


def create_card_assistant_graph():
    graph = StateGraph(AssistantState)
    graph.add_node("route_question", route_question)
    graph.add_node("build_context", build_context)
    graph.add_node("build_messages", build_messages)
    graph.set_entry_point("route_question")
    graph.add_edge("route_question", "build_context")
    graph.add_edge("build_context", "build_messages")
    graph.add_edge("build_messages", END)
    return graph.compile()
