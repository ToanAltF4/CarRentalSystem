@echo off
title EV Fleet - Setup New Machine
color 0A
echo ============================================
echo    EV FLEET - SETUP FOR NEW MACHINE
echo    Run this as Administrator!
echo ============================================
echo.

:: ============================================
:: STEP 0: Check if running as Admin
:: ============================================
net session >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Not running as Administrator!
    echo           Right-click this file and "Run as administrator"
    echo.
    pause
    exit /b 1
)

:: ============================================
:: STEP 1: Install Scoop (package manager)
:: ============================================
where scoop >nul 2>&1
if errorlevel 1 (
    echo [1/6] Installing Scoop package manager...
    powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force; iwr -useb get.scoop.sh | iex"
    if errorlevel 1 (
        echo [ERROR] Scoop install failed. Try manually:
        echo         Open PowerShell and run:
        echo         Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
        echo         iwr -useb get.scoop.sh ^| iex
        pause
        exit /b 1
    )
    :: Refresh PATH
    set "PATH=%USERPROFILE%\scoop\shims;%PATH%"
) else (
    echo [1/6] Scoop already installed, skipping.
)

:: ============================================
:: STEP 2: Install Java 21
:: ============================================
java -version >nul 2>&1
if errorlevel 1 (
    echo [2/6] Installing Java 21 (Temurin)...
    scoop bucket add java >nul 2>&1
    scoop install temurin21-jdk
) else (
    echo [2/6] Java already installed, skipping.
)

:: ============================================
:: STEP 3: Install Maven
:: ============================================
mvn -version >nul 2>&1
if errorlevel 1 (
    echo [3/6] Installing Maven...
    scoop install maven
) else (
    echo [3/6] Maven already installed, skipping.
)

:: ============================================
:: STEP 4: Install Node.js
:: ============================================
node -v >nul 2>&1
if errorlevel 1 (
    echo [4/6] Installing Node.js LTS...
    scoop install nodejs-lts
) else (
    echo [4/6] Node.js already installed, skipping.
)

:: ============================================
:: STEP 5: Install cloudflared
:: ============================================
cloudflared version >nul 2>&1
if errorlevel 1 (
    echo [5/6] Installing cloudflared...
    scoop install cloudflared
) else (
    echo [5/6] cloudflared already installed, skipping.
)

:: ============================================
:: STEP 6: Install Git
:: ============================================
git --version >nul 2>&1
if errorlevel 1 (
    echo [6/6] Installing Git...
    scoop install git
) else (
    echo [6/6] Git already installed, skipping.
)

:: ============================================
:: VERIFY
:: ============================================
echo.
echo ============================================
echo    VERIFICATION
echo ============================================
echo.

echo Java:
java -version 2>&1 | findstr /i "version"
echo.

echo Maven:
mvn -version 2>&1 | findstr /i "Apache Maven"
echo.

echo Node.js:
node -v 2>&1
echo.

echo npm:
npm -v 2>&1
echo.

echo cloudflared:
cloudflared version 2>&1 | findstr /i "cloudflared"
echo.

echo Git:
git --version 2>&1
echo.

echo ============================================
echo    SETUP COMPLETE!
echo ============================================
echo.
echo    Next steps:
echo    1. Clone the repo:
echo       git clone https://github.com/YOUR_REPO/CarRentalSystem.git
echo.
echo    2. Setup Cloudflare Tunnel (one-time):
echo       cloudflared tunnel login
echo       (Select fpt.tokyo in browser)
echo.
echo    3. Copy tunnel config:
echo       Copy .cloudflared folder from original machine
echo       to C:\Users\YOUR_USER\.cloudflared\
echo.
echo    4. Double-click start.bat to run!
echo.
pause
