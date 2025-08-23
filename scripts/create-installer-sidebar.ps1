# Create installer sidebar image for NSIS
# Standard NSIS sidebar dimensions: 164x314 pixels

Add-Type -AssemblyName System.Drawing

try {
    # Load the logo
    $logo = [System.Drawing.Image]::FromFile("assets\logo.png")
    
    # Create sidebar bitmap
    $sidebarWidth = 164
    $sidebarHeight = 314
    $sidebar = New-Object System.Drawing.Bitmap($sidebarWidth, $sidebarHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($sidebar)
    
    # Set high quality rendering
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
    
    # Create gradient background (light blue to white)
    $startColor = [System.Drawing.Color]::FromArgb(245, 250, 255)
    $endColor = [System.Drawing.Color]::FromArgb(230, 240, 250)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        [System.Drawing.Point]::new(0, 0),
        [System.Drawing.Point]::new(0, $sidebarHeight),
        $startColor,
        $endColor
    )
    $graphics.FillRectangle($brush, 0, 0, $sidebarWidth, $sidebarHeight)
    
    # Draw logo (centered, proper size)
    $logoSize = 80
    $logoX = ($sidebarWidth - $logoSize) / 2
    $logoY = 40
    $graphics.DrawImage($logo, $logoX, $logoY, $logoSize, $logoSize)
    
    # Add app name
    $titleFont = New-Object System.Drawing.Font("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 70, 100))
    $textFormat = [System.Drawing.StringFormat]::new()
    $textFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $textFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $graphics.DrawString("ClipPAilot", $titleFont, $textBrush, $sidebarWidth/2, 140, $textFormat)
    
    # Add tagline
    $subtitleFont = New-Object System.Drawing.Font("Segoe UI", 8)
    $subtitleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 90, 120))
    $graphics.DrawString("YouTube Search & Download", $subtitleFont, $subtitleBrush, $sidebarWidth/2, 165, $textFormat)
    
    # Add version info at bottom
    $versionFont = New-Object System.Drawing.Font("Segoe UI", 7)
    $versionBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(100, 120, 140))
    $graphics.DrawString("v1.0.12", $versionFont, $versionBrush, $sidebarWidth/2, 290, $textFormat)
    
    # Save as BMP (NSIS preferred format)
    $sidebar.Save("assets\installer-sidebar.bmp", [System.Drawing.Imaging.ImageFormat]::Bmp)
    
    Write-Host "✅ Installer sidebar created successfully: assets\installer-sidebar.bmp (164x314)"
    Write-Host "📐 Dimensions: 164x314 pixels (NSIS standard)"
    
} catch {
    Write-Error "❌ Failed to create installer sidebar: $_"
} finally {
    # Cleanup
    if ($graphics) { $graphics.Dispose() }
    if ($sidebar) { $sidebar.Dispose() }
    if ($logo) { $logo.Dispose() }
    if ($titleFont) { $titleFont.Dispose() }
    if ($subtitleFont) { $subtitleFont.Dispose() }
    if ($versionFont) { $versionFont.Dispose() }
    if ($textBrush) { $textBrush.Dispose() }
    if ($subtitleBrush) { $subtitleBrush.Dispose() }
    if ($versionBrush) { $versionBrush.Dispose() }
    if ($brush) { $brush.Dispose() }
}
