export type CardNetwork = "Visa" | "Mastercard" | "Amex" | "UnionPay" | "JCB"
export type CardLevel = "Standard" | "Gold" | "Platinum" | "Diamond" | "Infinite"

export type BankCard = {
  id: string
  nickname?: string
  cardNumber: string // digits with optional spaces in storage; we'll normalize
  network: CardNetwork
  level: CardLevel
  limit: number
  color?: string // gradient key
  annualFeeWaived: boolean
  annualFeeCondition?: string
  createdAt: string
  updatedAt: string
}
