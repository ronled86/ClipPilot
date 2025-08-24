#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// This script would ideally use a library like 'sharp' or 'puppeteer' to convert SVG to PNG
// For now, I'll create a simple HTML file that can be used to manually export PNGs

const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <title>PNG Exporter for ClipPAilot Logos</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .logo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin: 30px 0;
        }
        .logo-item {
            text-align: center;
            padding: 20px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            background: #fafafa;
        }
        .logo-item h3 {
            margin-bottom: 15px;
            color: #333;
        }
        .logo-item svg {
            width: 150px;
            height: 150px;
            margin: 10px 0;
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover {
            opacity: 0.9;
        }
        .instructions {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>ClipPAilot Logo PNG Exporter</h1>
        
        <div class="instructions">
            <h3>Instructions:</h3>
            <ol>
                <li>Right-click on any logo below</li>
                <li>Select "Inspect Element" or "Inspect"</li>
                <li>Right-click on the &lt;svg&gt; element in the developer tools</li>
                <li>Select "Copy" → "Copy element"</li>
                <li>Visit an online SVG to PNG converter (like convertio.co or cloudconvert.com)</li>
                <li>Paste the SVG code and convert to PNG at 512x512 or higher resolution</li>
            </ol>
            <p><strong>Alternative:</strong> Use the buttons below each logo to download as SVG first, then convert using your preferred tool.</p>
        </div>
        
        <div class="logo-grid">
            <!-- Logo 1: Main Play & Download -->
            <div class="logo-item">
                <h3>Main Logo (Animated)</h3>
                ${fs.readFileSync(path.join(__dirname, 'assets', 'logo-animated.svg'), 'utf8')}
                <br>
                <button onclick="downloadSVG('logo-animated', this.parentElement.querySelector('svg'))">Download SVG</button>
            </div>
            
            <!-- Logo 2: Static Version -->
            <div class="logo-item">
                <h3>Main Logo (Static)</h3>
                ${fs.readFileSync(path.join(__dirname, 'assets', 'logo-static.svg'), 'utf8')}
                <br>
                <button onclick="downloadSVG('logo-static', this.parentElement.querySelector('svg'))">Download SVG</button>
            </div>
            
            <!-- Logo 3: AI Version -->
            <div class="logo-item">
                <h3>AI Video Logo</h3>
                ${fs.readFileSync(path.join(__dirname, 'assets', 'logo-ai-animated.svg'), 'utf8')}
                <br>
                <button onclick="downloadSVG('logo-ai-animated', this.parentElement.querySelector('svg'))">Download SVG</button>
            </div>
        </div>
        
        <div style="margin-top: 40px; padding: 20px; background: #f0f0f0; border-radius: 8px;">
            <h3>Recommended Sizes for ClipPAilot:</h3>
            <ul>
                <li><strong>App Icon:</strong> 512x512px (for Windows .ico conversion)</li>
                <li><strong>Logo in UI:</strong> 64x64px, 128x128px</li>
                <li><strong>Splash Screen:</strong> 256x256px</li>
                <li><strong>Marketing:</strong> 1024x1024px</li>
            </ul>
        </div>
    </div>

    <script>
        function downloadSVG(filename, svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
            const svgUrl = URL.createObjectURL(svgBlob);
            
            const downloadLink = document.createElement("a");
            downloadLink.href = svgUrl;
            downloadLink.download = filename + '.svg';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(svgUrl);
        }
    </script>
</body>
</html>
`;

try {
    fs.writeFileSync(path.join(__dirname, 'logo-png-exporter.html'), htmlTemplate);
    console.log('✅ Created logo-png-exporter.html');
    console.log('📝 Open this file in your browser to download and convert logos to PNG');
} catch (error) {
    console.error('❌ Error creating HTML file:', error.message);
}
