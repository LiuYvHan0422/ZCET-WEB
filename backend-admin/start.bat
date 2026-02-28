@echo off
chcp 65001 >nul
title 管理后台开发服务器
echo ========================================
echo   启动管理后台开发服务器
echo ========================================
echo.

REM 获取当前脚本所在目录
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo [INFO] 当前目录: %CD%
echo [INFO] 端口号: 8010
echo.

REM 检查并安装依赖（使用清华镜像源）
if not exist node_modules (
    echo [INFO] 正在使用清华镜像源安装依赖...
    npm install --registry=https://registry.npmmirror.com
    if errorlevel 1 (
        echo [ERROR] 依赖安装失败！
        pause
        exit /b 1
    )
    echo.
) else (
    echo [INFO] node_modules 已存在，跳过安装
    echo.
)

echo [INFO] 正在启动开发服务器...
echo [INFO] 请访问: http://localhost:8010
echo [INFO] 按 Ctrl+C 可停止服务器
echo.

npm run dev
if errorlevel 1 (
    echo [ERROR] 启动失败！
    pause
    exit /b 1
)
