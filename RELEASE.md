# ClipPAilot Release Guide

This guide explains how to create and publish releases of ClipPAilot with automated installers.

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **GitHub Actions**: Enabled in your repository (enabled by default)
3. **Git Tags**: Used to trigger releases

## 🚀 Creating a Release

### Method 1: Automated Script (Recommended)

```bash
# Create a patch release (1.0.3 → 1.0.4)
npm run release:patch

# Create a minor release (1.0.3 → 1.1.0)
npm run release:minor

# Create a major release (1.0.3 → 2.0.0)
npm run release:major
```

This script will:
1. ✅ Bump the version number
2. ✅ Build the application
3. ✅ Create the installer
4. ✅ Create a git commit and tag
5. ✅ Show you the next steps

### Method 2: Manual Process

```bash
# 1. Bump version
npm run version:patch  # or version:minor, version:major

# 2. Build application
npm run build

# 3. Create installer
npm run dist

# 4. Create git tag
git add .
git commit -m "Release v1.0.4"
git tag v1.0.4
```

## 📤 Publishing the Release

After creating your local release, push to GitHub:

```bash
# Push code and tags to GitHub
git push origin main --tags
```

The GitHub Action will automatically:
1. ✅ Build the installer on GitHub servers
2. ✅ Create a GitHub Release
3. ✅ Upload the installer file
4. ✅ Generate release notes

## 🎯 GitHub Release Features

Your releases will include:

### 📁 **Installer File**
- `ClipPAilot-Setup-v1.0.4.exe` - Ready-to-install Windows executable

### 📋 **Release Notes**
- What's new in this version
- Installation instructions
- Supported languages list
- System requirements
- Full changelog link

### 🌍 **Multi-language Support**
- Automatic documentation of all 9 supported languages
- Installation instructions in English

## 🔧 GitHub Actions Workflows

### 🚀 **Release Workflow** (`.github/workflows/release.yml`)
- **Trigger**: When you push a git tag (e.g., `v1.0.4`)
- **Runs on**: Windows (for Windows installer)
- **Output**: GitHub Release with installer

### 🔨 **Build Workflow** (`.github/workflows/build.yml`)
- **Trigger**: Every push to main/develop, and pull requests
- **Purpose**: Continuous integration testing
- **Output**: Build artifacts for testing

## 📝 Release Checklist

Before creating a release:

- [ ] All features tested and working
- [ ] All translation files are valid JSON
- [ ] Version number updated appropriately
- [ ] Commit all changes to git
- [ ] Ready to tag and push

## 🎉 Your First Release

To create your very first release:

```bash
# 1. Create the release locally
npm run release:patch

# 2. Push to GitHub (this triggers the automated release)
git push origin main --tags

# 3. Visit your GitHub releases page
# https://github.com/ronled86/ClipPAilot/releases

# 4. Your installer will be available in ~5-10 minutes
```

## 🔍 Troubleshooting

**Release not appearing?**
- Check the Actions tab in GitHub for build status
- Ensure you pushed the tags: `git push origin main --tags`

**Build failing?**
- Check the build logs in GitHub Actions
- Ensure all dependencies are in package.json
- Test locally first with `npm run dist`

**Wrong version number?**
- Update package.json manually
- Create a new tag: `git tag v1.0.5 && git push origin v1.0.5`

---

🎊 **Congratulations!** You now have automated releases for ClipPAilot!
