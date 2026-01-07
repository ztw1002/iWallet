"use client"

import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreditCard, Filter, Import, Plus, Search, Settings2, SortAsc, SortDesc, Upload, RefreshCw } from "lucide-react"
import TopNav from "@/components/top-nav"
import { CardFilters } from "@/components/cards/filters"
import { CardList } from "@/components/cards/card-list"
import { useCardStoreDB } from "@/components/cards/card-store-db"
import { CardFormDialog } from "@/components/cards/card-form"
import type { CardLevel, CardNetwork } from "@/components/cards/card-types"
import { useToast } from "@/hooks/use-toast"
import { EnvVarWarning } from "@/components/env-var-warning"
import { useAuth } from "@/lib/auth-context"
import { LandingPage } from "@/components/landing-page"

// 问候语组件
function Greeting() {
  const { user } = useAuth()
  const [greeting, setGreeting] = useState("")

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours()
      let timeGreeting = ""

      if (hour >= 5 && hour < 12) {
        timeGreeting = "早上好"
      } else if (hour >= 12 && hour < 18) {
        timeGreeting = "下午好"
      } else {
        timeGreeting = "晚上好"
      }

      return `${timeGreeting}，${user?.email?.split('@')[0] || '用户'}`
    }

    setGreeting(getGreeting())
  }, [user])

  if (!user) return null

  return (
    <div className="mt-4 mb-2">
      <h1 className="text-3xl font-bold text-foreground">
        {greeting}
      </h1>
    </div>
  )
}

export default function Page() {
  const [hasEnvVars, setHasEnvVars] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    // 检查环境变量是否配置
    const checkEnvVars = () => {
      const hasUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const hasKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
      setHasEnvVars(!!(hasUrl && hasKey))
    }

    checkEnvVars()
  }, [])

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-[#fffbe8] via-[#f7f2e4] to-[#eee8d5] dark:from-[#1a1a1a] dark:via-[#0f0f0f] dark:to-[#0a0a0a] text-foreground">
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <TopNav />

        {/* 环境变量警告 */}
        {!hasEnvVars && (
          <div className="mt-6">
            <EnvVarWarning />
          </div>
        )}

        {/* 未登录用户 - 显示宣传页面 */}
        {!user && <LandingPage />}

        {/* 已登录用户 - 显示问候语和管理面板 */}
        {user && (
          <>
            <Greeting />
            <Dashboard />
          </>
        )}
      </div>
    </main>
  )
}

function Dashboard() {
  const { toast } = useToast()
  const { cards, loading, error, stats, fetchCards, syncWithDatabase } = useCardStoreDB()

  const [query, setQuery] = useState("")
  const [network, setNetwork] = useState<CardNetwork | "全部">("全部")
  const [level, setLevel] = useState<CardLevel | "全部">("全部")
  const [sort, setSort] = useState<"recent" | "limit-asc" | "limit-desc">("recent")
  const [openForm, setOpenForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  // 用户登录后自动加载卡片数据
  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  // 显示错误信息
  useEffect(() => {
    if (error) {
      toast({
        title: "操作失败",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  const filtered = useMemo(() => {
    let list = [...cards]
    if (query.trim().length) {
      const q = query.replaceAll(" ", "").toLowerCase()
      list = list.filter((c) => {
        const digits = c.cardNumber.replaceAll(" ", "").toLowerCase()
        return digits.includes(q) || c.nickname?.toLowerCase().includes(q) || c.network.toLowerCase().includes(q)
      })
    }
    if (network !== "全部") {
      list = list.filter((c) => c.network === network)
    }
    if (level !== "全部") {
      list = list.filter((c) => c.level === level)
    }
    if (sort === "recent") {
      list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    } else if (sort === "limit-asc") {
      list.sort((a, b) => a.limit - b.limit)
    } else if (sort === "limit-desc") {
      list.sort((a, b) => b.limit - a.limit)
    }
    return list
  }, [cards, query, network, level, sort])

  function handleNew() {
    setEditId(null)
    setOpenForm(true)
  }

  function handleEdit(id: string) {
    setEditId(id)
    setOpenForm(true)
  }

  async function handleExport() {
    try {
      const dataStr = JSON.stringify({ version: 1, cards }, null, 2)
      const blob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cards-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast({ title: "导出成功", description: "已下载 JSON 备份文件。" })
    } catch {
      toast({ title: "导出失败", variant: "destructive" })
    }
  }

  function handleImportClick() {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const json = JSON.parse(text)
        if (!json || !Array.isArray(json.cards)) throw new Error("Invalid file")

        // 使用数据库存储的导入方法
        await useCardStoreDB.getState().importCards(json.cards)
        toast({ title: "导入成功", description: `已导入 ${json.cards.length} 张卡片。` })
      } catch {
        toast({ title: "导入失败", variant: "destructive" })
      }
    }
    input.click()
  }

  async function handleSync() {
    try {
      await syncWithDatabase()
      toast({ title: "同步成功", description: "数据已与数据库同步。" })
    } catch {
      toast({ title: "同步失败", variant: "destructive" })
    }
  }

  return (
    <section className="mt-4">
      <div className="rounded-3xl surface-panel surface-panel-soft surface-border-strong backdrop-blur-md ring-1 ring-[color:var(--border)] shadow-sm p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 via-fuchsia-500 to-amber-400 text-white shadow-md">
              <CreditCard className="size-5" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-semibold">iWallet</h1>
              <p className="text-xs text-muted-foreground">
                Manage your credit cards
                {stats && (
                  <span className="ml-2 text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full dark:bg-rose-900/40 dark:text-rose-200">
                    {stats.total_cards} 张卡片 · 总额度 ¥{stats.total_limit.toLocaleString()}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleNew}
              className="bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white hover:opacity-90"
              disabled={loading}
              size="sm"
            >
              <Plus className="mr-2 size-4" />
              新增卡片
            </Button>
            <Button
              onClick={handleSync}
              variant="outline"
              disabled={loading}
              size="sm"
            >
              <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} />
              同步数据
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={loading} size="sm">
                  <Settings2 className="mr-2 size-4" />
                  工具
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>数据</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleExport}>
                  <Upload className="mr-2 size-4" />
                  导出 JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImportClick}>
                  <Import className="mr-2 size-4" />
                  导入 JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => useCardStoreDB.getState().clear()}>
                  清空本地数据
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索卡号后四位 / 备注 / 组织"
              className="pl-9 h-9"
              disabled={loading}
            />
          </div>
          <CardFilters network={network} setNetwork={setNetwork} level={level} setLevel={setLevel} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={loading} size="sm">
                <Filter className="mr-2 size-4" />
                排序
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSort("recent")}>
                <SortDesc className="mr-2 size-4" />
                最近更新
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("limit-desc")}>
                <SortDesc className="mr-2 size-4" />
                额度从高到低
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort("limit-asc")}>
                <SortAsc className="mr-2 size-4" />
                额度从低到高
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

        <div className="mt-4">
          <Tabs defaultValue="all">
          <TabsList className="surface-panel surface-panel-glass ring-1 ring-[color:var(--border)] ring-opacity-70 backdrop-blur">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="favor">高额度</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <CardList cards={filtered} onEdit={handleEdit} />
          </TabsContent>
          <TabsContent value="favor" className="mt-4">
            <CardList cards={filtered.filter((c) => c.limit >= 50000)} onEdit={handleEdit} />
          </TabsContent>
          </Tabs>
        </div>

      <CardFormDialog open={openForm} onOpenChange={setOpenForm} editId={editId} />
    </section>
  )
}
