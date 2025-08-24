# Complete ClipPAilot Cleanup Script
# Removes ALL ClipPAilot entries and orphaned installations
# Run this before installing a new version to ensure clean state

Write-Host "ClipPAilot Complete Cleanup Tool" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "WARNING: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "Some cleanup operations may be limited" -ForegroundColor Yellow
    Write-Host ""
}

# Function to safely remove registry key
function Remove-RegistryKey {
    param($Path)
    try {
        if (Test-Path $Path) {
            Write-Host "Removing registry key: $Path" -ForegroundColor Green
            Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
            return $true
        }
        return $false
    } catch {
        Write-Host "Could not remove: $Path - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to safely remove directory
function Remove-DirectorySafe {
    param($Path)
    try {
        if (Test-Path $Path) {
            Write-Host "Removing directory: $Path" -ForegroundColor Green
            Remove-Item -Path $Path -Recurse -Force -ErrorAction SilentlyContinue
            return $true
        }
        return $false
    } catch {
        Write-Host "Could not remove: $Path - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "Step 1: Stopping ClipPAilot processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "ClipPAilot" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "ClipPAilot processes stopped" -ForegroundColor Green
} catch {
    Write-Host "No ClipPAilot processes running" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 2: Cleaning registry entries..." -ForegroundColor Yellow

$registryPaths = @(
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot",
    "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot",
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\{com.ronled.clippailot}",
    "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\{com.ronled.clippailot}",
    "HKCU:\Software\ClipPAilot",
    "HKLM:\Software\ClipPAilot"
)

$removedCount = 0
foreach ($path in $registryPaths) {
    if (Remove-RegistryKey $path) {
        $removedCount++
    }
}

Write-Host "Registry cleanup: $removedCount entries removed" -ForegroundColor Cyan

Write-Host ""
Write-Host "Step 3: Cleaning installation directories..." -ForegroundColor Yellow

$installDirs = @(
    "$env:LOCALAPPDATA\Programs\ClipPAilot",
    "$env:LOCALAPPDATA\Programs\clippailot-desktop",
    "$env:ProgramFiles\ClipPAilot",
    "$env:ProgramFiles(x86)\ClipPAilot"
)

$dirCount = 0
foreach ($dir in $installDirs) {
    if (Remove-DirectorySafe $dir) {
        $dirCount++
    }
}

Write-Host "Installation directories: $dirCount removed" -ForegroundColor Cyan

Write-Host ""
Write-Host "Step 4: Cleaning user data (optional)..." -ForegroundColor Yellow
$userDataPaths = @(
    "$env:LOCALAPPDATA\ClipPAilot",
    "$env:APPDATA\ClipPAilot"
)

$choice = Read-Host "Remove user data (settings, logs, downloads)? [y/N]"
if ($choice -eq 'y' -or $choice -eq 'Y') {
    $dataCount = 0
    foreach ($dataPath in $userDataPaths) {
        if (Remove-DirectorySafe $dataPath) {
            $dataCount++
        }
    }
    Write-Host "User data directories: $dataCount removed" -ForegroundColor Cyan
} else {
    Write-Host "User data preserved" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 5: Cleaning shortcuts..." -ForegroundColor Yellow

$shortcuts = @(
    "$env:PUBLIC\Desktop\ClipPAilot.lnk",
    "$env:USERPROFILE\Desktop\ClipPAilot.lnk",
    "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\ClipPAilot.lnk",
    "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\ClipPAilot.lnk"
)

$shortcutCount = 0
foreach ($shortcut in $shortcuts) {
    try {
        if (Test-Path $shortcut) {
            Remove-Item $shortcut -Force
            Write-Host "Removed shortcut: $shortcut" -ForegroundColor Green
            $shortcutCount++
        }
    } catch {
        Write-Host "Could not remove shortcut: $shortcut" -ForegroundColor Red
    }
}

Write-Host "Shortcuts removed: $shortcutCount" -ForegroundColor Cyan

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "ClipPAilot Cleanup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "- Registry entries: $removedCount" -ForegroundColor Gray
Write-Host "- Installation directories: $dirCount" -ForegroundColor Gray  
Write-Host "- Shortcuts: $shortcutCount" -ForegroundColor Gray
Write-Host ""
Write-Host "You can now safely install a new version of ClipPAilot" -ForegroundColor Green
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
