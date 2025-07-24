@echo off
chcp 65001 >nul
echo.
echo ========================================
echo    小说写作Agent - 《龙渊谷变》
echo    Novel Writing Agent System
echo ========================================
echo.

echo [1/3] 检查Node.js环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js环境正常

echo.
echo [2/3] 检查依赖安装...
if not exist "node_modules" (
    echo 📦 正在安装根目录依赖...
    call npm install
)

if not exist "backend\node_modules" (
    echo 📦 正在安装后端依赖...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo 📦 正在安装前端依赖...
    cd frontend
    call npm install
    cd ..
)

echo ✅ 依赖检查完成

echo.
echo [3/3] 启动服务...
echo 🚀 正在启动小说写作Agent系统...
echo.
echo 📝 前端地址: http://localhost:3000
echo 🔧 后端API: http://localhost:3001/api
echo.
echo 按 Ctrl+C 停止服务
echo.

call npm run dev
