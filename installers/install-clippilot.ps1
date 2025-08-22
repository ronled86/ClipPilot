# ClipPilot Installer Script (PowerShell)
# Professional installer launcher with enhanced Windows compatibility

Clear-Host
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "         ClipPilot v1.0.0 Installer" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will install ClipPilot on your system." -ForegroundColor White
Write-Host ""
Write-Host "Features:" -ForegroundColor Green
Write-Host "- YouTube search with autocomplete" -ForegroundColor Gray
Write-Host "- Video download with quality options" -ForegroundColor Gray
Write-Host "- Multi-language support (English/Hebrew)" -ForegroundColor Gray
Write-Host "- Professional desktop application" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to start installation..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Starting installer..." -ForegroundColor Green
Write-Host ""

# Check if installer exists
$installerPath = "ClipPilot-Setup-1.0.0.exe"
if (-not (Test-Path $installerPath)) {
    Write-Host "ERROR: ClipPilot-Setup-1.0.0.exe not found!" -ForegroundColor Red
    Write-Host "Please make sure the installer file is in the same directory." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Show file info
$fileInfo = Get-Item $installerPath
Write-Host "Installer found: $($fileInfo.Name)" -ForegroundColor Green
Write-Host "Size: $([math]::Round($fileInfo.Length/1MB,2)) MB" -ForegroundColor Gray
Write-Host ""

# Run the installer
try {
    Write-Host "Launching installer..." -ForegroundColor Green
    Start-Process -FilePath $installerPath -Wait
    
    Write-Host ""
    Write-Host "Installation completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now find ClipPilot in:" -ForegroundColor White
    Write-Host "- Desktop shortcut (if selected)" -ForegroundColor Gray
    Write-Host "- Start Menu" -ForegroundColor Gray
    Write-Host "- Programs and Features (for uninstalling)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Thank you for installing ClipPilot!" -ForegroundColor Yellow
}
catch {
    Write-Host "Error running installer: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
