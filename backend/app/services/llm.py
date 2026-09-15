import json
from collections.abc import AsyncIterator

import httpx
from fastapi import HTTPException

from app.core.config import get_settings


async def stream_deepseek(messages: list[dict[str, str]]) -> AsyncIterator[str]:
    settings = get_settings()
    url = f"{settings.deepseek_base_url.rstrip('/')}/chat/completions"
    payload = {
        "model": settings.deepseek_model,
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": 600,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=None) as client:
        async with client.stream(
            "POST",
            url,
            headers={
                "Authorization": f"Bearer {settings.deepseek_api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        ) as response:
            if response.status_code != 200:
                detail = await response.aread()
                raise HTTPException(status_code=502, detail=f"AI 服务暂时不可用：{detail.decode('utf-8', 'ignore')[:200]}")

            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue

                data = line.removeprefix("data: ").strip()
                if data == "[DONE]":
                    break

                try:
                    chunk = json.loads(data)
                except json.JSONDecodeError:
                    continue

                token = chunk.get("choices", [{}])[0].get("delta", {}).get("content")
                if token:
                    yield token
