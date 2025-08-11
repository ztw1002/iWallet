# Supabase 数据库配置指南

本文档详细说明如何配置 Supabase 数据库以支持用户卡片管理功能。

## 🗄️ 数据库表结构

### 用户卡片表 (user_cards)

这是核心表，存储用户的所有信用卡信息：

```sql
CREATE TABLE user_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_number TEXT NOT NULL,
  nickname TEXT,
  network TEXT NOT NULL,
  level TEXT NOT NULL,
  limit_amount INTEGER NOT NULL,
  expiry_date DATE,
  cardholder_name TEXT,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 字段说明

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | UUID | 主键 | 自动生成 |
| `user_id` | UUID | 用户ID | 外键，关联 auth.users |
| `card_number` | TEXT | 卡号 | 必填，13-19位数字 |
| `nickname` | TEXT | 卡片备注 | 可选，最大30字符 |
| `network` | TEXT | 卡组织 | 必填，如 Visa、Mastercard |
| `level` | TEXT | 卡片等级 | 必填，如 Standard、Gold |
| `limit_amount` | INTEGER | 信用额度 | 必填，大于0 |
| `expiry_date` | DATE | 有效期 | 可选 |
| `cardholder_name` | TEXT | 持卡人姓名 | 可选，最大50字符 |
| `notes` | TEXT | 备注信息 | 可选，最大200字符 |
| `is_favorite` | BOOLEAN | 是否收藏 | 默认 false |
| `created_at` | TIMESTAMP | 创建时间 | 自动生成 |
| `updated_at` | TIMESTAMP | 更新时间 | 自动更新 |

## 🚀 快速设置

### 1. 在 Supabase 仪表板中运行 SQL

1. 登录 [Supabase 仪表板](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 复制并粘贴 `supabase-setup.sql` 文件中的内容
5. 点击 **Run** 执行

### 2. 验证表创建

执行完成后，进入 **Table Editor** 查看是否成功创建了 `user_cards` 表。

## 🔒 安全配置

### Row Level Security (RLS)

系统自动启用了 RLS，确保用户只能访问自己的数据：

```sql
-- 用户只能查看自己的卡片
CREATE POLICY "Users can view their own cards" ON user_cards
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能创建自己的卡片
CREATE POLICY "Users can insert their own cards" ON user_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的卡片
CREATE POLICY "Users can update their own cards" ON user_cards
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的卡片
CREATE POLICY "Users can delete their own cards" ON user_cards
  FOR DELETE USING (auth.uid() = user_id);
```

### 数据验证约束

```sql
-- 额度必须大于0
ALTER TABLE user_cards 
  ADD CONSTRAINT check_limit_amount CHECK (limit_amount > 0);

-- 卡号长度限制
ALTER TABLE user_cards 
  ADD CONSTRAINT check_card_number_length CHECK (length(card_number) >= 13 AND length(card_number) <= 19);
```

## 📊 性能优化

### 索引创建

为了提高查询性能，系统自动创建了以下索引：

```sql
-- 用户ID索引（主要查询）
CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);

-- 网络类型索引（筛选查询）
CREATE INDEX idx_user_cards_network ON user_cards(network);

-- 等级索引（筛选查询）
CREATE INDEX idx_user_cards_level ON user_cards(level);

-- 创建时间索引（排序查询）
CREATE INDEX idx_user_cards_created_at ON user_cards(created_at);
```

### 统计视图

创建了统计视图用于快速获取用户卡片统计信息：

```sql
CREATE VIEW user_card_stats AS
SELECT 
  user_id,
  COUNT(*) as total_cards,
  SUM(limit_amount) as total_limit,
  AVG(limit_amount) as avg_limit,
  MAX(limit_amount) as max_limit,
  MIN(limit_amount) as min_limit
FROM user_cards
GROUP BY user_id;
```

## 🔄 数据同步

### 自动同步

系统会在以下情况下自动与数据库同步：

1. **用户登录后**：自动加载用户的卡片数据
2. **添加卡片**：实时保存到数据库
3. **更新卡片**：实时更新数据库
4. **删除卡片**：实时从数据库删除
5. **手动同步**：用户可以点击"同步数据"按钮

### 离线支持

即使网络断开，系统也能：

1. 在本地缓存中显示卡片
2. 记录用户的操作
3. 网络恢复后自动同步

## 🧪 测试数据

### 创建测试卡片

```sql
-- 替换 'your-user-id-here' 为实际的用户ID
INSERT INTO user_cards (
  user_id, 
  card_number, 
  nickname, 
  network, 
  level, 
  limit_amount, 
  expiry_date, 
  cardholder_name, 
  notes
) VALUES 
  ('your-user-id-here', '1234567890123456', '我的主卡', 'Visa', 'Gold', 50000, '2025-12-31', '张三', '日常消费使用'),
  ('your-user-id-here', '9876543210987654', '备用卡', 'Mastercard', 'Platinum', 100000, '2026-06-30', '张三', '大额消费备用');
```

### 获取用户ID

```sql
-- 查看所有用户
SELECT id, email, created_at FROM auth.users;

-- 查看特定用户的卡片
SELECT * FROM user_cards WHERE user_id = 'user-id-here';
```

## 🚨 故障排除

### 常见问题

#### 1. 表不存在错误

**错误信息**：`relation "user_cards" does not exist`

**解决方案**：
- 确保已运行 `supabase-setup.sql` 脚本
- 检查是否在正确的数据库中执行
- 验证表名拼写是否正确

#### 2. 权限错误

**错误信息**：`permission denied for table user_cards`

**解决方案**：
- 确保已启用 RLS
- 检查 RLS 策略是否正确创建
- 验证用户是否已登录

#### 3. 外键约束错误

**错误信息**：`insert or update on table "user_cards" violates foreign key constraint`

**解决方案**：
- 确保用户已通过认证
- 检查 `auth.users` 表是否存在
- 验证用户ID是否正确

### 调试技巧

#### 1. 检查表结构

```sql
-- 查看表结构
\d user_cards

-- 查看表的约束
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'user_cards'::regclass;
```

#### 2. 检查 RLS 策略

```sql
-- 查看 RLS 策略
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_cards';
```

#### 3. 测试权限

```sql
-- 以特定用户身份测试查询
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claim.sub" TO 'user-id-here';
SELECT * FROM user_cards;
```

## 📈 监控和维护

### 性能监控

```sql
-- 查看表大小
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename = 'user_cards';

-- 查看索引使用情况
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename = 'user_cards';
```

### 数据清理

```sql
-- 删除过期卡片（可选）
DELETE FROM user_cards 
WHERE expiry_date < CURRENT_DATE - INTERVAL '1 year';

-- 清理软删除的记录（如果有的话）
-- 这取决于你的具体需求
```

## 🔗 相关文档

- [Supabase 数据库文档](https://supabase.com/docs/guides/database)
- [PostgreSQL RLS 指南](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase 认证指南](https://supabase.com/docs/guides/auth)
- [Next.js 集成指南](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

## 📞 技术支持

如果在配置过程中遇到问题：

1. 查看 [Supabase 社区论坛](https://github.com/supabase/supabase/discussions)
2. 检查 [Supabase 状态页面](https://status.supabase.com/)
3. 提交 [GitHub Issue](https://github.com/supabase/supabase/issues)

---

**注意**：在生产环境中使用前，请确保：
- 备份所有重要数据
- 在测试环境中验证配置
- 设置适当的监控和告警
- 制定数据恢复计划
