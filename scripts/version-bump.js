#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const versionFile = path.join(__dirname, '..', 'src', 'version.ts')
const packageFile = path.join(__dirname, '..', 'package.json')
const electronBuilderFile = path.join(__dirname, '..', 'electron-builder.yml')

function updateDocumentationFiles(oldVersion, newVersion) {
  const filesToUpdate = [
    'README.md',
    'wiki/Home.md',
    'wiki/Installation-Guide.md',
    'RELEASE.md'
  ]

  filesToUpdate.forEach(fileName => {
    const filePath = path.join(__dirname, '..', fileName)
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8')
      
      // Replace version numbers in various formats
      content = content.replace(new RegExp(oldVersion.replace(/\./g, '\\.'), 'g'), newVersion)
      content = content.replace(new RegExp(`v${oldVersion.replace(/\./g, '\\.')}`, 'g'), `v${newVersion}`)
      content = content.replace(new RegExp(`Setup-${oldVersion.replace(/\./g, '\\.')}`, 'g'), `Setup-${newVersion}`)
      
      // Update version badge in README
      if (fileName === 'README.md') {
        content = content.replace(
          /version-[\d\.]+(?:-[\w]+)?-blue/g,
          `version-${newVersion}-blue`
        )
      }
      
      fs.writeFileSync(filePath, content)
      console.log(`📝 Updated ${fileName}`)
    }
  })
}

function updateInstallerScript(newFullVersion) {
  const installerScriptPath = path.join(__dirname, 'installer.nsh')
  
  if (fs.existsSync(installerScriptPath)) {
    let content = fs.readFileSync(installerScriptPath, 'utf8')
    
    // Get the base version (without build number) for FULL_VERSION
    const [major, minor, patch] = newFullVersion.split('.')
    const baseVersion = `${major}.${minor}.${patch}`
    
    // Update all version references in installer.nsh
    // Update the fallback buildVersion
    content = content.replace(
      /!define buildVersion "[\d\.]+"/g,
      `!define buildVersion "${newFullVersion}"`
    )
    
    // Update FULL_VERSION (3-part version)
    content = content.replace(
      /!define FULL_VERSION "[\d\.]+"/g,
      `!define FULL_VERSION "${baseVersion}"`
    )
    
    // Update BUILD_VERSION (4-part version)
    content = content.replace(
      /!define BUILD_VERSION "[\d\.]+"/g,
      `!define BUILD_VERSION "${newFullVersion}"`
    )
    
    // Update the install date to current date
    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    content = content.replace(
      /WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\com\.ronled\.clippailot" "InstallDate" "\d+"/g,
      `WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\com.ronled.clippailot" "InstallDate" "${currentDate}"`
    )
    
    // Update the finish page date
    const currentDateFormatted = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    content = content.replace(
      /• Date: [^$\r\n]+/g,
      `• Date: ${currentDateFormatted}`
    )
    
    fs.writeFileSync(installerScriptPath, content)
    console.log(`📝 Updated installer.nsh with version ${newFullVersion}`)
  } else {
    console.warn(`⚠️ Installer script not found at: ${installerScriptPath}`)
  }
}

