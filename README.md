# 🎥 ClipPAilot

**A powerful YouTube search, preview, and download client with intelligent features and license-aware content filtering.**

[![Version](https://img.shields.io/badge/version-1.0.10-blue.svg)](package.json)
[![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)](#)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)

## ✨ Features

### 🔍 **Smart Search & Discovery**
- **YouTube Integration**: Real-time search with YouTube's content database
- **Intelligent Autocomplete**: AI-powered suggestions from YouTube's search API
- **Search History**: Persistent search history with smart suggestions
- **Trending Content**: Discover popular videos when you open the app

### 🎬 **Media Management**
- **Multi-format Downloads**: MP3, MP4, AAC, FLAC, WAV, WebM, MKV and more
- **Quality Control**: Choose from 360p to 4K video quality
- **Audio Extraction**: High-quality audio extraction with customizable bitrates
- **Codec Selection**: H.264, H.265, VP9, AV1 support

### 🎛️ **Advanced Settings**
- **Customizable Download Preferences**: Set default formats, quality, and codecs
- **Folder Management**: Choose your download directory
- **Format Optimization**: Automatic format selection for best compatibility

### 🌐 **User Experience**
- **Multilingual Support**: English and Hebrew with RTL support
- **Real-time Progress**: Live download progress tracking
- **License Awareness**: Respects content licenses and YouTube Terms of Service
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

### 🔒 **Security & Privacy**
- **Secure Architecture**: Electron with context isolation and sandboxing
- **No Node in Renderer**: Enhanced security with isolated processes
- **Local Processing**: All downloads processed locally on your machine

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Windows 10/11** - Currently Windows-focused
- **ffmpeg.exe** - For video/audio processing
- **yt-dlp.exe** - For YouTube content downloading

### Installation

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd ClipPAilot
   npm ci
   ```

2. **Setup Required Tools**
   
   Download and place these tools in the specified directories:
   
   ```
   tools/
   ├── ffmpeg/
   │   └── ffmpeg.exe          # Download from https://ffmpeg.org/
   └── yt-dlp/
       └── yt-dlp.exe          # Download from https://github.com/yt-dlp/yt-dlp
   ```

3. **Run the Application**
   ```bash
   # Quick start (double-click)
   start_clippailot.bat
   
   # Or manually
   npm run dev
   ```

## 🛠️ Development

### Development Mode
```bash
npm run dev
```
This runs three concurrent processes:
- **TypeScript Compiler**: Watches and compiles main/preload processes
- **Vite Dev Server**: React development server on port 5173
- **Electron**: Main application pointing to dev server

### Building for Production
```bash
npm run dist
```
Creates a Windows installer in the `release/` directory.

### Version Management
```bash
# Bump patch version (1.0.0 → 1.0.1)
npm run version:patch

# Bump minor version (1.0.0 → 1.1.0)  
npm run version:minor

# Bump major version (1.0.0 → 2.0.0)
npm run version:major
```

### Project Cleanup
```bash
npm run clean
```
Removes unused files and cleans up the project structure.

## 📁 Project Structure

```
ClipPAilot/
├── src/
│   ├── main/              # Electron main process
│   │   └── index.ts       # Main application logic, YouTube API, downloads
│   ├── preload/           # Secure IPC bridge
│   │   └── index.ts       # Typed API bridge with Zod validation
│   ├── renderer/          # React frontend
│   │   ├── components/    # React components
│   │   │   ├── SearchBar.tsx           # Smart search with autocomplete
│   │   │   ├── SettingsModal.tsx       # Download configuration
│   │   │   ├── VideoPreviewModal.tsx   # Video preview player
│   │   │   ├── DownloadNotifications.tsx # Progress tracking
│   │   │   └── AnimatedLogo.tsx        # Animated logo component
│   │   ├── i18n/          # Internationalization
│   │   │   └── locales/   # English and Hebrew translations
│   │   ├── App.tsx        # Main React application
│   │   └── main.tsx       # React entry point
│   └── version.ts         # Automated version management
├── tools/                 # External binaries
│   ├── ffmpeg/           # Video/audio processing
│   └── yt-dlp/           # YouTube downloading
├── scripts/              # Build and utility scripts
│   ├── version-bump.js   # Version management
│   ├── cleanup.js        # Project cleanup
│   └── icon-scripts/     # Icon processing
└── assets/               # Application assets
    └── logo.svg          # Animated SVG logo
```

## 🎯 Key Components

### SearchBar Component
- **YouTube Autocomplete**: Real-time suggestions from YouTube's API
- **Search History**: Persistent local storage of search terms
- **Keyboard Navigation**: Arrow keys, Tab completion, Enter to search
- **Smart Suggestions**: Combines YouTube, history, and fallback suggestions

### SettingsModal Component  
- **Audio Settings**: Format (MP3, AAC, FLAC), bitrate selection
- **Video Settings**: Format (MP4, WebM, MKV), quality (360p-4K), codec selection
- **Download Management**: Custom folder selection, default preferences

### Download System
- **Multi-format Support**: Handles various audio and video formats
- **Progress Tracking**: Real-time download progress with notifications
- **Error Handling**: Comprehensive error reporting and recovery
- **License Checking**: Validates content licenses before download

## 🌍 Internationalization

ClipPAilot supports multiple languages with proper RTL (Right-to-Left) layout:

- **English (en)**: Default language with LTR layout
- **Hebrew (he)**: Full RTL support with Hebrew translations

Add new languages by:
1. Creating translation files in `src/renderer/i18n/locales/`
2. Adding language options in the header dropdown
3. Updating the i18n configuration

## ⚙️ Configuration

### Download Settings
```typescript
interface DownloadSettings {
  downloadFolder: string      // Custom download directory
  defaultFormat: 'mp3' | 'mp4'  // Default download type
  audioFormat: string         // MP3, AAC, FLAC, WAV, OGG, M4A
  audioBitrate: string        // 96k, 128k, 192k, 256k, 320k, best
  videoFormat: string         // MP4, WebM, MKV, AVI, MOV
  videoQuality: string        // 360p, 480p, 720p, 1080p, 1440p, 2160p, best
  videoCodec: string          // H.264, H.265, VP9, AV1, best
}
```

### Environment Variables
Create a `.env` file for configuration:
```env
# YouTube API Configuration (if using direct API)
YOUTUBE_API_KEY=your_api_key_here

# Application Settings
DEFAULT_DOWNLOAD_FOLDER=C:\Users\YourName\Downloads\ClipPAilot
```

## 🔧 Troubleshooting

### Common Issues

**"Port 5173 is in use"**
- The dev server will automatically try alternative ports (5174, 5175, etc.)
- Or manually kill the process using the port

**Downloads Not Working**
- Ensure `ffmpeg.exe` and `yt-dlp.exe` are in the correct directories
- Check Windows Defender/antivirus isn't blocking the executables
- Verify tools have necessary permissions

**Search Not Loading**
- Check internet connection
- YouTube's API might be temporarily unavailable
- Try refreshing the application

**UI Language Issues**
- Clear browser cache if using dev mode
- Check translation files exist for your language
- Restart the application

### Debug Mode
Enable detailed logging by running:
```bash
cross-env DEBUG=* npm run dev
```

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Use TypeScript for type safety
- Follow React best practices
- Add proper error handling
- Include tests for new features
- Update documentation for changes

## 📄 License

This project is licensed under the Apache License 2.0. See `LICENSE` file for details.

**Important**: Respect YouTube's Terms of Service and content creators' rights. This tool should only be used for content you have permission to download.

## 🙏 Acknowledgments

- **Electron** - Cross-platform desktop framework
- **React** - UI library
- **yt-dlp** - Powerful YouTube downloader
- **ffmpeg** - Media processing toolkit
- **Tailwind CSS** - Utility-first CSS framework
- **YouTube** - Content platform and APIs

---

**Made with ❤️ for content creators and media enthusiasts**