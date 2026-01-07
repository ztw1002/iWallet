"use client"

import { useEffect, useState, memo } from "react"
import { GRADIENTS } from "./cards/card-utils"
import type { CardNetwork, CardLevel, BankCard } from "./cards/card-types"
import { CardItem } from "./cards/card-item"

// 生成随机示例卡片数据
function generateSampleCards(count: number): BankCard[] {
  const networks: CardNetwork[] = ["Visa", "Mastercard", "Amex", "UnionPay", "JCB"]
  const levels: CardLevel[] = ["Standard", "Gold", "Platinum", "Diamond", "Infinite"]
  const gradients = Object.keys(GRADIENTS)
  const nicknames = ["招商银行", "工商银行", "建设银行", "农业银行", "中国银行", "交通银行", "浦发银行", "中信银行"]

  const cards: BankCard[] = []
  for (let i = 0; i < count; i++) {
    const network = networks[Math.floor(Math.random() * networks.length)]
    const level = levels[Math.floor(Math.random() * levels.length)]
    const color = gradients[Math.floor(Math.random() * gradients.length)]
    const nickname = nicknames[Math.floor(Math.random() * nicknames.length)]
    const limit = [10000, 30000, 50000, 80000, 100000][Math.floor(Math.random() * 5)]

    // 根据不同卡组织生成符合规范的卡号
    let cardNumber = ""
    if (network === "Visa") {
      // Visa: 13, 16 或 19位，以4开头
      const visaLengths = [13, 16, 19]
      const length = visaLengths[Math.floor(Math.random() * visaLengths.length)]
      cardNumber = "4" + Array.from({ length: length - 1 }, () =>
        Math.floor(Math.random() * 10)
      ).join("")
    } else if (network === "Mastercard") {
      // Mastercard: 16位，51-55或2221-2720开头
      const prefix = Math.random() > 0.5
        ? String(51 + Math.floor(Math.random() * 5))
        : String(2221 + Math.floor(Math.random() * 500))
      cardNumber = prefix + Array.from({ length: 16 - prefix.length }, () =>
        Math.floor(Math.random() * 10)
      ).join("")
    } else if (network === "Amex") {
      // Amex: 15位，34或37开头
      const prefix = Math.random() > 0.5 ? "34" : "37"
      cardNumber = prefix + Array.from({ length: 13 }, () =>
        Math.floor(Math.random() * 10)
      ).join("")
    } else if (network === "UnionPay") {
      // UnionPay: 16-19位，62开头
      const length = 16 + Math.floor(Math.random() * 4) // 16-19
      cardNumber = "62" + Array.from({ length: length - 2 }, () =>
        Math.floor(Math.random() * 10)
      ).join("")
    } else if (network === "JCB") {
      // JCB: 16-19位，3528-3589开头
      const prefix = String(3528 + Math.floor(Math.random() * 62))
      const length = 16 + Math.floor(Math.random() * 4) // 16-19
      cardNumber = prefix + Array.from({ length: length - prefix.length }, () =>
        Math.floor(Math.random() * 10)
      ).join("")
    } else {
      // 默认16位
      cardNumber = Array.from({ length: 16 }, () =>
        Math.floor(Math.random() * 10)
      ).join("")
    }

    cards.push({
      id: `sample-${i}`,
      nickname: `${nickname} ${network}`,
      cardNumber,
      network,
      level,
      limit,
      color,
      annualFeeWaived: Math.random() > 0.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  return cards
}

// 卡组织图标组件（复用 CardItem 的逻辑）
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

// 卡等级图标组件（复用 CardItem 的逻辑）
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

// 包装 CardItem，移除交互功能，仅用于展示
const DisplayCard = memo(function DisplayCard({ card }: { card: BankCard }) {
  const gradient = card.color && GRADIENTS[card.color] ? GRADIENTS[card.color] : GRADIENTS["sunset"]

  // 根据卡组织确定卡号长度和字体大小
  const getCardNumberStyle = () => {
    const cardNumberLength = card.cardNumber.replace(/\s/g, '').length

    // Amex: 15位，较大字号
    if (card.network === 'Amex') {
      return {
        fontSize: '1.35rem',
        letterSpacing: '0.05em',
        format: (num: string) => {
          const digits = num.replace(/\D/g, '')
          if (digits.length === 15) {
            return `•••• •••••• •${digits.slice(-5)}`
          }
          return `•••• •••• •••• ${digits.slice(-4)}`
        }
      }
    }

    // Visa: 13-19位，较小字号以适应更长卡号
    if (card.network === 'Visa') {
      return {
        fontSize: cardNumberLength <= 16 ? '1.4rem' : '1.2rem',
        letterSpacing: '0.03em',
        format: (num: string) => {
          const digits = num.replace(/\D/g, '')
          // Visa 13位: 4-6-3 格式
          // Visa 16位: 4-4-4-4 格式
          // Visa 19位: 6-6-6-1 格式
          if (digits.length === 13) {
            return `•••• •••••• •${digits.slice(-3)}`
          } else if (digits.length === 16) {
            return `•••• •••• •••• ${digits.slice(-4)}`
          } else if (digits.length === 19) {
            return `•••••• •••••• •${digits.slice(-1)}`
          }
          return `•••• •••• •••• ${digits.slice(-4)}`
        }
      }
    }

    // Mastercard: 16位，标准字号
    if (card.network === 'Mastercard') {
      return {
        fontSize: '1.4rem',
        letterSpacing: '0.04em',
        format: (num: string) => {
          const digits = num.replace(/\D/g, '')
          return `•••• •••• •••• ${digits.slice(-4)}`
        }
      }
    }

    // UnionPay: 16-19位，动态调整字号
    if (card.network === 'UnionPay') {
      return {
        fontSize: cardNumberLength <= 16 ? '1.35rem' : '1.15rem',
        letterSpacing: '0.03em',
        format: (num: string) => {
          const digits = num.replace(/\D/g, '')
          if (digits.length === 16) {
            return `•••• •••• •••• ${digits.slice(-4)}`
          } else if (digits.length === 17) {
            return `••••• ••••• •• ${digits.slice(-2)}`
          } else if (digits.length === 18) {
            return `••••• ••••• ••• ${digits.slice(-3)}`
          } else if (digits.length === 19) {
            return `•••••• •••••• •${digits.slice(-1)}`
          }
          return `•••• •••• •••• ${digits.slice(-4)}`
        }
      }
    }

    // JCB: 16-19位，动态调整字号
    if (card.network === 'JCB') {
      return {
        fontSize: cardNumberLength <= 16 ? '1.35rem' : '1.15rem',
        letterSpacing: '0.03em',
        format: (num: string) => {
          const digits = num.replace(/\D/g, '')
          if (digits.length === 16) {
            return `•••• •••• •••• ${digits.slice(-4)}`
          } else if (digits.length === 17) {
            return `••••• ••••• •• ${digits.slice(-2)}`
          } else if (digits.length === 18) {
            return `••••• ••••• ••• ${digits.slice(-3)}`
          } else if (digits.length === 19) {
            return `•••••• •••••• •${digits.slice(-1)}`
          }
          return `•••• •••• •••• ${digits.slice(-4)}`
        }
      }
    }

    // 默认格式
    return {
      fontSize: '1.35rem',
      letterSpacing: '0.04em',
      format: (num: string) => {
        const digits = num.replace(/\D/g, '')
        return `•••• •••• •••• ${digits.slice(-4)}`
      }
    }
  }

  const cardNumberStyle = getCardNumberStyle()
  const displayCardNumber = cardNumberStyle.format(card.cardNumber)

  return (
    <div className="flex-shrink-0 w-80 mx-3" style={{ pointerEvents: 'none' }}>
      <div className="relative overflow-hidden rounded-3xl bg-transparent">
        <div className={`m-2.5 rounded-2xl p-4 text-white bg-gradient-to-br ${gradient} shadow-lg relative`}>
          {/* 年费状态 - 右上角 */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/20 rounded-full px-2 py-1">
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

          <div className="space-y-2 mt-6">
            <div
              className="font-semibold tracking-wide whitespace-nowrap overflow-hidden text-right"
              style={{
                fontSize: cardNumberStyle.fontSize,
                letterSpacing: cardNumberStyle.letterSpacing,
                minHeight: '2rem',
                lineHeight: '2rem'
              }}
            >
              {displayCardNumber}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end">
            <div className="w-16">
              {getNetworkIcon(card.network)}
            </div>
          </div>
        </div>

        <div className="px-3 pb-2.5 bg-transparent">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{card.nickname || "未命名"}</p>
              <p className="text-xs text-muted-foreground">示例卡片</p>
            </div>
            <div className="flex items-center gap-2">
              {getLevelIcon(card.level)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export const CardCarousel = memo(function CardCarousel() {
  const [cards, setCards] = useState<BankCard[]>([])
  const [visibleCards, setVisibleCards] = useState<BankCard[]>([])

  useEffect(() => {
    // 生成12张示例卡片，用于循环滚动
    const sampleCards = generateSampleCards(12)
    setCards(sampleCards)

    // 初始显示所有卡片（两组用于无缝循环）
    setVisibleCards([...sampleCards, ...sampleCards])
  }, [])

  // 使用 Intersection Observer 实现懒加载
  useEffect(() => {
    if (cards.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 当最后一组卡片进入视口时，添加更多卡片
            const lastCardId = entry.target.getAttribute('data-card-id')
            if (lastCardId === `sample-${cards.length - 1}-2`) {
              // 添加第三组卡片以实现真正的无限循环
              setVisibleCards((prev) => [...prev, ...cards])
            }
          }
        })
      },
      { threshold: 0.1 }
    )

    // 观察最后一张卡片
    const lastCardElement = document.querySelector(`[data-card-id="sample-${cards.length - 1}-2"]`)
    if (lastCardElement) {
      observer.observe(lastCardElement)
    }

    return () => observer.disconnect()
  }, [cards])

  return (
    <div className="w-full overflow-hidden mt-8 mb-4">
      {/* 滚动容器 - 使用 CSS 动画实现平滑循环 */}
      <div className="flex animate-scroll">
        {visibleCards.map((card, index) => (
          <div key={`${card.id}-${index}`} data-card-id={`${card.id}-${index}`}>
            <DisplayCard card={card} />
          </div>
        ))}
      </div>
    </div>
  )
})
