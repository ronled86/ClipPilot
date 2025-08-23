# ClipPAilot Cleanup Tools

This folder contains tools to completely remove ClipPAilot from any Windows computer, including orphaned installations that can't be uninstalled normally.

## 🚀 Quick Start (Easiest Method)

1. **Copy both files to the target computer:**
   - `ClipPAilot-Cleanup.bat`
   - `cleanup-orphaned-install.ps1`

2. **Right-click `ClipPAilot-Cleanup.bat` and select "Run as administrator"**

3. **Follow the prompts**

That's it! The tool will handle everything automatically.

## 📋 What Gets Removed

### ✅ Registry Entries
- All uninstall entries (HKCU and HKLM)
- Application settings in registry
- Orphaned entries with any GUID variations

### ✅ Files & Folders
- Program Files installations (both x86 and x64)
- User-specific installations
- Application data and cache
- Temporary files
- Log files

### ✅ Shortcuts
- Desktop shortcuts
- Start Menu shortcuts
- Quick Launch shortcuts

### ✅ Processes
- All running ClipPAilot processes
- Background updater processes

## 🛠️ Advanced Usage

### PowerShell Script Options

You can run the PowerShell script directly with additional options:

```powershell
# Basic cleanup (removes everything)
.\cleanup-orphaned-install.ps1

# Keep downloaded files (preserves videos/music downloads)
.\cleanup-orphaned-install.ps1 -KeepDownloads

# Silent mode (no prompts or output)
.\cleanup-orphaned-install.ps1 -Silent -Force

# Keep downloads and run silently
.\cleanup-orphaned-install.ps1 -KeepDownloads -Silent -Force
```

### Manual Registry Cleanup

If you need to check registry entries manually:

1. Open `regedit.exe` as Administrator
2. Navigate to these locations and delete any ClipPAilot entries:
   - `HKCU\Software\Microsoft\Windows\CurrentVersion\Uninstall\`
   - `HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\`
   - `HKCU\Software\ClipPAilot`
   - `HKLM\Software\ClipPAilot`

## 🔒 Security Notes

- **Administrator privileges required**: The script needs admin rights to remove system-wide installations and registry entries
- **Safe operation**: The script only removes ClipPAilot-related files and settings
- **Backup preservation**: Downloaded videos/music can be preserved with `-KeepDownloads`

## 🚨 When to Use This Tool

Use this cleanup tool when:

- ❌ Normal uninstall doesn't work or shows errors
- ❌ ClipPAilot appears in "Add/Remove Programs" but won't uninstall
- ❌ Getting "already installed" errors when trying to install
- ❌ Old versions are interfering with new installations
- ❌ Multiple broken entries in Control Panel
- ❌ Installation files are corrupted or partially removed

## 📁 File Descriptions

| File | Purpose |
|------|---------|
| `ClipPAilot-Cleanup.bat` | Easy-to-use batch launcher that handles admin elevation |
| `cleanup-orphaned-install.ps1` | Complete PowerShell script that does the actual cleanup |
| `README.md` | This documentation file |

## 🆘 Troubleshooting

### "Execution Policy" Error
If you get a PowerShell execution policy error:
```cmd
powershell -ExecutionPolicy Bypass -File cleanup-orphaned-install.ps1
```

### "Access Denied" Errors
- Make sure you're running as Administrator
- Close any running ClipPAilot instances first
- Some antivirus software may interfere - temporarily disable real-time protection

### Files Still Remain
- Reboot the computer and try again
- Some files may be locked by Windows - a restart usually fixes this
- Check if ClipPAilot is running in Task Manager (including background processes)

## ✅ Verification

After running the cleanup, verify it worked:

1. ✅ Check Control Panel → Programs → no ClipPAilot entries
2. ✅ Check Start Menu → no ClipPAilot shortcuts
3. ✅ Check Desktop → no ClipPAilot shortcuts
4. ✅ Check `C:\Program Files\ClipPAilot` → folder doesn't exist
5. ✅ Check Task Manager → no ClipPAilot processes

## 🔄 Fresh Installation

After cleanup is complete, you can:

1. Download the latest ClipPAilot installer
2. Install normally - no conflicts or errors should occur
3. All settings will be fresh (unless you used `-KeepDownloads`)

---

**💡 Tip**: Keep these cleanup files handy for future use or share them with other ClipPAilot users who might need them!
