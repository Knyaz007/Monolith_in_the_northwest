@echo off
chcp 65001 >nul
title Система формирования заявок на стройматериалы
color 0A

echo ============================================================
echo    🏗️  СИСТЕМА ФОРМИРОВАНИЯ ЗАЯВОК НА СТРОЙМАТЕРИАЛЫ
echo ============================================================
echo.

:: Проверяем наличие Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен!
    echo.
    echo Скачайте Node.js с https://nodejs.org/
    echo или используйте полную версию setup_and_run.bat
    pause
    exit /b 1
)

echo ✅ Node.js найден: 
node -v
echo.

:: Проверяем наличие app.js
if not exist "app.js" (
    echo ❌ Файл app.js не найден!
    pause
    exit /b 1
)

:: Запускаем приложение
echo 🚀 Запуск приложения...
echo.
node app.js

echo.
echo ============================================================
echo 🎉 Программа завершена
echo Нажмите любую клавишу для выхода...
pause >nul