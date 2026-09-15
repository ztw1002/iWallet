import httpx
from fastapi import HTTPException

from app.core.config import get_settings
from app.models.schemas import Card


def _auth_headers(access_token: str) -> dict[str, str]:
    settings = get_settings()
    return {
        "apikey": settings.supabase_anon_key,
        "Authorization": f"Bearer {access_token}",
    }


async def get_user_id(access_token: str) -> str:
    settings = get_settings()
    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            f"{settings.supabase_url.rstrip('/')}/auth/v1/user",
            headers=_auth_headers(access_token),
        )

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="未登录或登录已过期")

    user_id = response.json().get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="无法识别当前用户")
    return user_id


async def get_user_cards(access_token: str, user_id: str) -> list[Card]:
    settings = get_settings()
    params = {
        "select": "nickname,network,level,limit_amount,annual_fee_waived,annual_fee_condition,notes,is_favorite",
        "user_id": f"eq.{user_id}",
        "order": "created_at.desc",
    }

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.get(
            f"{settings.supabase_url.rstrip('/')}/rest/v1/user_cards",
            headers=_auth_headers(access_token),
            params=params,
        )

    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="读取卡片数据失败")

    return [
        Card(
            nickname=item.get("nickname") or f"未命名卡片 {index + 1}",
            network=item.get("network") or "未填写",
            level=item.get("level") or "未填写",
            limit_amount=int(item.get("limit_amount") or 0),
            annual_fee_waived=bool(item.get("annual_fee_waived")),
            annual_fee_condition=item.get("annual_fee_condition") or "",
            notes=item.get("notes") or "",
            is_favorite=bool(item.get("is_favorite")),
        )
        for index, item in enumerate(response.json())
    ]
