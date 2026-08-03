import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const runtime = "nodejs"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type CardForAssistant = {
  nickname: string
  network: string
  level: string
  limitAmount: number
  annualFeeWaived: boolean
  annualFeeCondition: string
  isFavorite: boolean
  notes: string
}

function toSafeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is ChatMessage => {
      return (
        item &&
        typeof item === "object" &&
        ((item as ChatMessage).role === "user" || (item as ChatMessage).role === "assistant") &&
        typeof (item as ChatMessage).content === "string"
      )
    })
    .slice(-8)
    .map((item) => ({
      role: item.role,
      content: item.content.slice(0, 1200),
    }))
}

function formatCurrency(value: number) {
  return `¥${value.toLocaleString("zh-CN")}`
}

function buildCardContext(cards: CardForAssistant[]) {
  const totalLimit = cards.reduce((sum, card) => sum + card.limitAmount, 0)
  const nonWaivedCards = cards.filter((card) => !card.annualFeeWaived)
  const waivedCards = cards.filter((card) => card.annualFeeWaived)
  const highestLimitCard = cards.reduce<CardForAssistant | null>((max, card) => {
    if (!max || card.limitAmount > max.limitAmount) return card
    return max
  }, null)

  return {
    summary: {
      totalCards: cards.length,
      totalLimit,
      totalLimitText: formatCurrency(totalLimit),
      annualFeeWaivedCount: waivedCards.length,
      annualFeeNotWaivedCount: nonWaivedCards.length,
      highestLimitCard: highestLimitCard
        ? {
            name: highestLimitCard.nickname,
            limitAmount: highestLimitCard.limitAmount,
            limitText: formatCurrency(highestLimitCard.limitAmount),
          }
        : null,
    },
    nonWaivedCards: nonWaivedCards.map((card) => ({
      name: card.nickname,
      limitAmount: card.limitAmount,
      limitText: formatCurrency(card.limitAmount),
      annualFeeCondition: card.annualFeeCondition || "未填写",
    })),
    cards: cards.map((card) => ({
      name: card.nickname,
      network: card.network,
      level: card.level,
      limitAmount: card.limitAmount,
      limitText: formatCurrency(card.limitAmount),
      annualFeeWaived: card.annualFeeWaived,
      annualFeeStatus: card.annualFeeWaived ? "已免年费" : "未免年费",
      annualFeeCondition: card.annualFeeCondition || "未填写",
      isFavorite: card.isFavorite,
      notes: card.notes || "未填写",
    })),
  }
}

export async function POST(request: Request) {
  try {
    const xfyunApiKey = process.env.XFYUN_API_KEY
    const xfyunModel = process.env.XFYUN_MODEL || "xophunyuan7bmt"
    const xfyunBaseUrl = process.env.XFYUN_API_BASE_URL || "https://maas-api.cn-huabei-1.xf-yun.com/v2"
    const xfyunResourceId = process.env.XFYUN_RESOURCE_ID

    if (!xfyunApiKey) {
      return NextResponse.json(
        { error: "缺少 XFYUN_API_KEY，请先在 .env.local 中配置讯飞星辰 MaaS API Key。" },
        { status: 500 },
      )
    }

    const body = await request.json().catch(() => null)
    const message = typeof body?.message === "string" ? body.message.trim() : ""
    const history = toSafeMessages(body?.history)

    if (!message) {
      return NextResponse.json({ error: "请输入问题。" }, { status: 400 })
    }

    if (message.length > 1200) {
      return NextResponse.json({ error: "问题太长，请缩短后再发送。" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      return NextResponse.json({ error: "未登录，请先登录后再使用 AI 助手。" }, { status: 401 })
    }

    const { data: cards, error: cardsError } = await supabase
      .from("user_cards")
      .select("nickname, network, level, annual_fee_waived, annual_fee_condition, limit_amount, notes, is_favorite")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })

    if (cardsError) {
      console.error("AI assistant failed to fetch cards:", cardsError)
      return NextResponse.json({ error: "读取卡片数据失败，请稍后再试。" }, { status: 500 })
    }

    const safeCards: CardForAssistant[] = (cards || []).map((card, index) => ({
      nickname: card.nickname || `未命名卡片 ${index + 1}`,
      network: card.network || "未填写",
      level: card.level || "未填写",
      limitAmount: Number(card.limit_amount) || 0,
      annualFeeWaived: Boolean(card.annual_fee_waived),
      annualFeeCondition: card.annual_fee_condition || "",
      isFavorite: Boolean(card.is_favorite),
      notes: card.notes || "",
    }))

    const cardContext = buildCardContext(safeCards)
    const messages = [
      {
        role: "system",
        content:
          "你是 iWallet 信用卡管理助手。只能基于提供的当前登录用户卡片数据回答。回答必须简单直接，不要长篇分析，不主动给建议。金额使用人民币格式。若问题涉及未提供字段，例如已用额度、年费金额、账单日、还款日，直接说明当前卡片数据中没有记录这个信息。不要编造银行政策、权益或用户没有填写的数据。不要输出完整卡号、CVV、身份证号、手机号等敏感信息。",
      },
      {
        role: "system",
        content: `当前用户卡片数据如下：\n${JSON.stringify(cardContext, null, 2)}`,
      },
      ...history,
      { role: "user", content: message },
    ]

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${xfyunApiKey}`,
    }

    if (xfyunResourceId) {
      headers.lora_id = xfyunResourceId
    }

    const response = await fetch(`${xfyunBaseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: xfyunModel,
        messages,
        temperature: 0.2,
        max_tokens: 600,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("XFYUN MaaS API error:", response.status, errorText)
      return NextResponse.json({ error: "AI 服务暂时不可用，请稍后再试。" }, { status: 502 })
    }

    const completion = await response.json()
    const answer = completion?.choices?.[0]?.message?.content

    if (typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json({ error: "AI 没有返回有效内容，请重试。" }, { status: 502 })
    }

    return NextResponse.json({ answer: answer.trim() })
  } catch (error) {
    console.error("AI assistant route error:", error)
    return NextResponse.json({ error: "AI 助手请求失败，请稍后再试。" }, { status: 500 })
  }
}
