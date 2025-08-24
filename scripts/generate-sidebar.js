const fs = require('fs');
const path = require('path');

async function generateSidebarBMP() {
  try {
    console.log('🎨 Generating installer sidebar BMP with AI logo...');
    
    // For now, let's create a simple gradient BMP
    // NSIS sidebar dimensions: 164x314 pixels, 24-bit BMP
    const width = 164;
    const height = 314;
    const bytesPerPixel = 3; // RGB
    const rowSize = Math.ceil((width * bytesPerPixel) / 4) * 4; // Row size must be multiple of 4
    const pixelArraySize = rowSize * height;
    const fileSize = 54 + pixelArraySize; // 54-byte header + pixel data
    
    // Create BMP header
    const header = Buffer.alloc(54);
    
    // BMP file header (14 bytes)
    header.write('BM', 0); // Signature
    header.writeUInt32LE(fileSize, 2); // File size
    header.writeUInt32LE(0, 6); // Reserved
    header.writeUInt32LE(54, 10); // Data offset
    
    // DIB header (40 bytes)
    header.writeUInt32LE(40, 14); // DIB header size
    header.writeInt32LE(width, 18); // Width
    header.writeInt32LE(height, 22); // Height (positive = bottom-up)
    header.writeUInt16LE(1, 26); // Planes
    header.writeUInt16LE(24, 28); // Bits per pixel
    header.writeUInt32LE(0, 30); // Compression (0 = none)
    header.writeUInt32LE(pixelArraySize, 34); // Image size
    header.writeUInt32LE(2835, 38); // X pixels per meter
    header.writeUInt32LE(2835, 42); // Y pixels per meter
    header.writeUInt32LE(0, 46); // Colors in color table
    header.writeUInt32LE(0, 50); // Important color count
    
    // Create pixel data with gradient
    const pixelData = Buffer.alloc(pixelArraySize);
    
    for (let y = 0; y < height; y++) {
      const rowOffset = y * rowSize;
      
      for (let x = 0; x < width; x++) {
        const pixelOffset = rowOffset + (x * bytesPerPixel);
        
        // Create gradient from top to bottom
        const gradientPosition = y / height;
        
        let r, g, b;
        
        if (gradientPosition < 0.3) {
          // Top: Blue to Purple
          const t = gradientPosition / 0.3;
          r = Math.round(102 + (118 - 102) * t); // 102 -> 118
          g = Math.round(126 + (75 - 126) * t);  // 126 -> 75
          b = Math.round(234 + (162 - 234) * t); // 234 -> 162
        } else if (gradientPosition < 0.7) {
          // Middle: Purple to Pink
          const t = (gradientPosition - 0.3) / 0.4;
          r = Math.round(118 + (240 - 118) * t); // 118 -> 240
          g = Math.round(75 + (147 - 75) * t);   // 75 -> 147
          b = Math.round(162 + (251 - 162) * t); // 162 -> 251
        } else {
          // Bottom: Pink to Red
          const t = (gradientPosition - 0.7) / 0.3;
          r = Math.round(240 + (245 - 240) * t); // 240 -> 245
          g = Math.round(147 + (87 - 147) * t);  // 147 -> 87
          b = Math.round(251 + (108 - 251) * t); // 251 -> 108
        }
        
        // Add some texture/pattern
        const textureX = x % 20;
        const textureY = y % 20;
        const textureValue = (textureX < 10 && textureY < 10) ? 1.1 : 0.9;
        
        r = Math.min(255, Math.round(r * textureValue));
        g = Math.min(255, Math.round(g * textureValue));
        b = Math.min(255, Math.round(b * textureValue));
        
        // BMP uses BGR format, not RGB
        pixelData[pixelOffset] = b;     // Blue
        pixelData[pixelOffset + 1] = g; // Green
        pixelData[pixelOffset + 2] = r; // Red
      }
      
      // Pad row to multiple of 4 bytes if needed
      for (let pad = width * bytesPerPixel; pad < rowSize; pad++) {
        pixelData[rowOffset + pad] = 0;
      }
    }
    
    // Combine header and pixel data
    const bmpData = Buffer.concat([header, pixelData]);
    
    // Write to file
    const outputPath = path.join(__dirname, '..', 'assets', 'installer-sidebar.bmp');
    fs.writeFileSync(outputPath, bmpData);
    
    console.log('✅ Successfully generated installer sidebar BMP');
    console.log(`📁 Output: ${outputPath}`);
    console.log(`📐 Dimensions: ${width}x${height} pixels`);
    console.log(`💾 File size: ${Math.round(fileSize / 1024)} KB`);
    console.log('🔧 Ready for use with NSIS installer');
    
  } catch (error) {
    console.error('❌ Error generating sidebar BMP:', error.message);
    process.exit(1);
  }
}

generateSidebarBMP();
