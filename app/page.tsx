"use client"

import { useMemo, useState } from "react"
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
import { CreditCard, Filter, Import, Plus, Search, Settings2, SortAsc, SortDesc, Upload } from "lucide-react"
import TopNav from "@/components/top-nav"
import { CardFilters } from "@/components/cards/filters"
import { CardList } from "@/components/cards/card-list"
import { useCardStore } from "@/components/cards/card-store"
import { CardFormDialog } from "@/components/cards/card-form"
import type { CardLevel, CardNetwork } from "@/components/cards/card-types"
import { useToast } from "@/hooks/use-toast"

export default function Page() {
  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-rose-50 via-fuchsia-50 to-amber-50">
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <TopNav />
        <Dashboard />
      </div>
    </main>
  )
}

function Dashboard() {
  const { toast } = useToast()
  const cards = useCardStore((s) => s.cards)

  const [query, setQuery] = useState("")
  const [network, setNetwork] = useState<CardNetwork | "全部">("全部")
  const [level, setLevel] = useState<CardLevel | "全部">("全部")
  const [sort, setSort] = useState<"recent" | "limit-asc" | "limit-desc">("recent")
  const [openForm, setOpenForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

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
        useCardStore.getState().importCards(json.cards)
        toast({ title: "导入成功", description: `已导入 ${json.cards.length} 张卡片。` })
      } catch {
        toast({ title: "导入失败", variant: "destructive" })
      }
    }
    input.click()
  }

  return (
    <section className="mt-6">
      <div className="rounded-3xl bg-white/70 backdrop-blur-md ring-1 ring-rose-100 shadow-sm p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 via-fuchsia-500 to-amber-400 text-white shadow-md">
              <CreditCard className="size-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">银行卡管理</h1>
              <p className="text-sm text-muted-foreground">管理你的卡组织、等级与额度</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleNew}
              className="bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white hover:opacity-90"
            >
              <Plus className="mr-2 size-4" />
              新增卡片
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
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
                <DropdownMenuItem onClick={() => useCardStore.getState().clear()}>清空本地数据</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator className="my-5" />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索卡号后四位 / 昵称 / 组织"
              className="pl-9"
            />
          </div>
          <CardFilters network={network} setNetwork={setNetwork} level={level} setLevel={setLevel} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
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

      <div className="mt-6">
        <Tabs defaultValue="all">
          <TabsList className="bg-white/70 backdrop-blur ring-1 ring-rose-100">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="favor">高额度</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <CardList cards={filtered} onEdit={handleEdit} />
          </TabsContent>
          <TabsContent value="favor" className="mt-6">
            <CardList cards={filtered.filter((c) => c.limit >= 50000)} onEdit={handleEdit} />
          </TabsContent>
        </Tabs>
      </div>

      <CardFormDialog open={openForm} onOpenChange={setOpenForm} editId={editId} />
    </section>
  )
}
