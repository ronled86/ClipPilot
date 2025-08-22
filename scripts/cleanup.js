#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const filesToRemove = [
  // Empty/unused documentation files
  'FEATURES.md',
  'OAUTH_SETUP.md',
  'OAUTH_CHECKLIST.md',
  'OAUTH_STEP_BY_STEP.md',
  'YOUR_OAUTH_DIAGNOSIS.md',
  'YOUTUBE_SETUP.md',
  'SORTING_FEATURES.md',
  
  // Unused components
  'src/renderer/components/YouTubeLogin.tsx',
  
  // Temporary icon creation file
  'create-icon-temp.js'
]

function removeFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath)
  
  try {
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath)
      
      if (stats.isFile()) {
        fs.unlinkSync(fullPath)
        console.log(`🗑️  Removed: ${filePath}`)
        return true
      } else {
        console.log(`⚠️  Skipped (not a file): ${filePath}`)
        return false
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`)
      return false
    }
  } catch (error) {
    console.error(`❌ Error removing ${filePath}:`, error.message)
    return false
  }
}

function cleanupProject() {
  console.log('🧹 Starting ClipPilot project cleanup...\n')
  
  let removedCount = 0
  let totalCount = filesToRemove.length
  
  for (const file of filesToRemove) {
    if (removeFile(file)) {
      removedCount++
    }
  }
  
  console.log(`\n✅ Cleanup completed!`)
  console.log(`📊 Removed ${removedCount}/${totalCount} files`)
  console.log(`🎯 Project is now cleaner and more organized`)
}

// CLI usage
if (require.main === module) {
  cleanupProject()
}

module.exports = { cleanupProject, removeFile }
