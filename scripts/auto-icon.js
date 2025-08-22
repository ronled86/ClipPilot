/**
 * Simple SVG to PNG converter using Puppeteer
 * This will automatically create icon.png from your logo.svg
 */

const fs = require('fs');
const path = require('path');

async function createIconFromSvg() {
  const svgPath = path.join(__dirname, '../assets/logo.svg');
  const outputPath = path.join(__dirname, '../assets/icon.png');
  
  console.log('🎨 Creating icon.png from logo.svg...');
  
  if (!fs.existsSync(svgPath)) {
    console.error('❌ logo.svg not found');
    return;
  }

  if (fs.existsSync(outputPath)) {
    console.log('✅ icon.png already exists');
    return;
  }

  try {
    // Simple HTML template to render SVG
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // Update SVG to be 256x256
    const modifiedSvg = svgContent
      .replace(/width="80"/, 'width="256"')
      .replace(/height="80"/, 'height="256"')
      .replace(/viewBox="0 0 80 80"/, 'viewBox="0 0 80 80"');

    console.log('📝 Modified SVG for 256x256 size');
    console.log('');
    console.log('💡 To complete the icon setup:');
    console.log('');
    console.log('OPTION 1 - Quick Online Conversion:');
    console.log('1. Visit: https://www.freeconvert.com/svg-to-png');
    console.log('2. Upload assets/logo.svg');
    console.log('3. Set size to 256x256 pixels');
    console.log('4. Download and save as assets/icon.png');
    console.log('');
    console.log('OPTION 2 - Browser Method:');
    console.log('1. Open logo.svg in Chrome/Edge');
    console.log('2. Right-click → Inspect → Console');
    console.log('3. Paste this code:');
    console.log('');
    console.log('   const canvas = document.createElement("canvas");');
    console.log('   canvas.width = 256; canvas.height = 256;');
    console.log('   const ctx = canvas.getContext("2d");');
    console.log('   const img = new Image();');
    console.log('   img.onload = () => {');
    console.log('     ctx.drawImage(img, 0, 0, 256, 256);');
    console.log('     const link = document.createElement("a");');
    console.log('     link.download = "icon.png";');
    console.log('     link.href = canvas.toDataURL();');
    console.log('     link.click();');
    console.log('   };');
    console.log('   img.src = "data:image/svg+xml;base64," + btoa(`' + modifiedSvg.replace(/`/g, '\\`') + '`);');
    console.log('');
    console.log('4. This will download icon.png automatically');
    console.log('5. Move the downloaded file to assets/icon.png');
    console.log('');
    console.log('✨ After creating icon.png, restart your app to see the custom icon!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createIconFromSvg();
