# ClipPilot Project Information

## 📊 Project Status
- **Version**: 1.0.0
- **Status**: Production Ready
- **Last Updated**: August 22, 2025
- **Platform**: Windows (Electron + React)
- **License**: Apache 2.0

## 🎯 Core Features Implemented
✅ YouTube Search & Discovery  
✅ Intelligent Search Autocomplete  
✅ Multi-format Downloads (MP3, MP4, AAC, FLAC, etc.)  
✅ Custom Download Settings  
✅ Real-time Progress Tracking  
✅ Multilingual Support (English, Hebrew)  
✅ License-aware Content Filtering  
✅ Modern UI with Tailwind CSS  
✅ Secure Electron Architecture  

## 🛠️ Development Commands

### 🚀 Running the Application
```bash
# Development mode (with hot reload)
npm run dev

# Quick start (Windows batch file)
start_clippilot.bat
```

### 📦 Building & Distribution
```bash
# Build for production
npm run dist

# Build without packaging
npm run build

# Package only (after build)
npm run pack
```

### 🔧 Version Management
```bash
# Patch version (1.0.0 → 1.0.1)
npm run version:patch

# Minor version (1.0.0 → 1.1.0)
npm run version:minor

# Major version (1.0.0 → 2.0.0)
npm run version:major
```

### 🧹 Maintenance
```bash
# Clean unused files
npm run clean

# Icon processing
npm run setup-icons
npm run convert-icon
npm run auto-icon
```

## 📁 Key File Locations

### 🔧 Configuration Files
- `package.json` - Project dependencies and scripts
- `electron-builder.yml` - Build and packaging configuration
- `vite.config.ts` - Frontend build configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.cjs` - UI styling configuration

### 💻 Source Code
- `src/main/index.ts` - Electron main process (YouTube API, downloads)
- `src/preload/index.ts` - Secure IPC bridge
- `src/renderer/App.tsx` - Main React application
- `src/renderer/components/` - React UI components
- `src/version.ts` - Automated version management

### 🛠️ Scripts & Tools
- `scripts/version-bump.js` - Version management automation
- `scripts/cleanup.js` - Project cleanup utility
- `scripts/` - Icon processing and other utilities

### 📖 Documentation
- `README.md` - Comprehensive project documentation
- `CHANGELOG.md` - Version history and changes
- `PROJECT_INFO.md` - This file (project overview)

## 🎨 UI Components

### Core Components
- **SearchBar**: YouTube autocomplete, search history, keyboard navigation
- **SettingsModal**: Download preferences, format selection, quality settings
- **VideoPreviewModal**: In-app video preview player
- **DownloadNotifications**: Real-time progress tracking
- **AnimatedLogo**: SVG logo with animations

### Features per Component
- **SearchBar**: YouTube API integration, localStorage history, debounced suggestions
- **SettingsModal**: Audio/video format selection, quality presets, codec options
- **App**: Main layout, infinite scroll, trending videos, download management

## 🔧 Technical Architecture

### Frontend (Renderer Process)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for development and building
- **react-i18next** for internationalization

### Backend (Main Process)
- **Electron** with security best practices
- **yt-dlp** for YouTube downloading
- **ffmpeg** for media processing
- **Node.js** APIs for file system operations

### Security
- Context isolation enabled
- Sandbox mode for renderer
- No Node.js in renderer process
- Secure IPC with Zod validation

## 🌍 Internationalization
- **English (en)**: Default language with LTR layout
- **Hebrew (he)**: Full RTL support with Hebrew translations
- **Extensible**: Easy to add more languages

## 📋 Dependencies

### Production Dependencies
- React ecosystem (react, react-dom, react-i18next)
- Electron for desktop app framework
- yt-dlp integration for downloads
- Zod for runtime validation
- Internationalization support

### Development Dependencies
- TypeScript for type safety
- Vite for fast development
- Tailwind CSS for styling
- Electron Builder for packaging
- Various build and development tools

## 🎯 Next Steps / Roadmap

### Potential Enhancements
- [ ] Playlist download support
- [ ] Download queue management
- [ ] Subtitle download options
- [ ] Audio visualization
- [ ] Dark theme support
- [ ] macOS and Linux support
- [ ] Batch download operations
- [ ] Advanced search filters

### Performance Optimizations
- [ ] Download caching mechanism
- [ ] Thumbnail lazy loading
- [ ] Search result virtualization
- [ ] Background download processing

## 💡 Development Tips

### Adding New Features
1. Update version using `npm run version:patch/minor/major`
2. Add feature to `src/version.ts` features array
3. Update `CHANGELOG.md` with changes
4. Test thoroughly in development mode
5. Build and test production version

### Debugging
- Use `cross-env DEBUG=* npm run dev` for verbose logging
- Check Electron DevTools for renderer issues
- Monitor main process console for backend issues
- Use React DevTools extension for component debugging

---

**Project maintained with ❤️ | Built for content creators and media enthusiasts**
