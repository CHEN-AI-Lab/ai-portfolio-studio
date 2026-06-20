#!/bin/bash
# scripts/deploy.sh — 多端部署脚本
# 目前仅支持 Web (Vercel)，后续可扩展 weapp/app
#
# 用法:
#   ./scripts/deploy.sh          # 部署到 Vercel 生产环境
#   ./scripts/deploy.sh --preview # 部署到预览环境

set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "=== 部署前检查 ==="

# 1. 运行质量门
echo ""
echo "▶ 质量门..."
bash scripts/check.sh
echo "✅ 质量门通过"

# 2. 运行结构检查
echo ""
echo "▶ 结构合规检查..."
bash scripts/check-structure.sh && echo "✅ 结构合规" || echo "⚠️  有结构警告（继续部署）"

# 3. 读取 Vercel token
if [ -z "$VERCEL_TOKEN" ]; then
  if [ -f /home/ubuntu/workspace/global.env ]; then
    VERCEL_TOKEN=$(grep -w VERCEL_TOKEN /home/ubuntu/workspace/global.env | cut -d= -f2-)
  fi
fi

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN 未设置"
  exit 1
fi

# 4. 部署
echo ""
echo "▶ 部署到 Vercel..."

if [ "$1" = "--preview" ]; then
  DEPLOY_CMD="vercel --token \"$VERCEL_TOKEN\" --yes"
else
  DEPLOY_CMD="vercel --token \"$VERCEL_TOKEN\" --yes --prod"
fi

# Vercel 部署从项目根目录进行
cd "$ROOT"
eval "$DEPLOY_CMD"

echo ""
echo "✅ 部署完成"