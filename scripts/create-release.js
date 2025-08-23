const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const versionType = args[0] || 'patch'; // patch, minor, major

if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('Usage: node scripts/create-release.js [patch|minor|major]');
  process.exit(1);
}

try {
  console.log(`🚀 Creating ${versionType} release...`);
  
  // Read current package.json
  const packagePath = path.join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  console.log(`📦 Current version: ${pkg.version}`);
  
  // Bump version
  console.log(`⬆️  Bumping ${versionType} version...`);
  execSync(`npm run version:${versionType}`, { stdio: 'inherit' });
  
  // Read new version
  const newPkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const newVersion = newPkg.version;
  
  console.log(`✅ New version: ${newVersion}`);
  
  // Build the application
  console.log('🔨 Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Create installer
  console.log('📦 Creating installer...');
  execSync('npm run dist', { stdio: 'inherit' });
  
  // Create git tag
  const tagName = `v${newVersion}`;
  console.log(`🏷️  Creating git tag: ${tagName}`);
  
  execSync(`git add .`, { stdio: 'inherit' });
  execSync(`git commit -m "Release ${tagName}"`, { stdio: 'inherit' });
  execSync(`git tag ${tagName}`, { stdio: 'inherit' });
  
  console.log(`
🎉 Release ${tagName} ready!

Next steps:
1. Push to GitHub: git push origin main --tags
2. The GitHub Action will automatically create the release
3. Or create a manual release at: https://github.com/ronled86/ClipPAilot/releases/new

Files created:
- release/ClipPAilot-Setup-${newVersion}.exe
`);

} catch (error) {
  console.error('❌ Release creation failed:', error.message);
  process.exit(1);
}
