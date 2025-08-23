# ClipPAilot Complete Orphaned Installation Cleanup Tool
# Portable script to remove ALL traces of ClipPAilot from any Windows computer
# Can be run on any computer where ClipPAilot was installed

param(
    [switch]$KeepDownloads,
    [switch]$Silent,
    [switch]$Force
)

if (-not $Silent) {
    Write-Host "🧹 ClipPAilot Complete Cleanup Tool" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "This tool will remove ALL traces of ClipPAilot from this computer." -ForegroundColor Yellow
    Write-Host ""
    
    if (-not $Force) {
        $Confirm = Read-Host "Continue? (y/N)"
        if ($Confirm -ne 'y' -and $Confirm -ne 'Y') {
            Write-Host "❌ Cleanup cancelled by user." -ForegroundColor Red
            exit 0
        }
    }
}

# Require Administrator privileges for system-wide cleanup
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️ This script requires Administrator privileges for complete cleanup." -ForegroundColor Yellow
    Write-Host "Restarting as Administrator..." -ForegroundColor Yellow
    
    # Prepare arguments to pass to elevated instance
    $Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$($MyInvocation.MyCommand.Path)`""
    if ($KeepDownloads) { $Arguments += " -KeepDownloads" }
    if ($Silent) { $Arguments += " -Silent" }
    if ($Force) { $Arguments += " -Force" }
    
    Start-Process PowerShell -Verb RunAs -ArgumentList $Arguments
    exit 0
}

# Function to safely remove registry key with detailed logging
function Remove-RegistryKey {
    param($KeyPath, $KeyName, $Hive = "HKCU")
    try {
        $FullPath = "${Hive}:\$KeyPath"
        if (Test-Path $FullPath) {
            if (-not $Silent) { Write-Host "🗑️ Removing registry: $Hive\$KeyPath" -ForegroundColor Yellow }
            Remove-Item -Path $FullPath -Recurse -Force
            if (-not $Silent) { Write-Host "✅ Removed: $KeyName" -ForegroundColor Green }
            return $true
        } else {
            if (-not $Silent) { Write-Host "ℹ️ Not found: $KeyName" -ForegroundColor Gray }
            return $false
        }
    } catch {
        if (-not $Silent) { Write-Host "❌ Failed to remove: $KeyName - $($_.Exception.Message)" -ForegroundColor Red }
        return $false
    }
}

# Function to safely remove directory with size calculation
function Remove-Directory {
    param($DirPath, $DirName)
    try {
        if (Test-Path $DirPath) {
            # Calculate size before removal
            $Size = (Get-ChildItem $DirPath -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
            $SizeMB = [math]::Round($Size / 1MB, 2)
            
            if (-not $Silent) { Write-Host "🗑️ Removing: $DirName ($SizeMB MB)" -ForegroundColor Yellow }
            
            # Force remove readonly/hidden files
            Get-ChildItem $DirPath -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object { $_.Attributes = 'Normal' }
            
            Remove-Item -Path $DirPath -Recurse -Force
            if (-not $Silent) { Write-Host "✅ Removed: $DirName" -ForegroundColor Green }
            return $true
        } else {
            if (-not $Silent) { Write-Host "ℹ️ Not found: $DirName" -ForegroundColor Gray }
            return $false
        }
    } catch {
        if (-not $Silent) { Write-Host "❌ Failed to remove: $DirName - $($_.Exception.Message)" -ForegroundColor Red }
        return $false
    }
}

# Function to kill processes safely
function Stop-ClipPAilotProcesses {
    $ProcessNames = @("ClipPAilot", "clippailot", "clippailot-desktop")
    $KilledAny = $false
    
    foreach ($ProcessName in $ProcessNames) {
        $Processes = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue
        if ($Processes) {
            if (-not $Silent) { Write-Host "🛑 Stopping $($Processes.Count) $ProcessName process(es)..." -ForegroundColor Yellow }
            $Processes | Stop-Process -Force
            $KilledAny = $true
        }
    }
    
    if ($KilledAny) {
        Start-Sleep -Seconds 3
        if (-not $Silent) { Write-Host "✅ All ClipPAilot processes stopped" -ForegroundColor Green }
    }
}

# Main cleanup execution
if (-not $Silent) {
    Write-Host ""
    Write-Host "🚀 Starting comprehensive cleanup..." -ForegroundColor Cyan
}

# Step 1: Stop all ClipPAilot processes
Stop-ClipPAilotProcesses

# Step 2: Remove ALL possible registry entries (both HKCU and HKLM)
if (-not $Silent) { Write-Host "🔍 Cleaning registry entries..." -ForegroundColor Yellow }

$RegistryCleanupResults = @()

# All possible ClipPAilot registry locations
$RegistryLocations = @(
    @{Hive="HKCU"; Path="Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot"; Name="User Uninstall Entry (GUID)"},
    @{Hive="HKLM"; Path="Software\Microsoft\Windows\CurrentVersion\Uninstall\com.ronled.clippailot"; Name="System Uninstall Entry (GUID)"},
    @{Hive="HKCU"; Path="Software\Microsoft\Windows\CurrentVersion\Uninstall\{com.ronled.clippailot}"; Name="User Uninstall Entry (Braced GUID)"},
    @{Hive="HKLM"; Path="Software\Microsoft\Windows\CurrentVersion\Uninstall\{com.ronled.clippailot}"; Name="System Uninstall Entry (Braced GUID)"},
    @{Hive="HKCU"; Path="Software\ClipPAilot"; Name="User Application Settings"},
    @{Hive="HKLM"; Path="Software\ClipPAilot"; Name="System Application Settings"},
    @{Hive="HKCU"; Path="Software\clippailot-desktop"; Name="User Desktop App Settings"},
    @{Hive="HKLM"; Path="Software\clippailot-desktop"; Name="System Desktop App Settings"}
)

foreach ($RegEntry in $RegistryLocations) {
    $Removed = Remove-RegistryKey -KeyPath $RegEntry.Path -KeyName $RegEntry.Name -Hive $RegEntry.Hive
    $RegistryCleanupResults += @{Location=$RegEntry.Name; Removed=$Removed}
}

# Search for any remaining ClipPAilot-related uninstall entries
$UninstallPaths = @(
    "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*",
    "HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
)

foreach ($UninstallPath in $UninstallPaths) {
    try {
        $OrphanedEntries = Get-ChildItem $UninstallPath -ErrorAction SilentlyContinue | ForEach-Object {
            $Key = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
            if ($Key.DisplayName -match "ClipPAilot|clippailot") {
                if (-not $Silent) { 
                    Write-Host "📋 Found orphaned entry: $($Key.DisplayName) v$($Key.DisplayVersion)" -ForegroundColor Cyan 
                }
                $_.PSPath
            }
        }
        
        foreach ($EntryPath in $OrphanedEntries) {
            try {
                Remove-Item -Path $EntryPath -Recurse -Force
                if (-not $Silent) { Write-Host "✅ Removed orphaned uninstall entry" -ForegroundColor Green }
            } catch {
                if (-not $Silent) { Write-Host "❌ Failed to remove orphaned entry: $($_.Exception.Message)" -ForegroundColor Red }
            }
        }
    } catch {
        if (-not $Silent) { Write-Host "❌ Error searching uninstall entries in $UninstallPath" -ForegroundColor Red }
    }
}

# Step 3: Remove ALL possible installation directories
if (-not $Silent) { Write-Host "🔍 Cleaning installation directories..." -ForegroundColor Yellow }

$InstallationPaths = @(
    @{Path = "C:\Program Files\ClipPAilot"; Name = "Program Files (System-wide)"},
    @{Path = "C:\Program Files (x86)\ClipPAilot"; Name = "Program Files x86 (System-wide)"},
    @{Path = "$env:LOCALAPPDATA\Programs\ClipPAilot"; Name = "Local Programs (User)"},
    @{Path = "$env:USERPROFILE\AppData\Local\Programs\ClipPAilot"; Name = "User Programs"},
    @{Path = "$env:ProgramFiles\ClipPAilot"; Name = "Program Files Variable"},
    @{Path = "${env:ProgramFiles(x86)}\ClipPAilot"; Name = "Program Files x86 Variable"}
)

foreach ($Location in $InstallationPaths) {
    Remove-Directory -DirPath $Location.Path -DirName $Location.Name
}

# Step 4: Remove application data and cache directories
if (-not $Silent) { Write-Host "🔍 Cleaning application data..." -ForegroundColor Yellow }

$AppDataPaths = @(
    @{Path = "$env:LOCALAPPDATA\ClipPAilot"; Name = "Local AppData"},
    @{Path = "$env:APPDATA\ClipPAilot"; Name = "Roaming AppData"},
    @{Path = "$env:LOCALAPPDATA\clippailot-desktop"; Name = "Local Desktop App Data"},
    @{Path = "$env:APPDATA\clippailot-desktop"; Name = "Roaming Desktop App Data"},
    @{Path = "$env:LOCALAPPDATA\Temp\clippailot-desktop"; Name = "Temp Cache"},
    @{Path = "$env:TEMP\clippailot-desktop"; Name = "System Temp Cache"},
    @{Path = "$env:LOCALAPPDATA\ClipPAilot-updater"; Name = "Updater Cache"}
)

# Handle downloads directory separately if user wants to keep them
if (-not $KeepDownloads) {
    $AppDataPaths += @(
        @{Path = "$env:USERPROFILE\Downloads\ClipPAilot"; Name = "Downloads Folder"},
        @{Path = "$env:USERPROFILE\Videos\ClipPAilot"; Name = "Videos Folder"},
        @{Path = "$env:USERPROFILE\Music\ClipPAilot"; Name = "Music Folder"}
    )
} else {
    if (-not $Silent) { Write-Host "ℹ️ Preserving download folders as requested" -ForegroundColor Cyan }
}

foreach ($Location in $AppDataPaths) {
    Remove-Directory -DirPath $Location.Path -DirName $Location.Name
}

# Step 5: Remove shortcuts from all possible locations
if (-not $Silent) { Write-Host "🔍 Removing shortcuts..." -ForegroundColor Yellow }

$ShortcutPaths = @(
    "$env:USERPROFILE\Desktop\ClipPAilot.lnk",
    "$env:PUBLIC\Desktop\ClipPAilot.lnk",
    "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\ClipPAilot.lnk",
    "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\ClipPAilot\",
    "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\ClipPAilot.lnk",
    "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\ClipPAilot\",
    "$env:APPDATA\Microsoft\Internet Explorer\Quick Launch\ClipPAilot.lnk"
)

foreach ($ShortcutPath in $ShortcutPaths) {
    if (Test-Path $ShortcutPath) {
        try {
            Remove-Item -Path $ShortcutPath -Recurse -Force
            if (-not $Silent) { Write-Host "✅ Removed shortcut: $(Split-Path $ShortcutPath -Leaf)" -ForegroundColor Green }
        } catch {
            if (-not $Silent) { Write-Host "❌ Failed to remove shortcut: $ShortcutPath" -ForegroundColor Red }
        }
    }
}

# Step 6: Clear Windows Event Logs related to ClipPAilot (optional)
try {
    $EventLogs = Get-WinEvent -ListLog * -ErrorAction SilentlyContinue | Where-Object { $_.LogName -match "ClipPAilot" }
    
    if ($EventLogs) {
        foreach ($Log in $EventLogs) {
            Clear-EventLog -LogName $Log.LogName -ErrorAction SilentlyContinue
            if (-not $Silent) { Write-Host "✅ Cleared event log: $($Log.LogName)" -ForegroundColor Green }
        }
    }
} catch {
    # Event log cleanup is optional, don't fail if it doesn't work
}

# Step 7: Final verification
if (-not $Silent) { Write-Host "🔍 Final verification..." -ForegroundColor Yellow }

# Check for any remaining processes
$RemainingProcesses = Get-Process -Name "*ClipPAilot*" -ErrorAction SilentlyContinue
if ($RemainingProcesses) {
    if (-not $Silent) {
        Write-Host "⚠️ Warning: Some ClipPAilot processes still running:" -ForegroundColor Yellow
        $RemainingProcesses | ForEach-Object { 
            Write-Host "  - $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Yellow 
        }
    }
} else {
    if (-not $Silent) { Write-Host "✅ No ClipPAilot processes detected" -ForegroundColor Green }
}

# Check for any remaining files in common locations
$CommonPaths = @("C:\Program Files\ClipPAilot", "$env:LOCALAPPDATA\ClipPAilot", "$env:APPDATA\ClipPAilot")
$RemainingFiles = $CommonPaths | Where-Object { Test-Path $_ }

if ($RemainingFiles) {
    if (-not $Silent) {
        Write-Host "⚠️ Warning: Some files may still remain:" -ForegroundColor Yellow
        $RemainingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
    }
} else {
    if (-not $Silent) { Write-Host "✅ No ClipPAilot files detected in common locations" -ForegroundColor Green }
}

# Generate cleanup summary
if (-not $Silent) {
    Write-Host ""
    Write-Host "📊 Cleanup Summary:" -ForegroundColor Cyan
    Write-Host "==================" -ForegroundColor Cyan
    
    $RemovedRegistryCount = ($RegistryCleanupResults | Where-Object { $_.Removed }).Count
    Write-Host "Registry entries removed: $RemovedRegistryCount" -ForegroundColor Green
    
    if ($KeepDownloads) {
        Write-Host "Downloads preserved: Yes" -ForegroundColor Cyan
    } else {
        Write-Host "Downloads removed: Yes" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🎉 Complete ClipPAilot cleanup finished!" -ForegroundColor Green
    Write-Host "The computer is now ready for a fresh ClipPAilot installation." -ForegroundColor Green
    Write-Host ""
    
    if (-not $Force) {
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}
