"use client"

import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { InfoIcon, User, Mail, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <ProtectedContent />
    </ProtectedRoute>
  )
}

function ProtectedContent() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-4xl mx-auto p-6">
      <div className="w-full">
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-4 px-5 rounded-lg flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          这是一个受保护的页面，只有登录用户才能访问
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              用户信息
            </CardTitle>
            <CardDescription>
              您的账户详细信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">邮箱：</span>
              <span>{user.email}</span>
              {user.email_confirmed_at && (
                <Badge variant="secondary" className="ml-2">已验证</Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">注册时间：</span>
              <span>{new Date(user.created_at).toLocaleDateString('zh-CN')}</span>
            </div>
            {user.last_sign_in_at && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">最后登录：</span>
                <span>{new Date(user.last_sign_in_at).toLocaleString('zh-CN')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>用户元数据</CardTitle>
            <CardDescription>
              存储在用户配置文件中的额外信息
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono p-4 rounded border bg-muted max-h-64 overflow-auto">
              {JSON.stringify(user.user_metadata, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>完整用户数据</CardTitle>
            <CardDescription>
              完整的用户对象数据（开发调试用）
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono p-4 rounded border bg-muted max-h-64 overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
