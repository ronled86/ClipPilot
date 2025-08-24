const pngToIco = require('png-to-ico');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateIcon() {
  try {
    console.log('🎨 Generating Windows ICO file from AI logo...');
    
    // Try AI logo first, fallback to original logo
    let inputPath = path.join(__dirname, '..', 'assets', 'logo-ai.png');
    if (!fs.existsSync(inputPath)) {
      console.log('ℹ️ AI logo not found, using original logo.png');
      inputPath = path.join(__dirname, '..', 'assets', 'logo.png');
    }
    
    const outputPath = path.join(__dirname, '..', 'assets', 'icon.ico');
    
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error('❌ Error: No logo file found in assets folder');
      console.error('   Please ensure either logo-ai.png or logo.png exists');
      process.exit(1);
    }
    
    console.log(`📂 Using logo: ${path.basename(inputPath)}`);
    
    // Create optimized resized versions for ICO generation
    // NSIS has size limitations, so we'll create smaller, optimized sizes
    const tempDir = path.join(__dirname, '..', 'temp-icons');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const sizes = [16, 24, 32, 48, 64, 128, 256]; // Standard Windows icon sizes
    const resizedPaths = [];
    
    console.log('📏 Creating optimized icon sizes...');
    
    for (const size of sizes) {
      const resizedPath = path.join(tempDir, `icon-${size}.png`);
      await sharp(inputPath)
        .resize(size, size, { 
          kernel: sharp.kernel.lanczos3,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png({ 
          quality: 80,
          compressionLevel: 9,
          palette: true // Use palette for smaller file sizes
        })
        .toFile(resizedPath);
      
      resizedPaths.push(resizedPath);
      console.log(`  ✓ ${size}x${size}`);
    }
    
    // Convert optimized PNGs to ICO with size limit consideration
    console.log('🔄 Converting to ICO format...');
    const buf = await pngToIco.default(resizedPaths);
    
    // Check if the ICO file is too large (NSIS limit is around 1MB)
    const maxSize = 1024 * 1024; // 1MB
    if (buf.length > maxSize) {
      console.log('⚠️ ICO file too large for NSIS, creating smaller version...');
      
      // Create a smaller version with fewer sizes
      const smallerSizes = [16, 24, 32, 48, 64]; // Skip larger sizes
      const smallerPaths = resizedPaths.slice(0, smallerSizes.length);
      const smallerBuf = await pngToIco.default(smallerPaths);
      
      fs.writeFileSync(outputPath, smallerBuf);
      console.log(`✅ Generated smaller ICO (${(smallerBuf.length / 1024).toFixed(1)}KB)`);
    } else {
      fs.writeFileSync(outputPath, buf);
      console.log(`✅ Generated ICO (${(buf.length / 1024).toFixed(1)}KB)`);
    }
    
    // Clean up temporary files
    console.log('🧹 Cleaning up temporary files...');
    for (const tempPath of resizedPaths) {
      fs.unlinkSync(tempPath);
    }
    fs.rmdirSync(tempDir);
    
    console.log(`📁 Output: ${outputPath}`);
    console.log('🔧 ICO file ready for use with electron-builder and NSIS');
    
  } catch (error) {
    console.error('❌ Error generating icon:', error.message);
    process.exit(1);
  }
}

generateIcon();
