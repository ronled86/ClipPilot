# ClipPAilot Development Scripts

This directory contains improved scripts for running ClipPAilot in development mode with better process management.

## Available Scripts

### 1. `start_ClipPAilot.bat` (Improved Batch Script)
- **Purpose**: Basic development launcher with enhanced cleanup
- **Features**: 
  - Automatic dependency installation
  - Tool verification (ffmpeg, yt-dlp)
  - Enhanced process cleanup on exit
  - More targeted process termination (won't kill unrelated Node.js processes)
- **Usage**: `.\start_ClipPAilot.bat`

### 2. `start_ClipPAilot.ps1` (PowerShell Script)
- **Purpose**: Advanced development launcher with superior process management
- **Features**:
  - Better error handling and logging
  - More precise process identification and cleanup
  - Colored output for better readability
  - Advanced signal handling for clean exits
- **Usage**: `powershell.exe -ExecutionPolicy Bypass -File start_ClipPAilot.ps1`

### 3. `launch_ClipPAilot.bat` (Script Selector)
- **Purpose**: Menu-driven launcher that lets you choose between batch and PowerShell versions
- **Usage**: `.\launch_ClipPAilot.bat`

## Key Improvements

### Process Management
- **Automatic Cleanup**: When you exit the ClipPAilot application, all related processes are automatically terminated
- **Targeted Termination**: Scripts now identify and kill only processes related to the development environment
- **Signal Handling**: Proper handling of Ctrl+C and window close events

### Enhanced npm Scripts
The `package.json` has been updated with improved `concurrently` flags:
```json
"dev": "concurrently --kill-others --kill-others-on-fail \"vite\" \"tsc -p tsconfig.node.json -w\" \"cross-env NODE_ENV=development DEV_SERVER_URL=http://localhost:5173 electron .\""
```

### What Gets Cleaned Up
- Vite development server processes
- TypeScript compiler watch processes  
- Electron main processes
- ClipPAilot executable processes
- Related console host processes

## Recommended Usage

1. **For most users**: Use `launch_ClipPAilot.bat` to choose your preferred method
2. **For basic usage**: Use `start_ClipPAilot.bat` 
3. **For advanced usage**: Use `start_ClipPAilot.ps1` (requires PowerShell execution policy changes)

## Problem Solved

Previously, when you closed the ClipPAilot application window, background processes (Node.js, Vite, TypeScript compiler) would continue running, requiring manual termination. These improved scripts automatically detect when the main application exits and clean up all related processes.

## Notes

- The PowerShell script provides better process identification and cleanup
- Both scripts check for required dependencies before starting
- Process cleanup is designed to be safe and won't interfere with other applications
- All scripts include proper error handling and user feedback
