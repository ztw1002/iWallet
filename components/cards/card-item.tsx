"use client"

import { CheckCircle2, Copy, Edit2, Shield, Trash2, Circle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { currency, GRADIENTS, maskCardNumber } from "./card-utils"
import type { BankCard } from "./card-types"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useCardStoreDB } from "./card-store-db"
import { motion } from "framer-motion"

export function CardItem({ card, onEdit }: { card: BankCard; onEdit: (id: string) => void }) {
  const { toast } = useToast()
  const del = useCardStoreDB((s) => s.deleteCard)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [showCardNumber, setShowCardNumber] = useState(false)
  const gradient = card.color && GRADIENTS[card.color] ? GRADIENTS[card.color] : GRADIENTS["sunset"]

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(card.cardNumber.replaceAll(" ", ""))
      toast({ title: "已复制卡号", description: "卡号已复制到剪贴板（已去除空格）。" })
    } catch {
      toast({ title: "复制失败", variant: "destructive" })
    }
  }

  function formatCardNumber(cardNumber: string, show: boolean) {
    const digits = cardNumber.replace(/\D/g, "")
    if (show) {
      // 显示完整卡号，每四个数字一组，用空格分隔
      return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
    } else {
      // 只显示最后4位，连在一起
      if (digits.length <= 4) return digits
      const last4 = digits.slice(-4)
      const masked = "•".repeat(Math.max(0, digits.length - 4))
      return masked + ` ${last4}`
    }
  }

  // 卡组织图标组件
  function VisaIcon() {
    return (
      <svg viewBox="0 0 48 24" className="h-8 w-full" aria-hidden preserveAspectRatio="xMidYMid meet">
        <text x="24" y="16" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1a1f71">
          VISA
        </text>
      </svg>
    )
  }

  function MastercardIcon() {
    return (
      <svg viewBox="0 0 48 24" className="h-8 w-full" aria-hidden preserveAspectRatio="xMidYMid meet">
        <circle cx="20" cy="12" r="7" fill="#EB001B" />
        <circle cx="28" cy="12" r="7" fill="#F79E1B" />
      </svg>
    )
  }

  function AmexIcon() {
    return (
      <svg viewBox="0 0 48 24" className="h-8 w-full" aria-hidden preserveAspectRatio="xMidYMid meet">
        <rect width="48" height="24" rx="4" fill="#2E77BC" />
        <text x="24" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">
          AMEX
        </text>
      </svg>
    )
  }

  function UnionPayIcon() {
    return (
      <svg viewBox="0 0 48 24" className="h-8 w-full" aria-hidden preserveAspectRatio="xMidYMid meet">
        <rect x="9" y="6" width="10" height="12" rx="2" fill="#d32f2f" />
        <rect x="19" y="6" width="10" height="12" rx="2" fill="#1565c0" />
        <rect x="29" y="6" width="10" height="12" rx="2" fill="#2e7d32" />
        <text x="24" y="13" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff" fontStyle="italic" dominantBaseline="middle">Union</text>
      </svg>
    )
  }

  function JcbIcon() {
    return (
      <svg viewBox="0 0 48 24" className="h-8 w-full" aria-hidden preserveAspectRatio="xMidYMid meet">
        <rect x="10" y="6" width="8" height="12" rx="2" fill="#0066B2" />
        <rect x="20" y="6" width="8" height="12" rx="2" fill="#E6002D" />
        <rect x="30" y="6" width="8" height="12" rx="2" fill="#009900" />
        <text x="14" y="13" textAnchor="middle" fontSize="8" fontWeight="700" fill="#ffffff" dominantBaseline="middle">J</text>
        <text x="24" y="13" textAnchor="middle" fontSize="8" fontWeight="700" fill="#ffffff" dominantBaseline="middle">C</text>
        <text x="34" y="13" textAnchor="middle" fontSize="8" fontWeight="700" fill="#ffffff" dominantBaseline="middle">B</text>
      </svg>
    )
  }

  function getNetworkIcon(network: string) {
    switch (network) {
      case "Visa":
        return <VisaIcon />
      case "Mastercard":
        return <MastercardIcon />
      case "Amex":
        return <AmexIcon />
      case "UnionPay":
        return <UnionPayIcon />
      case "JCB":
        return <JcbIcon />

      default:
        return <VisaIcon />
    }
  }

  // 卡等级图标组件
  function LevelBadge(props: { label: string; bg: string; fg?: string }) {
    return (
      <div className="flex h-6 items-center justify-center rounded px-2 text-xs font-semibold" style={{ backgroundColor: props.bg, color: props.fg ?? "#ffffff" }}>
        {props.label}
      </div>
    )
  }

  function LevelStandard() {
    return <LevelBadge label="Standard" bg="#9ca3af" />
  }
  function LevelGold() {
    return <LevelBadge label="Gold" bg="#f59e0b" />
  }
  function LevelPlatinum() {
    return <LevelBadge label="Platinum" bg="#60a5fa" />
  }
  function LevelDiamond() {
    return <LevelBadge label="Diamond" bg="#14b8a6" />
  }
  function LevelInfinite() {
    return <LevelBadge label="Infinite" bg="#111827" />
  }

  function getLevelIcon(level: string) {
    switch (level) {
      case "Standard":
        return <LevelStandard />
      case "Gold":
        return <LevelGold />
      case "Platinum":
        return <LevelPlatinum />
      case "Diamond":
        return <LevelDiamond />
      case "Infinite":
        return <LevelInfinite />
      default:
        return <LevelStandard />
    }
  }

  return (
    <motion.div 
      className="group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-rose-100 transition-all duration-300 hover:shadow-lg"
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <div className={`m-3 rounded-2xl p-5 text-white bg-gradient-to-br ${gradient} shadow-inner relative`}>
        {/* 年费状态 - 右上角 */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/20 rounded-full px-2 py-1">
          {card.annualFeeWaived ? (
            <>
              <span className="text-xs">✅</span>
              <span className="text-xs text-white/90">已免</span>
            </>
          ) : (
            <>
              <span className="text-xs">⭕️</span>
              <span className="text-xs text-white/90">未免</span>
            </>
          )}
        </div>

        <div className="flex items-start justify-between">
          <div></div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-4 group-hover:translate-x-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
            >
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/20 border-0 text-white hover:bg-white/30"
                onClick={() => onEdit(card.id)}
                title="编辑"
              >
                <Edit2 className="size-4" />
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.2 }}
            >
              <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-white/20 border-0 text-white hover:bg-white/30"
                    title="删除"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>删除卡片？</AlertDialogTitle>
                    <AlertDialogDescription>此操作无法撤销。</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-rose-600 hover:bg-rose-700"
                      onClick={async () => {
                        try {
                          await del(card.id)
                          toast({ title: "已删除", description: "卡片已删除。" })
                        } catch {
                          toast({ title: "删除失败", variant: "destructive" })
                        }
                      }}
                    >
                      确认删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.2 }}
            >
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/20 border-0 text-white hover:bg-white/30"
                onClick={handleCopy}
                title="复制卡号"
              >
                <Copy className="size-4" />
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.2 }}
            >
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-white/20 border-0 text-white hover:bg-white/30"
                onClick={() => setShowCardNumber(!showCardNumber)}
                title={showCardNumber ? "隐藏卡号" : "显示卡号"}
              >
                {showCardNumber ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="mt-7 space-y-2">
          <div 
            className="font-semibold tracking-wider whitespace-nowrap overflow-hidden text-right text-2xl"
            style={{
              fontSize: '1.5rem',
              minHeight: '2.25rem',
              lineHeight: '2.25rem'
            }}
          >
            {formatCardNumber(card.cardNumber, showCardNumber)}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
          <div className="w-16">
            {getNetworkIcon(card.network)}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{card.nickname || "未命名"}</p>
            <p className="text-xs text-muted-foreground">更新于 {new Date(card.updatedAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            {getLevelIcon(card.level)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
