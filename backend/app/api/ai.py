import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, Header, HTTPException
from fastapi.responses import StreamingResponse

from app.graphs.card_assistant import create_card_assistant_graph
from app.models.schemas import ChatRequest
from app.services.llm import stream_deepseek
from app.services.supabase import get_user_cards, get_user_id

router = APIRouter(prefix="/api/ai", tags=["ai"])
graph = create_card_assistant_graph()


def _access_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="缺少登录凭证")
    return authorization.removeprefix("Bearer ").strip()


def _event(name: str, data: str) -> str:
    return f"event: {name}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


@router.post("/chat/stream")
async def chat_stream(payload: ChatRequest, authorization: str | None = Header(default=None)):
    token = _access_token(authorization)
    user_id = await get_user_id(token)
    cards = await get_user_cards(token, user_id)

    state = await graph.ainvoke(
        {
            "question": payload.message.strip(),
            "history": payload.history,
            "cards": cards,
            "route": "",
            "context": "",
            "messages": [],
        }
    )

    async def stream() -> AsyncIterator[str]:
        try:
            async for text in stream_deepseek(state["messages"]):
                yield _event("token", text)
            yield _event("done", "")
        except Exception as exc:
            yield _event("error", str(exc))

    return StreamingResponse(stream(), media_type="text/event-stream")
