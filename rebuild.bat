@echo off
title EV Fleet - Rebuild
color 0A
echo ============================================
echo    EV FLEET - REBUILD
echo ============================================

set "PROJECT_DIR=%~dp0"

echo [1/2] Rebuilding Backend...
cd /d "%PROJECT_DIR%be"
call mvn clean package -DskipTests -B
if errorlevel 1 (
    echo [ERROR] Backend build failed!
    pause
    exit /b 1
)
echo [OK] Backend rebuilt.

echo [2/2] Rebuilding Frontend...
cd /d "%PROJECT_DIR%fe"
set "VITE_API_BASE_URL=https://api.fpt.tokyo/api"
if exist "dist" rmdir /s /q dist
call npm run build
if errorlevel 1 (
    echo [ERROR] Frontend build failed!
    pause
    exit /b 1
)
echo [OK] Frontend rebuilt.

echo.
echo Rebuild complete! Run start.bat to launch.
pause
