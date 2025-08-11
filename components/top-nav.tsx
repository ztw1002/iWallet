"use client"

import { Sparkles, User, LogOut, LogIn, UserPlus, TestTube } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function TopNav() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header className="pt-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="group inline-flex items-center gap-2">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-400 to-fuchsia-500 flex items-center justify-center text-white shadow">
            <Sparkles className="size-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight" style={{ fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif` }}>
            iWallet
          </span>
          {/* <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-600">Beta</span> */}
        </Link>

        <nav className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
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

          {/* 认证状态 */}
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                        <AvatarFallback>
                          {user.email?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || '用户'}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/protected">
                        <User className="mr-2 h-4 w-4" />
                        个人中心
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/test-auth">
                        <TestTube className="mr-2 h-4 w-4" />
                        测试认证
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/auth/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      登录
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/sign-up">
                      <UserPlus className="mr-2 h-4 w-4" />
                      注册
                    </Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
