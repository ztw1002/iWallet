// 10个不同的卡面颜色，颜色之间差异明显
export const GRADIENTS: Record<string, string> = {
  sunset: "from-rose-400 to-orange-600",
  ocean: "from-blue-400 to-cyan-600",
  aurora: "from-violet-400 to-fuchsia-600",
  citrus: "from-yellow-400 to-orange-500",
  mint: "from-emerald-400 to-teal-600",
  grape: "from-purple-500 to-indigo-700",
  coral: "from-red-400 to-pink-600",
  forest: "from-green-500 to-emerald-700",
  sky: "from-sky-400 to-blue-600",
  amber: "from-amber-500 to-red-600",
}

export function formatCardNumberDisplay(raw: string) {
  const digits = raw.replace(/\D/g, "")
  const groups = digits.match(/.{1,4}/g) || []
  return groups.join(" ")
}

export function maskCardNumber(raw: string) {
  const digits = raw.replace(/\D/g, "")
  if (digits.length <= 4) return digits
  const last4 = digits.slice(-4)
  const masked = "•".repeat(Math.max(0, digits.length - 4))
  const groups = (masked + last4).match(/.{1,4}/g) || []
  return groups.join(" ")
}

export function luhnCheck(num: string) {
  const s = num.replace(/\D/g, "")
  if (s.length < 12) return false
  let sum = 0
  let shouldDouble = false
  for (let i = s.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(s[i]!, 10)
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

// 校验卡号与卡组织匹配（长度与前缀）
export function isCardNumberValidForNetwork(cardNumber: string, network: string) {
  const s = cardNumber.replace(/\D/g, "")
  const len = s.length
  const prefix2 = Number.parseInt(s.slice(0, 2) || "0", 10)
  const prefix3 = Number.parseInt(s.slice(0, 3) || "0", 10)
  const prefix4 = Number.parseInt(s.slice(0, 4) || "0", 10)
  const prefix6 = Number.parseInt(s.slice(0, 6) || "0", 10)

  switch (network) {
    case "Visa":
      return /^4/.test(s) && len >= 13 && len <= 19
    case "Mastercard": {
      const inOldRange = prefix2 >= 51 && prefix2 <= 55
      const inNewRange = prefix4 >= 2221 && prefix4 <= 2720
      return len === 16 && (inOldRange || inNewRange)
    }
    case "Amex":
      return (prefix2 === 34 || prefix2 === 37) && len === 15
    case "UnionPay":
      return /^62/.test(s) && len >= 16 && len <= 19
    case "JCB":
      return prefix4 >= 3528 && prefix4 <= 3589 && len === 16

    default:
      return false
  }
}

export function currency(n: number) {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 }).format(n)
}

export function defaultGradientByNetwork(network: string) {
  switch (network) {
    case "Visa":
      return "aurora"
    case "Mastercard":
      return "citrus"
    case "Amex":
      return "grape"
    case "UnionPay":
      return "mint"
    case "JCB":
      return "sunset"

    default:
      return "sunset"
  }
}
