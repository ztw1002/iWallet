import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

// OTP验证路由处理函数 - 用于验证邮箱验证链接
export async function GET(request: NextRequest) {
  // 从URL查询参数中提取验证所需的信息
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash"); // 获取加密的验证令牌
  const type = searchParams.get("type") as EmailOtpType | null; // 获取OTP类型（如signup, recovery, invitation等）
  const next = searchParams.get("next") ?? "/"; // 获取验证成功后重定向的URL，默认为首页

  // 检查是否提供了必要的验证参数
  if (token_hash && type) {
    // 创建Supabase客户端实例
    const supabase = await createClient();

    // 调用Supabase的verifyOtp方法验证一次性密码
    const { error } = await supabase.auth.verifyOtp({
      type, // OTP验证类型
      token_hash, // 验证令牌
    });
    
    // 验证成功处理
    if (!error) {
      // 验证成功：重定向用户到指定的重定向URL或应用根目录
      redirect(next);
    } else {
      // 验证失败：重定向到错误页面并携带错误信息
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  // 参数缺失：重定向到错误页面
  redirect(`/auth/error?error=No token hash or type`);
}