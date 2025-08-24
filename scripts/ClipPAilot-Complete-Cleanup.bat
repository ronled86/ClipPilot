@echo off
echo ClipPAilot Complete Cleanup Tool
echo ================================
echo.
echo This will remove ALL ClipPAilot installations and registry entries
echo to ensure a clean state before installing a new version.
echo.
pause

REM Run the PowerShell cleanup script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0complete-cleanup.ps1"

echo.
echo Cleanup completed!
pause
