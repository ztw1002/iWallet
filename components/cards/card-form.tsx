"use client"

import { useEffect, useMemo } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { GRADIENTS, defaultGradientByNetwork, formatCardNumberDisplay, luhnCheck, currency, isCardNumberValidForNetwork } from "./card-utils"
import type { CardLevel, CardNetwork } from "./card-types"
import { useCardStore } from "./card-store"
import { Sparkles } from "lucide-react"

const schema = z
  .object({
  nickname: z.string().max(30).optional(),
  cardNumber: z
    .string()
    .min(12, "卡号长度过短")
    .max(25, "卡号过长")
    .refine((v) => /^\d[\d\s-]*\d$/.test(v.replaceAll(" ", "")), "仅允许数字/空格")
    .refine((v) => luhnCheck(v), "卡号未通过校验"),
  network: z.enum(["Visa", "Mastercard", "Amex", "UnionPay", "JCB"]),
  level: z.enum(["Standard", "Gold", "Platinum", "Diamond", "Infinite"]),
  limit: z.coerce.number().min(0, "额度不能为负数").max(500000, "额度过大"),
  color: z.string().optional(),
    annualFeeWaived: z.boolean(),
    annualFeeCondition: z.string().optional(),
  })
  .superRefine((vals, ctx) => {
    if (!vals.annualFeeWaived) {
      if (!vals.annualFeeCondition || vals.annualFeeCondition.trim().length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["annualFeeCondition"], message: "请填写免年费条件" })
      }
    }
  })

type FormValues = z.infer<typeof schema>

