@echo off
setlocal ENABLEDELAYEDEXPANSION

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Node.js not found. Install from https://nodejs.org and rerun.
  pause
  exit /b 1
)

cd /d "%~dp0"

if not exist tools\ffmpeg\ffmpeg.exe echo Missing tools\ffmpeg\ffmpeg.exe && goto :missing
if not exist tools\yt-dlp\yt-dlp.exe echo Missing tools\yt-dlp\yt-dlp.exe && goto :missing

if not exist node_modules (
  echo Installing dependencies...
  npm ci || goto :error
)

echo Starting ClipPilot in development mode...
npm run dev
exit /b 0

:missing
echo Please place ffmpeg.exe and yt-dlp.exe in tools\ffmpeg and tools\yt-dlp then run this batch again.
pause
exit /b 2

:error
echo Dependency installation failed.
pause
exit /b 3