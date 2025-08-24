@echo off
setlocal ENABLEDELAYEDEXPANSION

:: Set up signal handling for clean exit
set "cleanup_done=false"

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

echo Starting ClipPAilot in development mode...
echo.
echo IMPORTANT: When you're done testing, close the Electron app window
echo           or press Ctrl+C in this console to stop all processes
echo.

:: Start the development server
npm run dev

:: Capture the exit code
set dev_exit_code=%ERRORLEVEL%

:: Cleanup function
call :cleanup

exit /b %dev_exit_code%

:cleanup
if "%cleanup_done%"=="true" goto :eof
set "cleanup_done=true"

echo.
echo Cleaning up development processes...

:: More targeted cleanup - only kill processes related to this project
:: Kill any Vite dev server processes
for /f "tokens=2,9" %%i in ('tasklist /v /fi "imagename eq node.exe" ^| findstr /i "vite"') do (
  echo Terminating Vite dev server %%i
  taskkill /f /pid %%i >nul 2>&1
)

:: Kill any TypeScript compiler processes
for /f "tokens=2,9" %%i in ('tasklist /v /fi "imagename eq node.exe" ^| findstr /i "tsc"') do (
  echo Terminating TypeScript compiler %%i
  taskkill /f /pid %%i >nul 2>&1
)

:: Kill any Electron processes (more specific)
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq electron.exe" ^| findstr /i electron.exe') do (
  echo Terminating Electron process %%i
  taskkill /f /pid %%i >nul 2>&1
)

:: Kill any ClipPAilot processes
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq ClipPAilot.exe" ^| findstr /i ClipPAilot.exe') do (
  echo Terminating ClipPAilot process %%i
  taskkill /f /pid %%i >nul 2>&1
)

:: Kill any concurrently processes
taskkill /f /im conhost.exe /fi "windowtitle eq npm*" >nul 2>&1

echo Development session cleanup completed
goto :eof

:missing
echo Please place ffmpeg.exe and yt-dlp.exe in tools\ffmpeg and tools\yt-dlp then run this batch again.
pause
exit /b 2

:error
echo Dependency installation failed.
pause
exit /b 3