@echo off
title EV Fleet - Car Rental System
color 0A
echo ============================================
echo    EV FLEET - CAR RENTAL SYSTEM LAUNCHER
echo ============================================
echo.

:: Set project root and paths (auto-detect user)
set "PROJECT_DIR=%~dp0"
set "BE_DIR=%PROJECT_DIR%be"
set "FE_DIR=%PROJECT_DIR%fe"
set "CLOUDFLARED_CONFIG=%USERPROFILE%\.cloudflared\config-evfleet.yml"

:: Auto-detect Java 21 (prefer Scoop install over system Java)
set "JAVA_CMD=java"
set "SCOOP_JAVA=%USERPROFILE%\scoop\apps\temurin21-jdk\current\bin\java.exe"
if exist "%SCOOP_JAVA%" set "JAVA_CMD=%SCOOP_JAVA%"

echo [INFO] Java: %JAVA_CMD%

:: Check prerequisites
call "%JAVA_CMD%" -version >nul 2>&1
if errorlevel 1 ( echo [ERROR] Java not found! Run setup-new-machine.bat first. & pause & exit /b 1 )
node -v >nul 2>&1
if errorlevel 1 ( echo [ERROR] Node.js not found! Run setup-new-machine.bat first. & pause & exit /b 1 )
cloudflared version >nul 2>&1
if errorlevel 1 ( echo [ERROR] cloudflared not found! Run setup-new-machine.bat first. & pause & exit /b 1 )

if not exist "%CLOUDFLARED_CONFIG%" (
    echo [ERROR] Cloudflare tunnel config not found at: %CLOUDFLARED_CONFIG%
    echo         See SETUP-GUIDE.md for tunnel setup instructions.
    pause
    exit /b 1
)

echo [OK] All prerequisites detected.
echo.

:: ============================================
:: STEP 1: Build Backend (only if JAR missing)
:: ============================================
if not exist "%BE_DIR%\target\car-rental-system-be-0.0.1-SNAPSHOT.jar" (
    echo [1/3] Building Backend... this may take a few minutes
    cd /d "%BE_DIR%"
    call mvnw.cmd clean package -DskipTests -B -q
    if errorlevel 1 (
        echo       Trying mvn instead of mvnw...
        call mvn clean package -DskipTests -B -q
        if errorlevel 1 ( echo [ERROR] Backend build failed! & pause & exit /b 1 )
    )
    echo       Done!
) else (
    echo [1/3] Backend JAR found, skipping build.
)

:: ============================================
:: STEP 2: Install Frontend dependencies
:: ============================================
echo [2/3] Checking Frontend dependencies...
cd /d "%FE_DIR%"
if not exist "node_modules" (
    echo       Installing npm dependencies...
    call npm install
    if errorlevel 1 ( echo [ERROR] npm install failed! & pause & exit /b 1 )
    echo       Done!
) else (
    echo       node_modules found, skipping install.
)

:: ============================================
:: STEP 3: Start all services
:: ============================================
echo [3/3] Starting services...
echo.

:: Start Backend with production env
cd /d "%BE_DIR%"
start "EV-Fleet-Backend" cmd /c "title EV-Fleet Backend && color 0B && echo Starting Backend on port 8080... && %JAVA_CMD% -jar target\car-rental-system-be-0.0.1-SNAPSHOT.jar && pause"

echo       Waiting for backend to start (15s)...
timeout /t 15 /nobreak >nul

:: Start Frontend (dev mode on port 5173)
cd /d "%FE_DIR%"
start "EV-Fleet-Frontend" cmd /c "title EV-Fleet Frontend && color 0D && echo Starting frontend dev server on port 5173... && set "VITE_API_BASE_URL=https://api.fpt.tokyo/api" && npx vite --host"

timeout /t 3 /nobreak >nul

:: Start Cloudflare Tunnel
start "EV-Fleet-Tunnel" cmd /c "title EV-Fleet Tunnel && color 0E && echo Starting Cloudflare Tunnel... && cloudflared tunnel --config %CLOUDFLARED_CONFIG% run"

:: ============================================
:: DONE
:: ============================================
echo.
echo ============================================
echo    ALL SERVICES STARTED!
echo ============================================
echo.
echo    Frontend:  https://fpt.tokyo
echo    Backend:   https://api.fpt.tokyo
echo    Swagger:   https://api.fpt.tokyo/swagger-ui/index.html
echo    Local FE:  http://localhost:5173
echo    Local API: http://localhost:8080
echo.
echo    To stop: close the 3 CMD windows or run stop.bat
echo ============================================
echo.
pause
