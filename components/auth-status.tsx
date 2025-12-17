"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, LogIn, UserPlus, Shield } from "lucide-react"
import Link from "next/link"

export function AuthStatus() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Card className="surface-panel surface-panel-soft surface-border-strong backdrop-blur-md ring-1 ring-[color:var(--border)] ring-opacity-60">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500"></div>
            <span className="ml-3 text-muted-foreground">检查认证状态...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (user) {
    return (
      <Card className="surface-panel surface-panel-soft surface-border-strong backdrop-blur-md ring-1 ring-[color:var(--border)] ring-opacity-60">
        <CardHeader className="text-right">
          <CardTitle className="flex items-center gap-2 justify-end">
            <Shield className="h-5 w-5 text-green-600" />
            已登录
          </CardTitle>
          <CardDescription className="text-right">
            欢迎回来，{user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-right">
          {/* <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">用户 ID：</span>
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {user.id.slice(0, 8)}...
            </code>
          </div> */}
          <div className="flex items-center gap-2 justify-end">
            <span className="text-sm text-muted-foreground">邮箱状态：</span>
            {user.email_confirmed_at ? (
              <Badge variant="secondary" className="text-green-700 bg-green-100">
                已验证
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-700 border-amber-300">
                未验证
              </Badge>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button asChild size="sm">
              {/* <Link href="/protected">
                <Shield className="mr-2 h-4 w-4" />
                个人中心
              </Link> */}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="surface-panel surface-panel-soft surface-border-strong backdrop-blur-md ring-1 ring-[color:var(--border)] ring-opacity-60">
      <CardHeader className="text-right">
        <CardTitle className="flex items-center gap-2 justify-end">
          <LogIn className="h-5 w-5 text-amber-600" />
          未登录
        </CardTitle>
        <CardDescription className="text-right">
          登录以访问更多功能
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-right">
        <div className="text-sm text-muted-foreground">
          登录后您可以：
        </div>
        <ul className="text-sm text-muted-foreground space-y-1 text-right">
          <li>• 访问个人中心</li>
          <li>• 管理账户设置</li>
          <li>• 查看使用统计</li>
        </ul>
        <div className="flex gap-2 justify-end">
          <Button asChild size="sm">
            <Link href="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              登录
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm">
            <Link href="/auth/sign-up">
              <UserPlus className="mr-2 h-4 w-4" />
              注册
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
