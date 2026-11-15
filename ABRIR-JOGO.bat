@echo off
cd /d "%~dp0frontend"
where npm >nul 2>&1 || (echo Instala Node.js LTS primeiro. & pause & exit /b 1)
call npm install
if errorlevel 1 (pause & exit /b 1)
call npm run dev -- --open
pause
