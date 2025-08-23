# 📦 Installation Guide

This guide will help you install ClipPAilot on your Windows system.

## 🔧 System Requirements

Before installing ClipPAilot, make sure your system meets these requirements:

### **Minimum Requirements**
- **OS**: Windows 10 (version 1809 or later) or Windows 11
- **Architecture**: x64 (64-bit)
- **RAM**: 4 GB RAM
- **Storage**: 500 MB free disk space
- **Internet**: Broadband connection for YouTube integration

### **Recommended**
- **OS**: Windows 11 (latest)
- **RAM**: 8 GB RAM or more
- **Storage**: 2 GB free disk space (for downloads)
- **Graphics**: DirectX 11 compatible

## 📥 Download Options

### **Option 1: GitHub Releases (Recommended)**

1. **Visit the Releases Page**:
   - Go to: [ClipPAilot Releases](https://github.com/ronled86/ClipPAilot/releases)

2. **Download Latest Version**:
   - Click on the latest release
   - Download `ClipPAilot-Setup-X.X.X.exe`

3. **Verify Download** (Optional):
   - Download the `.blockmap` file for integrity verification

### **Option 2: Direct Download**

Latest stable release: **[ClipPAilot v1.0.10](https://github.com/ronled86/ClipPAilot/releases/latest)**

## 🚀 Installation Steps

### **Standard Installation**

1. **Run the Installer**:
   - Double-click `ClipPAilot-Setup-X.X.X.exe`
   - Windows may show a security warning - click "More info" → "Run anyway"

2. **Follow Setup Wizard**:
   - Choose installation directory (default: `C:\Users\[username]\AppData\Local\Programs\ClipPAilot`)
   - Select additional options:
     - ✅ Create desktop shortcut
     - ✅ Add to Start Menu
     - ✅ Register file associations

3. **Complete Installation**:
   - Click "Install" to begin installation
   - Wait for files to be copied
   - Choose whether to launch ClipPAilot immediately

### **Silent Installation**

For automated deployment:

```cmd
ClipPAilot-Setup-1.0.10.exe /S
```

**Parameters:**
- `/S` - Silent install
- `/D=C:\MyPath` - Custom install directory

## 🔄 Updating ClipPAilot

### **Automatic Updates**
ClipPAilot includes an auto-updater that:
- Checks for updates on startup
- Downloads updates in the background
- Prompts to restart and apply updates

### **Manual Updates**
1. Download the latest installer
2. Run it over your existing installation
3. Your settings and downloads will be preserved

## 🗑️ Uninstallation

### **Using Windows Settings**
1. Open **Settings** → **Apps**
2. Search for "ClipPAilot"
3. Click **Uninstall**

### **Using Control Panel**
1. Open **Control Panel** → **Programs and Features**
2. Find "ClipPAilot" in the list
3. Click **Uninstall**

### **Complete Removal**
To remove all data:
1. Uninstall ClipPAilot (above steps)
2. Delete settings folder: `%APPDATA%\clippailot-desktop`
3. Delete downloads folder (if created by ClipPAilot)

## 🔧 Post-Installation Setup

After installation:

1. **First Launch**: See [First Launch Guide](First-Launch)
2. **API Setup**: Configure YouTube API key if needed
3. **Settings**: Customize download preferences
4. **Language**: Choose your preferred language

## 🛠️ Troubleshooting Installation

### **Common Issues**

**"Windows protected your PC" warning:**
- This is normal for new software
- Click "More info" → "Run anyway"
- Add ClipPAilot to Windows Defender exclusions if needed

**Installation fails:**
- Run installer as Administrator
- Temporarily disable antivirus
- Check available disk space
- Close other applications

**Cannot find ClipPAilot after installation:**
- Check Start Menu under "ClipPAilot"
- Look for desktop shortcut
- Navigate to installation directory

**"Missing dependencies" error:**
- Install Microsoft Visual C++ Redistributable
- Update Windows to latest version
- Install .NET Framework if prompted

### **Advanced Installation**

**Custom Installation Directory:**
```cmd
ClipPAilot-Setup-1.0.10.exe /D=C:\CustomPath\ClipPAilot
```

**Corporate Environment:**
- Use Group Policy to deploy
- Consider silent installation options
- Pre-configure settings via registry

## 📞 Getting Help

If you encounter installation issues:

1. Check our [Troubleshooting Guide](Troubleshooting)
2. Review [System Requirements](#system-requirements)
3. Create an issue on [GitHub](https://github.com/ronled86/ClipPAilot/issues)

---

**Next Steps**: [First Launch Setup →](First-Launch)
