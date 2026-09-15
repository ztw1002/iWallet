from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(pattern="^(user|assistant)$")
    content: str = Field(min_length=1, max_length=1200)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=1200)
    history: list[ChatMessage] = Field(default_factory=list, max_length=8)


class Card(BaseModel):
    nickname: str
    network: str
    level: str
    limit_amount: int
    annual_fee_waived: bool
    annual_fee_condition: str = ""
    notes: str = ""
    is_favorite: bool = False
