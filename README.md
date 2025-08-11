# iWallet - 信用卡管理系统

一个现代化的信用卡管理应用，集成了 Supabase 认证系统，提供完整的用户管理和数据存储功能。

## ✨ 主要功能

### 🎯 核心功能
- **信用卡管理**：添加、编辑、删除信用卡信息
- **智能搜索**：支持卡号、备注、组织等多维度搜索
- **分类筛选**：按网络类型、额度等级等分类查看
- **数据导入导出**：支持 JSON 格式的数据备份和恢复

### 🔐 认证系统
- **用户注册**：邮箱 + 密码注册
- **用户登录**：安全的邮箱密码登录
- **密码重置**：邮件验证的密码重置流程
- **会话管理**：自动会话维护和刷新
- **路由保护**：受保护页面的访问控制

### 🎨 用户界面
- **响应式设计**：支持桌面和移动设备
- **现代化 UI**：使用 shadcn/ui 组件库
- **主题切换**：支持明暗主题和系统主题
- **实时反馈**：Toast 通知和加载状态

## 🚀 技术栈

- **前端框架**：Next.js 15 + React 19
- **样式系统**：Tailwind CSS + CSS Modules
- **UI 组件**：shadcn/ui + Radix UI
- **状态管理**：Zustand + React Context
- **认证服务**：Supabase Auth
- **数据库**：Supabase PostgreSQL
- **类型安全**：TypeScript
- **包管理**：pnpm

## 📦 安装和运行

### 1. 克隆项目
```bash
git clone <repository-url>
cd card-v0-0809
```

### 2. 安装依赖
```bash
pnpm install
```

### 3. 配置环境变量
创建 `.env.local` 文件：
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key
```

### 4. 启动开发服务器
```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🔧 Supabase 配置

### 1. 创建 Supabase 项目
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 等待项目初始化完成

### 2. 获取配置信息
1. 进入 **Settings** → **API**
2. 复制 **Project URL** 和 **anon public** 密钥
3. 添加到 `.env.local` 文件

### 3. 配置认证设置
1. 进入 **Authentication** → **Settings**
2. 设置 **Site URL** 为你的域名
3. 添加重定向 URL：
   ```
   http://localhost:3000/auth/confirm
   http://localhost:3000/auth/update-password
   http://localhost:3000/protected
   ```

详细配置说明请查看 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)。

## 📱 页面结构

```
/
├── /auth/login          # 登录页面
├── /auth/sign-up        # 注册页面
├── /auth/forgot-password # 忘记密码
├── /auth/update-password # 更新密码
├── /protected           # 个人中心（需登录）
└── /test-auth          # 认证测试页面
```

## 🎯 使用指南

### 首次使用
1. 访问首页，点击右上角"注册"按钮
2. 填写邮箱和密码完成注册
3. 检查邮箱并点击验证链接
4. 使用注册的账户登录

### 管理信用卡
1. 登录后点击"新增卡片"按钮
2. 填写卡片信息（卡号、组织、额度等）
3. 使用搜索和筛选功能快速找到卡片
4. 支持编辑和删除卡片信息

### 数据备份
1. 点击右上角"工具"按钮
2. 选择"导出 JSON"下载备份文件
3. 需要恢复时选择"导入 JSON"上传文件

## 🔒 安全特性

- **密码加密**：使用 Supabase 内置的密码哈希
- **会话管理**：安全的 JWT 令牌和自动刷新
- **路由保护**：未登录用户无法访问受保护页面
- **数据验证**：前端和后端的双重数据验证
- **HTTPS 支持**：生产环境强制 HTTPS

## 🧪 测试功能

访问 `/test-auth` 页面可以测试：
- 用户认证状态
- 会话令牌信息
- 认证功能测试
- 会话刷新测试

## 🚀 部署

### Vercel 部署
1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 自动部署

### 其他平台
支持部署到任何支持 Next.js 的平台：
- Netlify
- Railway
- DigitalOcean App Platform
- 自托管服务器

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
