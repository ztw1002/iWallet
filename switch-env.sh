#!/bin/bash

# 环境切换脚本
# 用于在开发和生产环境之间快速切换

echo "🔀 Supabase 环境切换工具"
echo ""
echo "请选择要连接的环境："
echo "1) 开发环境（开发/测试数据库）"
echo "2) 生产环境（线上数据库）⚠️"
echo "3) 查看当前配置"
echo "4) 退出"
echo ""

read -p "请输入选项 (1-4): " choice

case $choice in
  1)
    echo ""
    echo "📝 请输入开发环境配置："
    read -p "Project URL: " dev_url
    read -p "Anon Key: " dev_key
    
    cat > .env.local << EOF
# 开发环境配置
NEXT_PUBLIC_SUPABASE_URL=$dev_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=$dev_key
EOF
    
    echo ""
    echo "✅ 已切换到开发环境配置"
    echo "⚠️  请重启开发服务器（Ctrl+C 然后运行 pnpm dev）"
    ;;
    
  2)
    echo ""
    echo "⚠️  警告：将连接到生产数据库！"
    echo "你的所有操作都会直接影响生产数据！"
    read -p "确认继续？(yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
      echo ""
      echo "📝 请输入生产环境配置："
      read -p "Project URL: " prod_url
      read -p "Anon Key: " prod_key
      
      cat > .env.local << EOF
# 生产环境配置 - ⚠️ 注意：连接的是线上数据库
NEXT_PUBLIC_SUPABASE_URL=$prod_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=$prod_key
EOF
      
      echo ""
      echo "✅ 已切换到生产环境配置"
      echo "⚠️  请谨慎操作！完成后记得切换回开发环境"
      echo "⚠️  请重启开发服务器（Ctrl+C 然后运行 pnpm dev）"
    else
      echo "❌ 已取消"
    fi
    ;;
    
  3)
    echo ""
    echo "📋 当前配置："
    if [ -f .env.local ]; then
      echo "---"
      cat .env.local
      echo "---"
    else
      echo "❌ .env.local 文件不存在"
    fi
    ;;
    
  4)
    echo "👋 再见！"
    exit 0
    ;;
    
  *)
    echo "❌ 无效选项"
    exit 1
    ;;
esac