function updateVersion(type = 'patch') {
  // Read current version.ts to get build number
  let currentBuild = 1
  if (fs.existsSync(versionFile)) {
    const versionContent = fs.readFileSync(versionFile, 'utf8')
    const buildMatch = versionContent.match(/build: (\d+)/)
    if (buildMatch) {
      currentBuild = parseInt(buildMatch[1])
    }
  }

  // Read current package.json
  const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'))
  const [major, minor, patch] = pkg.version.split('.').map(Number)
  const oldVersion = pkg.version

  let newMajor = major
  let newMinor = minor  
  let newPatch = patch
  let newBuild = currentBuild + 1
  let versionChanged = true

  switch (type) {
    case 'major':
      newMajor++
      newMinor = 0
      newPatch = 0
      newBuild = 1 // Reset build number on major version bump
      break
    case 'minor':
      newMinor++
      newPatch = 0
      newBuild = 1 // Reset build number on minor version bump
      break
    case 'patch':
      newPatch++
      newBuild = 1 // Reset build number on patch version bump
      break
    case 'build':
      // Only update build number, not version
      versionChanged = false
      break
    default:
      newPatch++
      newBuild = 1 // Reset build number on patch version bump
      break
  }

  const newVersion = `${newMajor}.${newMinor}.${newPatch}`
  const newFullVersion = `${newMajor}.${newMinor}.${newPatch}.${newBuild}` // Chrome-style version
  
  // Update package.json with 3-part version (for compatibility)
  if (versionChanged) {
    pkg.version = newVersion
    fs.writeFileSync(packageFile, JSON.stringify(pkg, null, 2))
  }
  
  // Update electron-builder.yml with full 4-part version for installer naming
  if (fs.existsSync(electronBuilderFile)) {
    let builderContent = fs.readFileSync(electronBuilderFile, 'utf8')
    // Update or add buildVersion
    if (builderContent.includes('buildVersion:')) {
      builderContent = builderContent.replace(/buildVersion: ".+?"/, `buildVersion: "${newFullVersion}"`)
    } else {
      builderContent = builderContent.replace(
        /(productName: ClipPAilot\n)/,
        `$1buildVersion: "${newFullVersion}"\n`
      )
    }
    fs.writeFileSync(electronBuilderFile, builderContent)
  }

  // Always update version.ts with Chrome-style versioning
  const versionContent = `/**
 * ClipPAilot Version Information
 * Auto-generated version file - do not edit manually
 */

export const VERSION = {
  major: ${newMajor},
  minor: ${newMinor},
  patch: ${newPatch},
  build: ${newBuild},
  fullVersion: '${newFullVersion}',
  buildDate: '${new Date().toISOString()}',
  features: [
    'YouTube Search & Preview',
    'Intelligent Search Autocomplete',
    'Multi-format Downloads (MP3, MP4, AAC, FLAC, etc.)',
    'Custom Download Settings',
    'Real-time Download Progress',
    'Multilingual Support (English, Hebrew)',
    'License-aware Content Filtering',
    'Modern Electron + React Architecture'
  ]
} as const

export const getVersionString = (): string => {
  return VERSION.fullVersion
}

export const getBuildInfo = (): string => {
  return \`Build \${VERSION.build} (\${new Date(VERSION.buildDate).toLocaleDateString()})\`
}

export const getAppInfo = () => ({
  name: 'ClipPAilot',
  version: VERSION.fullVersion,
  build: VERSION.build,
  buildDate: VERSION.buildDate,
  features: VERSION.features
})`

  fs.writeFileSync(versionFile, versionContent)

  // Update installer script with new version
  updateInstallerScript(newFullVersion)

  // Update documentation files if version changed
  if (versionChanged && oldVersion !== newVersion) {
    updateDocumentationFiles(oldVersion, newVersion)
  }

  if (versionChanged) {
    console.log(`✅ Version updated to ${newFullVersion} (Chrome-style)`)
    console.log(`📦 Updated package.json (${newVersion}), src/version.ts, electron-builder.yml, and installer.nsh (${newFullVersion})`)
    console.log(`📚 Updated all documentation files`)
  } else {
    console.log(`✅ Build number updated to ${newFullVersion} (Chrome-style)`)
    console.log(`📦 Updated src/version.ts, electron-builder.yml, and installer.nsh with new build number`)
  }
  return versionChanged ? newVersion : oldVersion
}

// CLI usage
if (require.main === module) {
  const type = process.argv[2] || 'patch'
  
  if (!['major', 'minor', 'patch', 'build'].includes(type)) {
    console.error('❌ Invalid version type. Use: major, minor, patch, or build')
    process.exit(1)
  }

  updateVersion(type)
}

module.exports = { updateVersion }
