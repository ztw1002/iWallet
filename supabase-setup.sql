-- Supabase 数据库设置脚本
-- 在 Supabase 仪表板的 SQL Editor 中运行此脚本

-- 1. 创建用户卡片表
CREATE TABLE IF NOT EXISTS user_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_number TEXT NOT NULL,
  nickname TEXT,
  network TEXT NOT NULL,
  level TEXT NOT NULL,
  color TEXT,
  annual_fee_waived BOOLEAN NOT NULL DEFAULT true,
  annual_fee_condition TEXT,
  limit_amount INTEGER NOT NULL,
  expiry_date DATE,
  cardholder_name TEXT,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_network ON user_cards(network);
CREATE INDEX IF NOT EXISTS idx_user_cards_level ON user_cards(level);
CREATE INDEX IF NOT EXISTS idx_user_cards_created_at ON user_cards(created_at);

-- 3. 启用 Row Level Security (RLS)
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略
-- 用户只能访问自己的卡片
CREATE POLICY "Users can view their own cards" ON user_cards
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能插入自己的卡片
CREATE POLICY "Users can insert their own cards" ON user_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的卡片
CREATE POLICY "Users can update their own cards" ON user_cards
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的卡片
CREATE POLICY "Users can delete their own cards" ON user_cards
  FOR DELETE USING (auth.uid() = user_id);

-- 5. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_cards_updated_at
  BEFORE UPDATE ON user_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. 创建网络和等级枚举类型（可选）
CREATE TYPE card_network AS ENUM ('Visa', 'Mastercard', 'American Express', 'Discover', 'UnionPay', 'JCB', '其他');
CREATE TYPE card_level AS ENUM ('普通', '金卡', '白金卡', '钻石卡', '无限卡', '其他');

-- 7. 如果需要，可以添加约束
ALTER TABLE user_cards 
  ADD CONSTRAINT check_limit_amount CHECK (limit_amount > 0),
  ADD CONSTRAINT check_card_number_length CHECK (length(card_number) >= 13 AND length(card_number) <= 19);

-- 8. 创建示例数据（可选，用于测试）
-- INSERT INTO user_cards (user_id, card_number, nickname, network, level, limit_amount, expiry_date, cardholder_name, notes)
-- VALUES 
--   ('your-user-id-here', '1234567890123456', '我的主卡', 'Visa', '金卡', 50000, '2025-12-31', '张三', '日常消费使用'),
--   ('your-user-id-here', '9876543210987654', '备用卡', 'Mastercard', '白金卡', 100000, '2026-06-30', '张三', '大额消费备用');

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

-- 10. 视图权限（无需对视图启用 RLS，RLS 只作用于表/物化视图）
GRANT SELECT ON public.user_card_stats TO authenticated;

-- 完成！现在你的数据库已经配置好了
-- 记得在 Supabase 仪表板中运行这个脚本
