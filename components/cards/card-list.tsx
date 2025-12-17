"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Grid3X3, Grid } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { BankCard } from "./card-types"
import { CardItem } from "./card-item"

export function CardList({
  cards,
  onEdit,
}: {
  cards: BankCard[]
  onEdit: (id: string) => void
}) {
  const [viewMode, setViewMode] = useState<"compact" | "normal">("normal")

  if (cards.length === 0) {
    return (
      <div className="rounded-3xl surface-panel surface-panel-soft surface-border-strong border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground mb-4">还没有卡片，点击下方按钮开始吧。</p>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white rounded-lg hover:opacity-90 transition"
          onClick={() => onEdit("")}
        >
          新增卡片
        </button>
      </div>
    )
  }

  // 响应式网格布局
  const gridClass = viewMode === "compact" 
    ? "grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
    : "grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

  return (
    <div className="space-y-4">
      {/* 视图切换按钮 */}
      <div className="flex justify-end">
        <div className="flex items-center gap-2 surface-panel surface-panel-glass surface-border-strong backdrop-blur rounded-lg p-1 ring-1 ring-[color:var(--border)] ring-opacity-60">
          <Button
            variant={viewMode === "normal" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("normal")}
            className={viewMode === "normal" ? "bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white" : ""}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            三列
          </Button>
          <Button
            variant={viewMode === "compact" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("compact")}
            className={viewMode === "compact" ? "bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white" : ""}
          >
            <Grid className="h-4 w-4 mr-1" />
            五列
          </Button>
        </div>
      </div>

      {/* 卡片网格 */}
      <div className={gridClass}>
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              transition={{
                duration: 0.4,
                delay: Math.min(index * 0.05, 0.5), // 限制最大延迟为0.5秒
                ease: [0.25, 0.46, 0.45, 0.94] // 使用更平滑的缓动函数
              }}
              layout
              layoutId={card.id}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <CardItem card={card} onEdit={onEdit} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
