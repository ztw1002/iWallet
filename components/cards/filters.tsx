"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"
import type { CardLevel, CardNetwork } from "./card-types"

const NETWORKS: CardNetwork[] = ["Visa", "Mastercard", "Amex", "UnionPay", "JCB"]
const LEVELS: CardLevel[] = ["Standard", "Gold", "Platinum", "Diamond", "Infinite"]

// 卡组织图标组件
function VisaIcon() {
  return (
    <svg viewBox="0 0 48 24" className="h-6 w-full" aria-hidden preserveAspectRatio="xMidYMid meet">
      <rect width="48" height="24" rx="4" fill="#ffffff" />
      <text x="24" y="16" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1a1f71">
        VISA
      </text>
    </svg>
  )
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 48 24" className="h-6 w-full" aria-hidden preserveAspectRatio="xMidYMid meet">
      <rect width="48" height="24" rx="4" fill="#ffffff" />
      <circle cx="20" cy="12" r="7" fill="#EB001B" />
      <circle cx="28" cy="12" r="7" fill="#F79E1B" />
    </svg>
  )
}

function AmexIcon() {
  return (
    <svg viewBox="0 0 48 24" className="h-6 w-full" aria-hidden preserveAspectRatio="xMidYMid meet">
      <rect width="48" height="24" rx="4" fill="#2E77BC" />
      <text x="24" y="16" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">
        AMEX
      </text>
    </svg>
  )
}

function UnionPayIcon() {
  return (
    <svg viewBox="0 0 48 24" className="h-6 w-full" aria-hidden preserveAspectRatio="xMidYMid meet">
      <rect width="48" height="24" rx="4" fill="#ffffff" />
      <rect x="9" y="6" width="10" height="12" rx="2" fill="#d32f2f" />
      <rect x="19" y="6" width="10" height="12" rx="2" fill="#1565c0" />
      <rect x="29" y="6" width="10" height="12" rx="2" fill="#2e7d32" />
      <text x="24" y="13" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff" fontStyle="italic" dominantBaseline="middle">Union</text>
    </svg>
  )
}

function JcbIcon() {
  return (
    <svg viewBox="0 0 48 24" className="h-6 w-full" aria-hidden preserveAspectRatio="xMidYMid meet">
      <rect width="48" height="24" rx="4" fill="#ffffff" />
      <rect x="10" y="6" width="8" height="12" rx="2" fill="#0066B2" />
      <rect x="20" y="6" width="8" height="12" rx="2" fill="#E6002D" />
      <rect x="30" y="6" width="8" height="12" rx="2" fill="#009900" />
      <text x="14" y="13" textAnchor="middle" fontSize="8" fontWeight="700" fill="#ffffff" dominantBaseline="middle">J</text>
      <text x="24" y="13" textAnchor="middle" fontSize="8" fontWeight="700" fill="#ffffff" dominantBaseline="middle">C</text>
      <text x="34" y="13" textAnchor="middle" fontSize="8" fontWeight="700" fill="#ffffff" dominantBaseline="middle">B</text>
    </svg>
  )
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

// 获取卡组织图标的辅助函数
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

// 获取卡等级图标的辅助函数
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

export function CardFilters(props: {
  network: CardNetwork | "全部"
  setNetwork: (n: CardNetwork | "全部") => void
  level: CardLevel | "全部"
  setLevel: (l: CardLevel | "全部") => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-28 justify-between bg-transparent">
            <div className="flex items-center gap-2">
              {props.network === "全部" ? (
                <span>组织: 全部</span>
              ) : (
                <>
                  <div className="w-6">
                    {getNetworkIcon(props.network)}
                  </div>
                  <span>{props.network}</span>
                </>
              )}
            </div>
            <ChevronDown className="ml-2 size-4 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80">
          <div className="flex gap-2">
            <button
              onClick={() => props.setNetwork("全部")}
              className={`flex items-center justify-center rounded-md border px-2 py-1 transition ${props.network === "全部" ? "bg-primary text-primary-foreground dark:bg-[var(--button-bg)] dark:text-foreground" : "bg-secondary hover:bg-secondary/80 dark:bg-[var(--button-bg)] dark:hover:bg-[var(--button-bg-hover)] dark:text-foreground"
                }`}
            >
              <span className="text-xs">全部</span>
            </button>
            {NETWORKS.map((n) => (
              <button
                key={n}
                onClick={() => props.setNetwork(n)}
                className={`group rounded-md border px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-[var(--button-bg)] dark:hover:bg-[var(--button-bg-hover)] dark:border-input ${props.network === n ? "ring-rose-500 ring-2 dark:ring-gray-500" : ""
                  }`}
              >
                <div
                  className={`transition ${props.network === n ? "grayscale-0 opacity-100 scale-110" : "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                    }`}
                >
                  {getNetworkIcon(n)}
                </div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-28 justify-between bg-transparent">
            <div className="flex justify-center items-center gap-2">
              {props.level === "全部" ? (
                <span>等级: 全部</span>
              ) : (
                <>
                  <div className="w-6">
                    {getLevelIcon(props.level)}
                  </div>
                  {/* <span>{props.level}</span> */}
                </>
              )}
            </div>
            <ChevronDown className="ml-2 size-4 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-48">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => props.setLevel("全部")}
              className={`flex items-center justify-center rounded-md border px-2 py-1 transition ${props.level === "全部" ? "bg-primary text-primary-foreground dark:bg-[var(--button-bg)] dark:text-foreground" : "bg-secondary hover:bg-secondary/80 dark:bg-[var(--button-bg)] dark:hover:bg-[var(--button-bg-hover)] dark:text-foreground"
                }`}
            >
              <span className="text-xs">全部</span>
            </button>
            {LEVELS.map((l) => (
              <button
                key={l}
                onClick={() => props.setLevel(l)}
                className={`group flex items-center justify-center rounded-md border px-2 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-[var(--button-bg)] dark:hover:bg-[var(--button-bg-hover)] dark:border-input ${props.level === l ? "ring-rose-500 ring-2 dark:ring-gray-500" : ""
                  }`}
              >
                <div
                  className={`transition ${props.level === l ? "grayscale-0 opacity-100 scale-110" : "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                    }`}
                >
                  {getLevelIcon(l)}
                </div>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
