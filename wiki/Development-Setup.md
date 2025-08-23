# 🛠️ Development Setup

Guide for developers who want to contribute to ClipPAilot or build it from source.

## 🔧 Prerequisites

### **Required Software**

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | ≥20.19.0 | JavaScript runtime |
| **npm** | ≥10.0.0 | Package manager |
| **Git** | Latest | Version control |
| **VS Code** | Latest | Recommended editor |

### **System Requirements**
- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: 8 GB minimum (16 GB recommended)
- **Storage**: 2 GB free space for dependencies
- **Network**: High-speed internet for downloads

## 📥 **Getting the Source Code**

### **Clone Repository**
```bash
# HTTPS
git clone https://github.com/ronled86/ClipPAilot.git

# SSH (if you have access)
git clone git@github.com:ronled86/ClipPAilot.git

cd ClipPAilot
```

### **Fork for Contributing**
1. **Fork Repository**: Click "Fork" on GitHub
2. **Clone Your Fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ClipPAilot.git
   cd ClipPAilot
   ```
3. **Add Upstream**:
   ```bash
   git remote add upstream https://github.com/ronled86/ClipPAilot.git
   ```

## 📦 **Installation**

### **Install Dependencies**
```bash
# Install all dependencies
npm install

# Verify installation
npm run build
```

### **Environment Setup**

1. **Copy Environment File**:
   ```bash
   cp .env.example .env
   ```

2. **Configure API Keys** (Optional):
   ```properties
   # YouTube Data API v3 Key (for enhanced search)
   YOUTUBE_API_KEY=your_youtube_api_key_here
   
   # AI Studio API Key (for AI features)
   AI_STUDIO_API_KEY=your_ai_studio_key_here
   ```

## 🚀 **Development Workflow**

### **Available Scripts**

```bash
# Development mode (hot reload)
npm run dev

# Build for production
npm run build

# Create installer
npm run dist

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### **Development Mode**
```bash
npm run dev
```

This starts:
- **Vite Dev Server**: Frontend with hot reload
- **TypeScript Compiler**: Watches for changes
- **Electron**: Desktop application

### **Project Structure**

```
ClipPAilot/
├── src/
│   ├── main/           # Electron main process
│   │   └── index.ts    # Main entry point
│   ├── preload/        # Preload scripts
│   │   └── index.ts    # IPC bridge
│   └── renderer/       # React frontend
│       ├── App.tsx     # Main component
│       ├── components/ # UI components
│       └── i18n/       # Internationalization
├── assets/             # Static assets
├── tools/              # External tools (ffmpeg, yt-dlp)
├── scripts/            # Build scripts
└── dist/               # Build output
```

## 🏗️ **Architecture Overview**

### **Technology Stack**
- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron 32
- **Bundler**: Vite 7
- **Styling**: Tailwind CSS
- **State**: React Hooks + Context
- **I18n**: react-i18next

### **Process Architecture**
```
┌─────────────────┐    ┌─────────────────┐
│   Main Process  │    │ Renderer Process│
│   (Node.js)     │◄──►│   (Chromium)    │
│                 │    │                 │
│ • File I/O      │    │ • React UI      │
│ • YouTube API   │    │ • User Events   │
│ • Downloads     │    │ • State Mgmt    │
│ • System Integ. │    │ • Rendering     │
└─────────────────┘    └─────────────────┘
         ▲                       ▲
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│ Preload Script  │    │   External APIs │
│ (Security)      │    │   (YouTube)     │
└─────────────────┘    └─────────────────┘
```

### **Key Components**

**Main Process (`src/main/index.ts`)**:
- Window management
- File system operations
- YouTube API integration
- Download handling
- System integration

**Renderer Process (`src/renderer/App.tsx`)**:
- User interface
- State management
- Event handling
- Component rendering

**Preload Script (`src/preload/index.ts`)**:
- Secure IPC bridge
- API exposure to renderer
- Security sandboxing

## 🔨 **Building & Packaging**

### **Development Build**
```bash
# Quick build for testing
npm run build
```

### **Production Build**
```bash
# Build + create installer
npm run dist
```

### **Platform-Specific Builds**
```bash
# Windows only
npm run dist:win

# macOS only (requires macOS)
npm run dist:mac

# Linux only
npm run dist:linux
```

