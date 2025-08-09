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
        <p className="text-sm text-muted-foreground">还没有卡片，点击 新增卡片 开始吧。</p>
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
