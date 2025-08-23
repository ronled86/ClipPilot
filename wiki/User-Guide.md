# 👥 User Guide

Complete guide to using ClipPAilot for discovering, previewing, and downloading YouTube content.

## 🚀 Getting Started

### **Main Interface Overview**

ClipPAilot's interface is designed for simplicity and efficiency:

```
┌─────────────────────────────────────────────────────────┐
│ [🔍 Search Box]  [🔧 Settings] [ℹ️ About] [❌ Exit]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📺 Video Results Grid                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                    │
│  │[Thumb]  │ │[Thumb]  │ │[Thumb]  │                    │
│  │ Title   │ │ Title   │ │ Title   │                    │
│  │[👁️][⬇️]│ │[👁️][⬇️]│ │[👁️][⬇️]│                    │
│  └─────────┘ └─────────┘ └─────────┘                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔍 **Searching for Content**

### **Basic Search**
1. **Enter Search Terms**: Type your query in the search box
2. **Press Enter**: Hit Enter or click the search button
3. **Browse Results**: Scroll through the video grid

### **Advanced Search Tips**
- **Specific Channels**: `channel:channelname your search`
- **Video Duration**: Use filters like "short", "medium", "long"
- **Upload Date**: Search for recent content with date qualifiers
- **Quality**: Include terms like "4K", "HD", "1080p"

### **Search History**
- ClipPAilot remembers your recent searches
- Access history via the search dropdown
- Clear history in Settings

## 👁️ **Previewing Videos**

### **Video Preview**
1. **Click Preview Button**: Click the 👁️ button on any video
2. **Watch Embedded Video**: Video opens in a modal dialog
3. **Fallback Options**: If embedding fails, use "Open in YouTube"

### **Preview Features**
- **Full Screen**: Click fullscreen button in video player
- **Quality Selection**: YouTube automatically adjusts quality
- **Close Options**: Press `Esc` key or click "Close" button

### **Troubleshooting Previews**
**Video won't load?**
- Some videos have embedding restrictions
- Use "Open in YouTube" button as fallback
- Check internet connection

## ⬇️ **Downloading Content**

### **Quick Download**
1. **Choose Format**: Videos show current format (MP4, etc.)
2. **Click Download**: Click the ⬇️ button
3. **Monitor Progress**: Watch the progress indicator
4. **Access File**: Find downloaded file in your chosen directory

### **Download Settings**

Configure downloads in Settings (🔧):

**Video Settings:**
- **Format**: MP4, WebM, MKV
- **Quality**: 360p, 720p, 1080p, 4K
- **Codec**: H.264, H.265, VP9, AV1

**Audio Settings:**
- **Format**: MP3, AAC, FLAC, WAV
- **Bitrate**: 128kbps to 320kbps
- **Sample Rate**: 44.1kHz, 48kHz

**General Settings:**
- **Download Folder**: Choose destination
- **Filename Format**: Customize naming
- **Concurrent Downloads**: Number of simultaneous downloads

### **Download Quality Guide**

| Quality | Resolution | File Size | Best For |
|---------|------------|-----------|----------|
| 360p | 640×360 | Small | Mobile, quick preview |
| 720p | 1280×720 | Medium | General viewing |
| 1080p | 1920×1080 | Large | High quality viewing |
| 4K | 3840×2160 | Very Large | Professional use |

### **Audio-Only Downloads**
1. **Set Audio Format**: Choose MP3, AAC, etc. in settings
2. **Select Quality**: Pick bitrate (higher = better quality)
3. **Download**: Same process as video downloads

## 🌐 **Language & Localization**

### **Supported Languages**
ClipPAilot supports 9 languages:
- 🇺🇸 English
- 🇮🇱 Hebrew (עברית) - with RTL support
- 🇩🇪 German (Deutsch)
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇧🇷 Portuguese Brazilian (Português BR)
- 🇵🇹 Portuguese (Português PT)
- 🇯🇵 Japanese (日本語)
- 🇨🇳 Chinese (中文)

### **Changing Language**
1. **Open Settings**: Click 🔧 settings button
2. **Select Language**: Choose from dropdown
3. **Apply Changes**: Settings save automatically
4. **Restart**: Some changes require app restart

### **RTL Support**
Hebrew interface includes:
- Right-to-left text direction
- Mirrored interface elements
- Proper button spacing for Hebrew text

## 🎛️ **Settings & Preferences**

### **Download Settings**
- **Video Format**: Default format for video downloads
- **Audio Format**: Default format for audio extraction
- **Quality**: Preferred video quality
- **Download Path**: Where files are saved

### **Interface Settings**
- **Language**: Change interface language
- **Theme**: Light/dark mode (follows system)
- **Startup**: Launch options and default view

### **Advanced Settings**
- **Concurrent Downloads**: Number of simultaneous downloads
- **Temporary Files**: Cleanup options
- **Performance**: Memory and CPU usage optimization

## 📊 **Download Management**

### **Active Downloads**
- **Progress Tracking**: Real-time download progress
- **Cancel Downloads**: Stop downloads in progress
- **Queue Management**: Multiple downloads are queued

### **Download History**
- **Recent Downloads**: View completed downloads
- **File Access**: Quick access to downloaded files
- **Status Indicators**: Success, failed, or cancelled

### **File Organization**
Downloads are organized by:
- **Date**: Folders by download date
- **Format**: Separate folders for audio/video
- **Custom**: User-defined organization

## 🔒 **Privacy & Legal**

### **License Awareness**
ClipPAilot respects content licensing:
- **License Detection**: Identifies video licenses
- **Usage Guidelines**: Displays appropriate warnings
- **Terms Compliance**: Follows YouTube Terms of Service

### **Data Privacy**
- **Local Storage**: All data stored locally
- **No Tracking**: No user behavior tracking
- **API Usage**: Only YouTube API for search functionality

### **Legal Usage**
- **Fair Use**: Download only content you have rights to use
- **Personal Use**: Respect copyright and licensing terms
- **Creator Rights**: Support content creators appropriately

## ⌨️ **Keyboard Shortcuts**

| Shortcut | Action |
|----------|--------|
| `Ctrl + F` | Focus search box |
| `Enter` | Search/Download |
| `Esc` | Close modal/dialog |
| `Ctrl + ,` | Open settings |
| `F5` | Refresh results |
| `Ctrl + Q` | Quit application |

## 🛠️ **Troubleshooting**

### **Common Issues**

**Search not working:**
- Check internet connection
- Verify YouTube API key (if required)
- Try different search terms

**Downloads failing:**
- Check available disk space
- Verify download permissions
- Try different format/quality

**Performance issues:**
- Close other applications
- Check system resources
- Restart ClipPAilot

### **Error Messages**

**"Network Error":**
- Check internet connection
- Verify firewall settings
- Try again later

**"Download Failed":**
- Video may be unavailable
- Check download folder permissions
- Try different format

**"API Limit Exceeded":**
- YouTube API quota reached
- Wait for quota reset
- Use trending videos instead

## 📞 **Getting Help**

Need more help?

1. **FAQ**: Check [Frequently Asked Questions](FAQ)
2. **Troubleshooting**: Visit [Troubleshooting Guide](Troubleshooting)
3. **GitHub Issues**: Report bugs or request features
4. **Wiki**: Browse other documentation pages

---

**Next**: [Settings & Configuration →](Settings-Configuration)
