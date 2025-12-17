import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "缺少 Supabase 环境变量配置！\n\n" +
      "请在项目根目录创建 .env.local 文件并添加以下配置：\n" +
      "NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url\n" +
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_anon_key\n\n" +
      "获取这些值：https://supabase.com/dashboard/project/_/settings/api"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
