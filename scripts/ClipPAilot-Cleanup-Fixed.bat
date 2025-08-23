@echo off
REM ClipPAilot Complete Cleanup Tool - Batch Launcher
REM This batch file can be run on any Windows computer to completely remove ClipPAilot

title ClipPAilot Complete Cleanup Tool

echo.
echo ===================================
echo  ClipPAilot Complete Cleanup Tool
echo ===================================
echo.
echo This tool will completely remove ClipPAilot from this computer.
echo It requires Administrator privileges to work properly.
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [Administrator] Running with elevated privileges...
    goto :run_cleanup
) else (
    echo [User] This tool requires Administrator privileges.
    echo Please right-click this file and select "Run as administrator"
    echo.
    echo Attempting to restart as Administrator...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    goto :end
)

:run_cleanup
echo.
echo Starting PowerShell cleanup script...
echo.

REM Run the PowerShell script with appropriate execution policy
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0cleanup-orphaned-install.ps1"

echo.
echo Cleanup completed. Press any key to exit...
pause >nul

:end
