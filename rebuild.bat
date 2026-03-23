@echo off
title EV Fleet - Rebuild after code update
color 0A
echo ============================================
echo    EV FLEET - REBUILD AFTER GIT PULL
echo ============================================
echo.

set "PROJECT_DIR=%~dp0"
set "BE_DIR=%PROJECT_DIR%be"
set "FE_DIR=%PROJECT_DIR%fe"

:: Auto-detect Java 21
set "JAVA_CMD=java"
set "SCOOP_JAVA=%USERPROFILE%\scoop\apps\temurin21-jdk\current\bin\java.exe"
if exist "%SCOOP_JAVA%" set "JAVA_CMD=%SCOOP_JAVA%"

:: ============================================
:: STEP 1: Rebuild Backend
:: ============================================
echo [1/2] Rebuilding Backend...
cd /d "%BE_DIR%"
call mvnw.cmd clean package -DskipTests -B -q 2>nul
if errorlevel 1 (
    call mvn clean package -DskipTests -B -q
    if errorlevel 1 ( echo [ERROR] Backend build failed! & pause & exit /b 1 )
)
echo       Backend build OK!
echo.

:: ============================================
:: STEP 2: Reinstall Frontend dependencies
:: ============================================
echo [2/2] Installing Frontend dependencies...
cd /d "%FE_DIR%"
call npm install
if errorlevel 1 ( echo [ERROR] npm install failed! & pause & exit /b 1 )
echo       Frontend install OK!
echo.

echo ============================================
echo    REBUILD COMPLETE!
echo    Now run start.bat to launch services.
echo ============================================
echo.
pause
