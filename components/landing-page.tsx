"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  CreditCard,
  Search,
  Database,
  Shield,
  BarChart3,
  Cloud
} from "lucide-react"
import { CardCarousel } from "@/components/card-carousel"
import { memo } from "react"

export function LandingPage() {
  return (
    <div className="mt-4">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-8">
        <h1 className="text-5xl md:text-6xl font-bold mb-3 text-black dark:text-white">
          iWallet
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-2 font-light">
          智能信用卡管理
        </p>
        <p className="text-base text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
          轻松管理您的所有信用卡，实时追踪额度，智能筛选搜索
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            className="bg-[#b58900] hover:bg-[#cc9a00] text-white text-base px-8 py-4"
            asChild
          >
            <Link href="/auth/sign-up">
              立即注册
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black text-base px-8 py-4"
            asChild
          >
            <Link href="/auth/login">
              登录账户
            </Link>
          </Button>
        </div>
      </div>

      {/* 卡片轮播展示 */}
      <CardCarousel />

      {/* Features Section */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Feature 1 */}
          <FeatureCard
            icon={<CreditCard className="size-5" />}
            title="卡片管理"
            description="添加、编辑、删除信用卡信息"
          />
          {/* Feature 2 */}
          <FeatureCard
            icon={<Search className="size-5" />}
            title="智能搜索"
            description="快速搜索卡号、备注或组织"
          />
          {/* Feature 3 */}
          <FeatureCard
            icon={<Database className="size-5" />}
            title="数据导入导出"
            description="支持 JSON 格式备份和恢复"
          />
          {/* Feature 4 */}
          <FeatureCard
            icon={<Cloud className="size-5" />}
            title="云端同步"
            description="多设备数据实时同步"
          />
          {/* Feature 5 */}
          <FeatureCard
            icon={<BarChart3 className="size-5" />}
            title="数据统计"
            description="直观展示总额度和卡片数"
          />
          {/* Feature 6 */}
          <FeatureCard
            icon={<Shield className="size-5" />}
            title="安全可靠"
            description="端到端加密保障数据安全"
          />
        </div>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

const FeatureCard = memo(function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="text-left">
      <div className="inline-flex size-9 items-center justify-center text-[#b58900] mb-3">
        {icon}
      </div>
      <h3 className="text-base font-semibold mb-1.5 text-black dark:text-white">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
})
