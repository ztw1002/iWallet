"use client"

import { Sparkles } from "lucide-react"
import Link from "next/link"

export default function TopNav() {
  return (
    <header className="pt-6">
      <div className="flex items-center justify-between">
        <Link href="#" className="group inline-flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-400 to-fuchsia-500 flex items-center justify-center text-white shadow">
            <Sparkles className="size-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">iWallet</span>
          <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-600">Beta</span>
        </Link>
        <nav className="text-sm text-muted-foreground">
          <span className="sr-only">导航</span>
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="hover:text-foreground">
              概览
            </a>
            <a href="#" className="hover:text-foreground">
              统计
            </a>
            <a href="#" className="hover:text-foreground">
              设置
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
