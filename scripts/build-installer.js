#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const versionFile = path.join(__dirname, '..', 'src', 'version.ts')
const builderFile = path.join(__dirname, '..', 'electron-builder.yml')

function getBuildNumber() {
  try {
    const versionContent = fs.readFileSync(versionFile, 'utf8')
    const buildMatch = versionContent.match(/build: (\d+)/)
    return buildMatch ? buildMatch[1] : Date.now().toString()
  } catch (error) {
    console.warn('⚠️ Could not read build number, using timestamp')
    return Date.now().toString()
  }
}

function updateBuilderConfig() {
  const buildNumber = getBuildNumber()
  
  // Read the current config
  let config = fs.readFileSync(builderFile, 'utf8')
  
  // Update the artifact name to include build number
  config = config.replace(
    /artifactName: "\${productName}-Setup-\${version}\.\${ext}"/g,
    `artifactName: "\${productName}-Setup-\${version}-build${buildNumber}.\${ext}"`
  )
  
  // Write back the config
  fs.writeFileSync(builderFile, config)
  
  console.log(`📦 Updated installer name to include build ${buildNumber}`)
  return buildNumber
}

function restoreBuilderConfig() {
  // Read the current config
  let config = fs.readFileSync(builderFile, 'utf8')
  
  // Restore original artifact name format
  config = config.replace(
    /artifactName: "\${productName}-Setup-\${version}-build\d+\.\${ext}"/g,
    'artifactName: "${productName}-Setup-${version}.${ext}"'
  )
  
  // Write back the config
  fs.writeFileSync(builderFile, config)
  
  console.log(`🔄 Restored original installer naming format`)
}

function buildWithUniqueVersion(target = 'nsis') {
  console.log('🚀 Starting automated build with unique version...')
  
  try {
    // Step 1: Update build number
    console.log('📈 Updating build number...')
    execSync('npm run version:build', { stdio: 'inherit' })
    
    // Step 2: Update builder config with build number
    const buildNumber = updateBuilderConfig()
    
    // Step 3: Build the application
    console.log('🔨 Building application...')
    execSync('npm run build', { stdio: 'inherit' })
    
    // Step 4: Create installer
    console.log(`📦 Creating ${target} installer...`)
    execSync(`npx electron-builder --win ${target}`, { stdio: 'inherit' })
    
    // Step 5: Restore builder config
    restoreBuilderConfig()
    
    // Step 6: Copy to installers folder
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'))
    const version = pkg.version
    const sourcePath = path.join(__dirname, '..', 'release', `ClipPilot-Setup-${version}-build${buildNumber}.exe`)
    const destPath = path.join(__dirname, '..', 'installers', `ClipPilot-Setup-${version}-build${buildNumber}.exe`)
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath)
      console.log(`✅ Copied installer to: installers/ClipPilot-Setup-${version}-build${buildNumber}.exe`)
    }
    
    console.log(`🎉 Build completed successfully!`)
    console.log(`📋 Installer: ClipPilot-Setup-${version}-build${buildNumber}.exe`)
    
  } catch (error) {
    console.error('❌ Build failed:', error.message)
    
    // Always restore config even if build fails
    try {
      restoreBuilderConfig()
    } catch (restoreError) {
      console.warn('⚠️ Could not restore builder config:', restoreError.message)
    }
    
    process.exit(1)
  }
}

// CLI usage
if (require.main === module) {
  const target = process.argv[2] || 'nsis'
  
  if (!['nsis', 'msi'].includes(target)) {
    console.error('❌ Invalid target. Use: nsis or msi')
    process.exit(1)
  }

  buildWithUniqueVersion(target)
}

module.exports = { buildWithUniqueVersion, updateBuilderConfig, restoreBuilderConfig }
