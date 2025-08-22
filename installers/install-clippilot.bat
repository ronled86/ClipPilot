@echo off
title ClipPilot Installer Launcher
echo.
echo ===============================================
echo          ClipPilot v1.0.0 Installer
echo ===============================================
echo.
echo This will install ClipPilot on your system.
echo.
echo Features:
echo - YouTube search with autocomplete
echo - Video download with quality options
echo - Multi-language support (English/Hebrew)
echo - Professional desktop application
echo.
echo Press any key to start installation...
pause >nul

echo.
echo Starting installer...
echo.

REM Check if installer exists
if not exist "ClipPilot-Setup-1.0.0.exe" (
    echo ERROR: ClipPilot-Setup-1.0.0.exe not found!
    echo Please make sure the installer file is in the same directory.
    echo.
    pause
    exit /b 1
)

REM Run the installer
start /wait ClipPilot-Setup-1.0.0.exe

echo.
echo Installation completed!
echo.
echo You can now find ClipPilot in:
echo - Desktop shortcut (if selected)
echo - Start Menu
echo - Programs and Features (for uninstalling)
echo.
echo Thank you for installing ClipPilot!
echo.
pause
