# Supabase 邮件登录功能设置指南

## 功能特性

本项目已经实现了完整的 Supabase 邮件登录功能，包括：

- ✅ 用户注册（邮箱 + 密码）
- ✅ 用户登录（邮箱 + 密码）
- ✅ 忘记密码（邮件重置）
- ✅ 密码更新
- ✅ 邮件验证
- ✅ 会话管理
- ✅ 路由保护

## 环境变量配置

在项目根目录创建 `.env.local` 文件，添加以下配置：

```bash
# Supabase Configuration
# 从你的 Supabase 项目仪表板获取这些值
# https://supabase.com/dashboard/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key

# 可选：服务角色密钥（用于服务器端操作）
# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Supabase 项目设置

### 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目或使用现有项目
3. 等待项目初始化完成

### 2. 获取项目配置

1. 在项目仪表板中，进入 **Settings** → **API**
2. 复制 **Project URL** 到 `NEXT_PUBLIC_SUPABASE_URL`
3. 复制 **anon public** 密钥到 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`

### 3. 配置认证设置

1. 进入 **Authentication** → **Settings**
2. 在 **Site URL** 中添加你的应用域名
3. 在 **Redirect URLs** 中添加以下 URL：
   ```
   http://localhost:3000/auth/confirm
   http://localhost:3000/auth/update-password
   http://localhost:3000/protected
   ```

### 4. 配置邮件模板（可选）

1. 进入 **Authentication** → **Email Templates**
2. 自定义确认邮件、密码重置邮件等模板
3. 支持多语言和 HTML 格式

## 使用方法

### 启动开发服务器

```bash
pnpm dev
```

### 访问认证页面

- 登录：`/auth/login`
- 注册：`/auth/sign-up`
- 忘记密码：`/auth/forgot-password`

### 受保护的路由

- 受保护页面：`/protected`
- 需要登录才能访问

## 文件结构

```
├── components/
│   ├── login-form.tsx          # 登录表单
│   ├── sign-up-form.tsx        # 注册表单
│   ├── forgot-password-form.tsx # 忘记密码表单
│   └── update-password-form.tsx # 更新密码表单
├── app/auth/
│   ├── login/                  # 登录页面
│   ├── sign-up/                # 注册页面
│   ├── forgot-password/        # 忘记密码页面
│   ├── update-password/        # 更新密码页面
│   ├── confirm/                # 邮件确认路由
│   └── error/                  # 错误页面
├── lib/supabase/
│   ├── client.ts               # 客户端 Supabase 实例
│   ├── server.ts               # 服务端 Supabase 实例
│   └── middleware.ts           # 中间件配置
└── middleware.ts                # Next.js 中间件
```

## 自定义和扩展

### 添加社交媒体登录

在 Supabase 仪表板中启用 OAuth 提供商（Google、GitHub 等）

### 添加用户资料

扩展用户表以包含更多字段（姓名、头像等）

### 添加角色和权限

使用 Supabase 的 Row Level Security (RLS) 实现细粒度权限控制

## 故障排除

### 常见问题

1. **环境变量未设置**：确保 `.env.local` 文件存在且包含正确的值
2. **邮件未发送**：检查 Supabase 项目的邮件配置和 SMTP 设置
3. **重定向错误**：确保重定向 URL 在 Supabase 仪表板中正确配置
4. **会话过期**：检查中间件配置和 cookie 设置

### 调试技巧

1. 检查浏览器控制台的错误信息
2. 查看 Supabase 仪表板中的日志
3. 使用 Supabase 客户端调试工具

## 更多资源

- [Supabase 文档](https://supabase.com/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Supabase Auth 指南](https://supabase.com/docs/guides/auth)
