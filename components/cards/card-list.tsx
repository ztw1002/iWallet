"use client"

import type { BankCard } from "./card-types"
import { CardItem } from "./card-item"

export function CardList({
  cards,
  onEdit,
}: {
  cards: BankCard[]
  onEdit: (id: string) => void
}) {
  if (cards.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed p-8 text-center bg-white/70">
        <p className="text-sm text-muted-foreground mb-4">还没有卡片，点击下方按钮开始吧。</p>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          onClick={() => onEdit("")}
        >
          新增卡片
        </button>
      </div>
    )
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <CardItem key={c.id} card={c} onEdit={onEdit} />
      ))}
    </div>
  )
}
