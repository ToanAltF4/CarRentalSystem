@echo off
title EV Fleet - Tunnel Setup (One-time)
color 0E
echo ============================================
echo    CLOUDFLARE TUNNEL SETUP (One-time)
echo ============================================
echo.

set "CF_DIR=%USERPROFILE%\.cloudflared"
set "TUNNEL_ID=4a1b7b96-8713-4861-8284-fe9c17688055"

:: Check cloudflared
cloudflared version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] cloudflared not installed!
    echo         Run: scoop install cloudflared
    pause
    exit /b 1
)

:: Check if already configured
if exist "%CF_DIR%\config-evfleet.yml" (
    echo [INFO] config-evfleet.yml already exists.
    echo        Delete it first if you want to reconfigure.
    pause
    exit /b 0
)

:: Step 1: Login
echo [1/3] Logging into Cloudflare...
echo       Browser will open - select domain "fpt.tokyo"
echo.
cloudflared tunnel login
if errorlevel 1 (
    echo [ERROR] Login failed!
    pause
    exit /b 1
)
echo [OK] Logged in.

:: Step 2: Check if credentials file exists
if not exist "%CF_DIR%\%TUNNEL_ID%.json" (
    echo.
    echo [WARNING] Tunnel credentials not found!
    echo          You need to copy this file from the original machine:
    echo          %CF_DIR%\%TUNNEL_ID%.json
    echo.
    echo          Ask the project owner for this file.
    pause
    exit /b 1
)

:: Step 3: Create config
echo [2/3] Creating tunnel config...
(
echo tunnel: %TUNNEL_ID%
echo credentials-file: %CF_DIR%\%TUNNEL_ID%.json
echo.
echo ingress:
echo   - hostname: api.fpt.tokyo
echo     service: http://localhost:8080
echo   - hostname: fpt.tokyo
echo     service: http://localhost:3000
echo   - hostname: www.fpt.tokyo
echo     service: http://localhost:3000
echo   - hostname: kimngan.site
echo     service: http://localhost:5000
echo   - hostname: www.kimngan.site
echo     service: http://localhost:5000
echo   - service: http_status:404
) > "%CF_DIR%\config-evfleet.yml"

echo [OK] Config created at %CF_DIR%\config-evfleet.yml

:: Step 3: Validate
echo [3/3] Validating config...
cloudflared tunnel --config "%CF_DIR%\config-evfleet.yml" ingress validate
if errorlevel 1 (
    echo [ERROR] Config validation failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo    TUNNEL SETUP COMPLETE!
echo ============================================
echo    Now run start.bat to launch everything.
echo ============================================
pause