export function CardFormDialog(props: { open: boolean; onOpenChange: (v: boolean) => void; editId: string | null }) {
  const { toast } = useToast()
  const add = useCardStore((s) => s.addCard)
  const update = useCardStore((s) => s.updateCard)
  const cards = useCardStore((s) => s.cards)
  const editing = useMemo(() => cards.find((c) => c.id === props.editId) ?? null, [cards, props.editId])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema.refine((vals) => isCardNumberValidForNetwork(vals.cardNumber, vals.network), {
      path: ["cardNumber"],
      message: "卡号与所选卡组织不匹配",
    })),
    defaultValues: editing
      ? {
          nickname: editing.nickname ?? "",
          cardNumber: editing.cardNumber,
          network: editing.network,
          level: editing.level,
          limit: editing.limit,
          color: editing.color,
          annualFeeWaived: (editing as any).annualFeeWaived ?? true,
          annualFeeCondition: (editing as any).annualFeeCondition ?? "",
        }
      : {
          nickname: "",
          cardNumber: "",
          network: "Visa",
          level: "Standard",
          limit: 10000,
          color: undefined,
          annualFeeWaived: true,
          annualFeeCondition: "",
        },
  })

  useEffect(() => {
    // 注册 limit 字段以便通过滑块更新并参与表单校验
    form.register("limit", { valueAsNumber: true })
  }, [form])

  // 金额-位置映射：
  // 0..900 线性映射到 0..500000；900..1000 指数映射到 500000..10000000
  function amountToPos(amount: number): number {
    const clamped = Math.max(0, Math.min(10000000, Math.round(amount || 0)))
    if (clamped <= 500000) {
      return Math.round((clamped / 500000) * 900)
    }
    const ratio = clamped / 500000 // 1..20
    const t = Math.log(ratio) / Math.log(20) // 0..1
    return Math.round(900 + t * 100)
  }

  function posToAmount(pos: number): number {
    const p = Math.max(0, Math.min(1000, Math.round(pos)))
    if (p <= 900) {
      return Math.round((p / 900) * 500000)
    }
    const t = (p - 900) / 100 // 0..1
    const ratio = Math.pow(20, t) // 1..20
    return Math.round(500000 * ratio)
  }

  // 线性滑块实现后不再需要额外的 sliderPos 状态

  useEffect(() => {
    if (editing) {
      form.reset({
        nickname: editing.nickname ?? "",
        cardNumber: editing.cardNumber,
        network: editing.network,
        level: editing.level,
        limit: editing.limit,
        color: editing.color,
        annualFeeWaived: (editing as any).annualFeeWaived ?? true,
        annualFeeCondition: (editing as any).annualFeeCondition ?? "",
      })
    } else {
      form.reset({
        nickname: "",
        cardNumber: "",
        network: "Visa",
        level: "Standard",
        limit: 10000,
        color: undefined,
        annualFeeWaived: true,
        annualFeeCondition: "",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, props.open])

  // 品牌图标（简化版 SVG）
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



  // 等级图标（简化版彩色标签）
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

  function onSubmit(values: FormValues) {
    const color = values.color || defaultGradientByNetwork(values.network)
    if (editing) {
      update(editing.id, { ...values, color })
      toast({ title: "已更新", description: "卡片信息已保存。" })
    } else {
      const id = add({ ...values, color })
      toast({ title: "已创建", description: "新增卡片成功。" })
    }
    props.onOpenChange(false)
  }

  const gradientKeys = Object.keys(GRADIENTS)

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{editing ? "编辑卡片" : "新增卡片"}</DialogTitle>
          <DialogDescription>设置卡号、卡组织、等级与额度</DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 py-2" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="nickname">备注（可选）</Label>
            <Input id="nickname" placeholder="如：日常消费卡" {...form.register("nickname")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cardNumber">卡号<span className="ml-0.5 text-rose-600">*</span></Label>
            <div className="flex items-center gap-2">
              <Input
                id="cardNumber"
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                required
                {...form.register("cardNumber", {
                  onChange: (e) => {
                    const formatted = formatCardNumberDisplay(e.target.value)
                    form.setValue("cardNumber", formatted)
                  },
                })}
              />
            </div>
            {form.formState.errors.cardNumber && (
              <p className="text-xs text-rose-600">{form.formState.errors.cardNumber.message}</p>
            )}
          </div>

          {/* 卡组织：单独一行，图标平铺，默认灰色，悬停/选中恢复颜色 */}
          <div className="grid gap-2">
            <Label>卡组织<span className="ml-0.5 text-rose-600">*</span></Label>
            <div className="grid grid-cols-5 items-center gap-2 py-1">
              {(
                [
                  { key: "Visa", Icon: VisaIcon },
                  { key: "Mastercard", Icon: MastercardIcon },
                  { key: "Amex", Icon: AmexIcon },
                  { key: "UnionPay", Icon: UnionPayIcon },
                  { key: "JCB", Icon: JcbIcon },
                ]
              ).map(({ key, Icon }) => {
                const selected = form.watch("network") === key
                return (
                  <button
                    key={key}
                    type="button"
                    title={key}
                    aria-label={`选择 ${key}`}
                    onClick={() => form.setValue("network", key as CardNetwork)}
                    className={`group rounded-md border px-2 py-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                      selected ? "ring-rose-500 ring-2" : ""
                    }`}
                  >
                    <div
                      className={`transition ${
                        selected ? "grayscale-0 opacity-100 scale-110" : "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                      }`}
                    >
                      <Icon />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 卡等级：与卡组织同样的平铺图标交互 */}
          <div className="grid gap-2">
            <Label>卡等级<span className="ml-0.5 text-rose-600">*</span></Label>
            <div className="grid grid-cols-5 items-center gap-2 py-1">
              {(
                [
                  { key: "Standard", Icon: LevelStandard },
                  { key: "Gold", Icon: LevelGold },
                  { key: "Platinum", Icon: LevelPlatinum },
                  { key: "Diamond", Icon: LevelDiamond },
                  { key: "Infinite", Icon: LevelInfinite },
                ]
              ).map(({ key, Icon }) => {
                const selected = form.watch("level") === key
                return (
                  <button
                    key={key}
                    type="button"
                    title={key}
                    aria-label={`选择 ${key}`}
                    onClick={() => form.setValue("level", key as CardLevel)}
                    className={`group rounded-md border px-2 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 ${
                      selected ? "ring-rose-500 ring-2" : ""
                    }`}
                  >
                    <div
                      className={`transition ${
                        selected ? "grayscale-0 opacity-100 scale-110" : "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                      }`}
                    >
                      <Icon />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 额度：滑块（线性 0..500000，步长1000） */}
          <div className="grid gap-2">
            <Label htmlFor="limit">额度（CNY）<span className="ml-0.5 text-rose-600">*</span></Label>
            <div className="space-y-3">
              <div className="px-1">
                <Slider
                  value={[form.watch("limit")]}
                  min={0}
                  max={100000}
                  step={1000}
                  onValueChange={(v) => form.setValue("limit", Math.max(0, Math.min(500000, Math.round(v[0] ?? 0))))}
                  aria-label="额度选择"
                />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{currency(form.watch("limit") || 0)}</span>
              </div>
            </div>
            {form.formState.errors.limit && (
              <p className="text-xs text-rose-600">{form.formState.errors.limit.message}</p>
            )}
          </div>

          {/* 年费 */}
          <div className="grid gap-2">
            <Label>年费<span className="ml-0.5 text-rose-600">*</span></Label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  id="annual-waived-yes"
                  type="radio"
                  className="h-4 w-4"
                  checked={form.watch("annualFeeWaived") === true}
                  onChange={() => form.setValue("annualFeeWaived", true)}
                />
                <Label htmlFor="annual-waived-yes">已免</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="annual-waived-no"
                  type="radio"
                  className="h-4 w-4"
                  checked={form.watch("annualFeeWaived") === false}
                  onChange={() => form.setValue("annualFeeWaived", false)}
                />
                <Label htmlFor="annual-waived-no">未免</Label>
              </div>
            </div>
            {!form.watch("annualFeeWaived") && (
              <div className="grid gap-2">
                <Label htmlFor="annualFeeCondition">免年费条件<span className="ml-0.5 text-rose-600">*</span></Label>
                <Input
                  id="annualFeeCondition"
                  placeholder="例如：首年免，次年 3 笔消费免"
                  {...form.register("annualFeeCondition")}
                />
                {form.formState.errors.annualFeeCondition && (
                  <p className="text-xs text-rose-600">{form.formState.errors.annualFeeCondition.message as string}</p>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label>卡面风格</Label>
            <div className="flex justify-center">
              <div className="grid gap-2">
                <div className="grid grid-cols-5 gap-2">
                  {/* 第一行：前5个颜色 */}
                  {gradientKeys.slice(0, 5).map((k) => (
                    <button
                      aria-label={`选择 ${k}`}
                      type="button"
                      key={k}
                      onClick={() => form.setValue("color", k)}
                      className={`h-10 w-16 rounded-xl bg-gradient-to-br ${GRADIENTS[k]} ring-2 transition ${
                        form.watch("color") === k ? "ring-rose-500" : "ring-transparent"
                      }`}
                      title={k}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {/* 第二行：后4个颜色 + 随机生成按钮 */}
                  {gradientKeys.slice(5, 9).map((k) => (
                    <button
                      aria-label={`选择 ${k}`}
                      type="button"
                      key={k}
                      onClick={() => form.setValue("color", k)}
                      className={`h-10 w-16 rounded-xl bg-gradient-to-br ${GRADIENTS[k]} ring-2 transition ${
                        form.watch("color") === k ? "ring-rose-500" : "ring-transparent"
                      }`}
                      title={k}
                    />
                  ))}
                  {/* 随机生成按钮，与上方第五个按钮大小相同，位置对齐 */}
                  <button
                    type="button"
                    onClick={() => {
                      const current = form.watch("color")
                      const pool = gradientKeys.filter((k) => k !== current)
                      const pick = (pool.length ? pool : gradientKeys)[Math.floor(Math.random() * (pool.length ? pool.length : gradientKeys.length))]!
                      form.setValue("color", pick)
                    }}
                    className={`h-10 w-16 rounded-xl text-xs text-white transition relative ${
                      form.watch("color")
                        ? `bg-gradient-to-br ${GRADIENTS[form.watch("color")!]}`
                        : "rgb-border-flow"
                    }`}
                    style={{ border: form.watch("color") ? "0" : "0" }}
                    title="随机生成一个颜色并预览"
                  >
                    随机
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => props.onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white hover:opacity-90">
              <Sparkles className="mr-2 size-4" />
              {editing ? "保存" : "创建"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
