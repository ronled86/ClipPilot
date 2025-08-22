# 🚀 ClipPilot Automated Build System

## 📦 Unique Installer Generation

Every time you build an installer, it automatically gets a **unique build number** to prevent version conflicts and enable proper tracking.

## 🔧 Build Commands

### **Recommended Commands (Auto-versioning):**

```bash
# Create EXE installer with unique build number
npm run dist:exe

# Create MSI installer with unique build number  
npm run dist:msi

# Create both EXE and MSI installers
npm run dist:both
```

### **Manual Version Control:**

```bash
# Increment patch version (1.0.1 → 1.0.2)
npm run version:patch

# Increment minor version (1.0.1 → 1.1.0)
npm run version:minor

# Increment major version (1.0.1 → 2.0.0)
npm run version:major

# Only update build number (keeps version same)
npm run version:build
```

### **Legacy Commands:**

```bash
# Manual build without auto-versioning
npm run dist:manual

# Build all Windows targets with version bump
npm run dist:all
```

## 📋 Build Process Flow

When you run `npm run dist:exe`:

1. **🔢 Auto-increment build number** → Generates unique timestamp
2. **📝 Update version files** → Updates `src/version.ts` with new build info
3. **⚙️ Configure builder** → Temporarily adds build number to installer name
4. **🔨 Build application** → Runs Vite build + TypeScript compilation
5. **📦 Create installer** → Generates installer with unique filename
6. **🔄 Restore config** → Restores original electron-builder.yml
7. **📁 Copy to installers/** → Saves installer in organized folder

## 📁 File Naming Convention

```
ClipPilot-Setup-{version}-build{timestamp}.exe
```

**Examples:**
- `ClipPilot-Setup-1.0.1-build1755858475986.exe`
- `ClipPilot-Setup-1.0.1-build1755858570936.exe`
- `ClipPilot-Setup-1.0.2-build1755858634122.exe`

## 🎯 Benefits

✅ **No Version Conflicts** - Each build has unique identifier  
✅ **Easy Tracking** - Build timestamp embedded in filename  
✅ **Automatic Process** - No manual version management needed  
✅ **Clean Organization** - All installers saved to `installers/` folder  
✅ **Git-Friendly** - Version files automatically updated  

## 🔍 Version Information

The app displays complete version info including:
- **Version**: 1.0.1
- **Build**: 1755858570936
- **Build Date**: 2025-08-22
- **Features**: Complete feature list

## 📊 Build Tracking

Each installer contains:
- **Unique build timestamp**
- **Exact version number** 
- **Build date and time**
- **Feature compatibility info**

## 🛠️ Technical Details

- **Build Numbers**: Unix timestamp (milliseconds since epoch)
- **Version Format**: Semantic versioning (major.minor.patch)
- **Config Management**: Automatic backup/restore of electron-builder.yml
- **Error Handling**: Automatic config restoration on build failure

---

**Now you can build installers as many times as you want without worrying about conflicts!** 🎉
