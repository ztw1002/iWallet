"use client"

import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Shield, Mail, Key, User, RefreshCw } from "lucide-react"

export default function TestAuthPage() {
  return (
    <ProtectedRoute>
      <TestAuthContent />
    </ProtectedRoute>
  )
}

function TestAuthContent() {
  const { user, session } = useAuth()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const testAuth = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      
      toast({
        title: "认证测试成功",
        description: `当前用户: ${data.user?.email}`,
      })
    } catch (error) {
      toast({
        title: "认证测试失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error
      
      toast({
        title: "会话刷新成功",
        description: "用户会话已更新",
      })
    } catch (error) {
      toast({
        title: "会话刷新失败",
        description: error instanceof Error ? error.message : "未知错误",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-4xl mx-auto p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">认证功能测试</h1>
        <p className="text-muted-foreground">
          测试 Supabase 认证功能的各个特性
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              当前会话状态
            </CardTitle>
            <CardDescription>
              显示当前用户的认证信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">用户 ID：</span>
                </div>
                <code className="block text-xs bg-muted p-2 rounded break-all">
                  {user.id}
                </code>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">邮箱：</span>
                </div>
                <code className="block text-xs bg-muted p-2 rounded">
                  {user.email}
                </code>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">邮箱验证：</span>
                </div>
                {user.email_confirmed_at ? (
                  <Badge variant="secondary" className="text-green-700 bg-green-100">
                    已验证 ({new Date(user.email_confirmed_at).toLocaleString('zh-CN')})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-700 border-amber-300">
                    未验证
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">最后登录：</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {user.last_sign_in_at 
                    ? new Date(user.last_sign_in_at).toLocaleString('zh-CN')
                    : '未知'
                  }
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">会话令牌：</span>
              </div>
              <code className="block text-xs bg-muted p-2 rounded break-all">
                {session?.access_token ? `${session.access_token.slice(0, 50)}...` : '无'}
              </code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>认证功能测试</CardTitle>
            <CardDescription>
              测试各种认证相关的功能
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={testAuth} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                测试用户认证
              </Button>
              
              <Button onClick={refreshSession} disabled={loading} variant="outline">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                刷新会话
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>• 测试用户认证：验证当前用户是否有效</p>
              <p>• 刷新会话：更新用户的访问令牌</p>
            </div>
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
      </div>
    </div>
  )
}
