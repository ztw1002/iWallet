import re
from langchain_core.documents import Document

from app.models.schemas import Card


def money(value: int) -> str:
    return f"¥{value:,}"


def build_card_summary(cards: list[Card]) -> dict:
    total_limit = sum(card.limit_amount for card in cards)
    not_waived = [card for card in cards if not card.annual_fee_waived]
    highest = max(cards, key=lambda card: card.limit_amount, default=None)

    return {
        "total_cards": len(cards),
        "total_limit": total_limit,
        "total_limit_text": money(total_limit),
        "annual_fee_not_waived_count": len(not_waived),
        "annual_fee_not_waived_cards": [
            {
                "name": card.nickname,
                "limit": money(card.limit_amount),
                "annual_fee_condition": card.annual_fee_condition or "未填写",
            }
            for card in not_waived
        ],
        "highest_limit_card": (
            {"name": highest.nickname, "limit": money(highest.limit_amount)}
            if highest
            else None
        ),
    }


def card_documents(cards: list[Card]) -> list[Document]:
    return [
        Document(
            page_content=(
                f"卡片名称：{card.nickname}\n"
                f"卡组织：{card.network}\n"
                f"等级：{card.level}\n"
                f"额度：{money(card.limit_amount)}\n"
                f"年费状态：{'已免年费' if card.annual_fee_waived else '未免年费'}\n"
                f"免年费条件：{card.annual_fee_condition or '未填写'}\n"
                f"备注：{card.notes or '未填写'}"
            ),
            metadata={"name": card.nickname},
        )
        for card in cards
    ]


def retrieve_card_context(question: str, cards: list[Card], limit: int = 5) -> str:
    words = set(re.findall(r"[\w\u4e00-\u9fff]+", question.lower()))
    docs = card_documents(cards)

    scored = []
    for doc in docs:
        text = doc.page_content.lower()
        score = sum(1 for word in words if word and word in text)
        scored.append((score, doc.page_content))

    selected = [content for score, content in sorted(scored, reverse=True) if score > 0][:limit]
    if not selected:
        selected = [doc.page_content for doc in docs[:limit]]

    return "\n\n---\n\n".join(selected)
