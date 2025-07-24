#!/bin/bash

echo ""
echo "========================================"
echo "   小说写作Agent - 《龙渊谷变》"
echo "   Novel Writing Agent System"
echo "========================================"
echo ""

echo "[1/3] 检查Node.js环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js环境正常 ($(node --version))"

echo ""
echo "[2/3] 检查依赖安装..."
if [ ! -d "node_modules" ]; then
    echo "📦 正在安装根目录依赖..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 正在安装后端依赖..."
    cd backend
    npm install
    cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 正在安装前端依赖..."
    cd frontend
    npm install
    cd ..
fi

echo "✅ 依赖检查完成"

echo ""
echo "[3/3] 启动服务..."
echo "🚀 正在启动小说写作Agent系统..."
echo ""
echo "📝 前端地址: http://localhost:3000"
echo "🔧 后端API: http://localhost:3001/api"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

npm run dev
