# ClipPAilot Development Launcher (PowerShell)
# This script provides better process management than the batch file

Write-Host "ClipPAilot Development Launcher" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install from https://nodejs.org and rerun." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Change to script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check for required tools
if (-not (Test-Path "tools\ffmpeg\ffmpeg.exe")) {
    Write-Host "Missing tools\ffmpeg\ffmpeg.exe" -ForegroundColor Red
    Write-Host "Please place ffmpeg.exe in tools\ffmpeg and run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 2
}

if (-not (Test-Path "tools\yt-dlp\yt-dlp.exe")) {
    Write-Host "Missing tools\yt-dlp\yt-dlp.exe" -ForegroundColor Red
    Write-Host "Please place yt-dlp.exe in tools\yt-dlp and run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 2
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    try {
        npm ci
        if ($LASTEXITCODE -ne 0) {
            throw "npm ci failed"
        }
    } catch {
        Write-Host "Dependency installation failed." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 3
    }
}

Write-Host ""
Write-Host "Starting ClipPAilot in development mode..." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "  - Close the Electron app window when you're done testing" -ForegroundColor White
Write-Host "  - Or press Ctrl+C in this console to stop all processes" -ForegroundColor White
Write-Host "  - This script will automatically clean up when processes end" -ForegroundColor White
Write-Host ""

# Function to stop development processes
function Clear-DevelopmentProcesses {
    Write-Host ""
    Write-Host "Cleaning up development processes..." -ForegroundColor Yellow
    
    # Get and kill Node.js processes
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        foreach ($proc in $nodeProcesses) {
            Write-Host "Terminating Node.js process $($proc.Id)" -ForegroundColor Gray
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
    }
    
    # Get and kill Electron processes
    $electronProcesses = Get-Process -Name "electron" -ErrorAction SilentlyContinue
    if ($electronProcesses) {
        foreach ($proc in $electronProcesses) {
            Write-Host "Terminating Electron process $($proc.Id)" -ForegroundColor Gray
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
    }
    
    # Get and kill ClipPAilot processes
    $clippailotProcesses = Get-Process -Name "ClipPAilot" -ErrorAction SilentlyContinue
    if ($clippailotProcesses) {
        foreach ($proc in $clippailotProcesses) {
            Write-Host "Terminating ClipPAilot process $($proc.Id)" -ForegroundColor Gray
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
    }
    
    Write-Host "Development session cleanup completed" -ForegroundColor Green
}

# Set up cleanup on script exit
Register-EngineEvent PowerShell.Exiting -Action { Clear-DevelopmentProcesses }

try {
    # Start the development server
    $process = Start-Process "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru -Wait
    $exitCode = $process.ExitCode
    
    Write-Host ""
    if ($exitCode -eq 0) {
        Write-Host "Development server stopped normally" -ForegroundColor Green
    } else {
        Write-Host "Development server stopped with exit code $exitCode" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Error running development server: $_" -ForegroundColor Red
    $exitCode = 1
} finally {
    Clear-DevelopmentProcesses
}

Write-Host ""
Write-Host "ClipPAilot development session ended" -ForegroundColor Cyan
exit $exitCode
