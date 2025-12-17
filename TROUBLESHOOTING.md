# 故障排除指南

## 🔍 获取卡片失败问题

### 问题症状

- 登录后看不到任何卡片
- 控制台显示 "获取卡片失败" 错误
- Toast 提示显示错误信息

### 常见原因和解决方案

#### 1. 数据库表不存在

**错误信息**：
```
获取卡片失败: relation "user_cards" does not exist
```

**解决方案**：

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 打开项目中的 `supabase-setup.sql` 文件
5. 复制全部内容到 SQL Editor
6. 点击 **Run** 执行脚本
7. 等待执行完成（应该看到 "Success" 提示）

**验证**：
- 进入 **Table Editor**
- 应该能看到 `user_cards` 表
- 表应该是空的（除非你之前添加过数据）

#### 2. RLS (Row Level Security) 策略未配置

**错误信息**：
```
获取卡片失败: permission denied for table user_cards
```

**解决方案**：

确保 `supabase-setup.sql` 脚本已完整执行，特别是以下部分：

```sql
-- 启用 RLS
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;

-- 创建 RLS 策略
CREATE POLICY "Users can view their own cards" ON user_cards
  FOR SELECT USING (auth.uid() = user_id);
```

**检查 RLS 策略**：

在 Supabase SQL Editor 中运行：

```sql
-- 检查 RLS 是否启用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_cards';

-- 检查策略是否存在
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'user_cards';
```

如果策略不存在，重新运行 `supabase-setup.sql` 脚本。

#### 3. 用户未登录

**错误信息**：
```
未登录，请先登录后再获取卡片
```

**解决方案**：

1. 确保你已经登录
2. 检查浏览器控制台是否有认证错误
3. 尝试退出登录后重新登录
4. 清除浏览器缓存和 localStorage，然后重新登录

#### 4. 统计视图不存在

**错误信息**：
```
获取统计信息失败: relation "user_card_stats" does not exist
```

**解决方案**：

这个错误不会阻止卡片显示，但统计信息会显示为 0。要修复：

1. 在 Supabase SQL Editor 中运行以下 SQL：

```sql
CREATE OR REPLACE VIEW public.user_card_stats
WITH (security_invoker = on) AS
SELECT
  user_id,
  COUNT(*) AS total_cards,
  SUM(limit_amount) AS total_limit,
  AVG(limit_amount) AS avg_limit,
  MAX(limit_amount) AS max_limit,
  MIN(limit_amount) AS min_limit
FROM public.user_cards
WHERE user_id = auth.uid()
GROUP BY user_id;

GRANT SELECT ON public.user_card_stats TO authenticated;
```

或者直接重新运行完整的 `supabase-setup.sql` 脚本。

#### 5. 环境变量未配置

**错误信息**：
```
Supabase 环境变量未配置
```

**解决方案**：

参考 [ENV_SETUP.md](./ENV_SETUP.md) 配置环境变量。

## 🔧 快速诊断步骤

### 步骤 1：检查数据库表

在 Supabase SQL Editor 中运行：

```sql
-- 检查表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'user_cards';

-- 如果表存在，检查结构
\d user_cards
```

### 步骤 2：检查 RLS 配置

```sql
-- 检查 RLS 是否启用
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_cards';

-- 检查策略
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'user_cards';
```

### 步骤 3：检查用户登录状态

在浏览器控制台运行：

```javascript
// 检查 Supabase 客户端
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
)

// 检查用户
supabase.auth.getUser().then(({ data, error }) => {
  console.log('User:', data.user)
  console.log('Error:', error)
})
```

### 步骤 4：测试查询

在 Supabase SQL Editor 中，以你的用户身份测试：

```sql
-- 获取当前用户ID（需要先登录应用）
-- 然后在 SQL Editor 中运行（替换 YOUR_USER_ID）
SELECT * FROM user_cards WHERE user_id = 'YOUR_USER_ID';
```

## 🚀 完整重置步骤

如果以上方法都不行，可以尝试完全重置：

### 1. 删除现有表（谨慎操作！会删除所有数据）

```sql
-- 删除视图
DROP VIEW IF EXISTS public.user_card_stats;

-- 删除表（会删除所有数据）
DROP TABLE IF EXISTS public.user_cards CASCADE;
```

### 2. 重新运行设置脚本

在 Supabase SQL Editor 中运行完整的 `supabase-setup.sql` 脚本。

### 3. 验证设置

```sql
-- 验证表存在
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'user_cards';

-- 验证 RLS 启用
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'user_cards';

-- 验证策略存在
SELECT policyname FROM pg_policies 
WHERE tablename = 'user_cards';
```

### 4. 重启应用

```bash
# 停止开发服务器
Ctrl+C

# 清除 Next.js 缓存
rm -rf .next

# 重新启动
pnpm dev
```

## 📊 检查清单

在报告问题前，请确认：

- [ ] 已运行 `supabase-setup.sql` 脚本
- [ ] `user_cards` 表存在
- [ ] RLS 已启用
- [ ] RLS 策略已创建
- [ ] 用户已登录
- [ ] 环境变量已正确配置
- [ ] 浏览器控制台没有其他错误
- [ ] 已尝试清除缓存并重新登录

## 🐛 调试技巧

### 1. 启用详细日志

在浏览器控制台中查看详细的错误信息：

```javascript
// 在浏览器控制台运行
localStorage.setItem('debug', 'true')
```

### 2. 检查网络请求

1. 打开浏览器开发者工具（F12）
2. 进入 **Network** 标签
3. 刷新页面
4. 查找对 Supabase 的请求
5. 检查请求和响应详情

### 3. 检查 Supabase 日志

1. 登录 Supabase Dashboard
2. 进入 **Logs** → **Postgres Logs**
3. 查看最近的错误日志

## 📞 获取帮助

如果以上方法都无法解决问题：

1. 检查 [Supabase 状态页面](https://status.supabase.com/)
2. 查看 [Supabase 文档](https://supabase.com/docs)
3. 在 [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions) 提问

## 📝 常见错误代码

| 错误代码 | 含义 | 解决方案 |
|---------|------|---------|
| PGRST116 | 表/视图不存在 | 运行 supabase-setup.sql |
| 42501 | 权限不足 | 检查 RLS 策略 |
| 23503 | 外键约束错误 | 确保用户已登录 |
| 23514 | 检查约束失败 | 检查数据格式（如卡号长度） |

