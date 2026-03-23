@echo off
echo Stopping all EV Fleet services...

:: Kill Java (backend)
for /f "tokens=2" %%a in ('tasklist /fi "imagename eq java.exe" /fo list ^| findstr "PID"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill node/serve (frontend)
for /f "tokens=2" %%a in ('netstat -ano ^| findstr ":4000.*LISTEN"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill cloudflared
taskkill /F /IM cloudflared.exe >nul 2>&1

echo All services stopped.
pause
