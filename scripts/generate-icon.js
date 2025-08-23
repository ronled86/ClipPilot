const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');

async function generateIcon() {
  try {
    console.log('🎨 Generating Windows ICO file from logo.png...');
    
    const inputPath = path.join(__dirname, '..', 'assets', 'logo.png');
    const outputPath = path.join(__dirname, '..', 'assets', 'icon.ico');
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error('❌ Error: logo.png not found in assets folder');
      process.exit(1);
    }
    
    // Convert PNG to ICO with multiple sizes
    const buf = await pngToIco.default([inputPath]);
    
    // Write ICO file
    fs.writeFileSync(outputPath, buf);
    
    console.log('✅ Successfully generated icon.ico');
    console.log(`📁 Output: ${outputPath}`);
    console.log('🔧 Remember to update electron-builder.yml to use the new .ico file');
    
  } catch (error) {
    console.error('❌ Error generating icon:', error.message);
    process.exit(1);
  }
}

generateIcon();