### **Custom Build Configuration**

Edit `electron-builder.yml`:
```yaml
appId: com.yourcompany.clippailot
productName: ClipPAilot
directories:
  output: release
win:
  target:
    - target: nsis
      arch: [x64]
```

## 🧪 **Testing**

### **Unit Tests**
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### **E2E Tests**
```bash
# Run end-to-end tests
npm run test:e2e
```

### **Manual Testing**
1. **Start Development**: `npm run dev`
2. **Test Features**: Search, preview, download
3. **Check Logs**: Developer console for errors
4. **Performance**: Memory usage, responsiveness

## 🔍 **Debugging**

### **Main Process Debugging**
```bash
# Start with debugging enabled
npm run dev:debug
```

Then attach VS Code debugger or use Chrome DevTools.

### **Renderer Process Debugging**
- **Developer Tools**: `Ctrl+Shift+I`
- **React DevTools**: Install browser extension
- **Console Logs**: Check for errors and warnings

### **Common Debug Scenarios**

**API Issues**:
```javascript
// Add logging in main process
console.log('YouTube API Response:', response)
```

**UI State Issues**:
```javascript
// Add state debugging
useEffect(() => {
  console.log('State changed:', state)
}, [state])
```

## 📝 **Code Style & Guidelines**

### **TypeScript Standards**
- **Strict Mode**: Enabled for type safety
- **Interfaces**: Use for complex types
- **Types**: Explicit return types for functions
- **Naming**: camelCase for variables, PascalCase for components

### **React Patterns**
- **Functional Components**: Use hooks instead of classes
- **Custom Hooks**: Extract reusable logic
- **Props**: Use TypeScript interfaces
- **State**: Use useState and useReducer appropriately

### **File Organization**
```
src/renderer/components/
├── SearchBar.tsx          # Single component
├── VideoPreviewModal.tsx  # Modal component
└── settings/              # Feature folder
    ├── SettingsModal.tsx
    └── SettingsPanel.tsx
```

### **Linting & Formatting**
```bash
# Check code style
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format
```

## 🌐 **Internationalization**

### **Adding New Languages**

1. **Create Translation File**:
   ```bash
   cp src/renderer/i18n/locales/en/translation.json \
      src/renderer/i18n/locales/YOUR_LOCALE/translation.json
   ```

2. **Update i18n Config**:
   ```typescript
   // src/renderer/i18n/i18n.ts
   import yourLocale from './locales/YOUR_LOCALE/translation.json'
   
   const resources = {
     // ... existing
     YOUR_LOCALE: { translation: yourLocale }
   }
   ```

3. **Test Translation**:
   ```bash
   npm run dev
   # Change language in settings
   ```

### **Translation Guidelines**
- **Context**: Understand UI context for accurate translation
- **Length**: Consider text length for UI layout
- **Cultural**: Adapt for cultural differences
- **RTL**: Support right-to-left languages properly

## 🚀 **Deployment**

### **GitHub Actions**
The project includes automated CI/CD:

- **Build**: Automatic builds on push
- **Release**: Create releases with installers
- **Testing**: Run tests on multiple platforms

### **Local Release**
```bash
# Create release build
npm run dist

# Upload to GitHub
# (Manual process or use GitHub CLI)
```

## 🤝 **Contributing**

### **Development Process**
1. **Create Branch**: `git checkout -b feature/your-feature`
2. **Make Changes**: Follow code guidelines
3. **Test Changes**: Run tests and manual testing
4. **Commit**: Use conventional commit messages
5. **Push & PR**: Create pull request with description

### **Commit Message Format**
```
type(scope): description

feat(search): add autocomplete functionality
fix(download): resolve file naming issue
docs(wiki): update installation guide
style(ui): improve button spacing
```

### **Pull Request Guidelines**
- **Description**: Clear explanation of changes
- **Testing**: Describe how changes were tested
- **Screenshots**: Include UI changes if applicable
- **Breaking Changes**: Note any breaking changes

## 📞 **Getting Help**

**Development Questions**:
- Create GitHub Discussion
- Check existing issues
- Review documentation

**Bug Reports**:
- Include reproduction steps
- Provide error logs
- Specify environment details

---

**Next**: [API Documentation →](API-Documentation)
