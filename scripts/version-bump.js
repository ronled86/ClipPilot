#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const versionFile = path.join(__dirname, '..', 'src', 'version.ts')
const packageFile = path.join(__dirname, '..', 'package.json')

function updateVersion(type = 'patch') {
  // Read current package.json
  const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'))
  const [major, minor, patch] = pkg.version.split('.').map(Number)

  let newMajor = major
  let newMinor = minor  
  let newPatch = patch
  let versionChanged = true

  switch (type) {
    case 'major':
      newMajor++
      newMinor = 0
      newPatch = 0
      break
    case 'minor':
      newMinor++
      newPatch = 0
      break
    case 'patch':
      newPatch++
      break
    case 'build':
      // Only update build number, not version
      versionChanged = false
      break
    default:
      newPatch++
      break
  }

  const newVersion = `${newMajor}.${newMinor}.${newPatch}`
  
  // Update package.json only if version changed
  if (versionChanged) {
    pkg.version = newVersion
    fs.writeFileSync(packageFile, JSON.stringify(pkg, null, 2))
  }

  // Always update version.ts with new build timestamp
  const versionContent = `/**
 * ClipPAilot Version Information
 * Auto-generated version file - do not edit manually
 */

export const VERSION = {
  major: ${newMajor},
  minor: ${newMinor},
  patch: ${newPatch},
  build: ${Date.now()},
  tag: 'stable',
  fullVersion: '${newVersion}',
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
  return \`\${VERSION.fullVersion}-\${VERSION.tag}\`
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

  if (versionChanged) {
    console.log(`✅ Version updated to ${newVersion}`)
    console.log(`📦 Updated package.json and src/version.ts`)
  } else {
    console.log(`✅ Build number updated for version ${newVersion}`)
    console.log(`📦 Updated src/version.ts with new build timestamp`)
  }
  return newVersion
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
