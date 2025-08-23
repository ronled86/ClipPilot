# ❓ Frequently Asked Questions

Common questions and answers about ClipPilot.

## 🔧 **Installation & Setup**

### **Q: What are the system requirements for ClipPilot?**
**A:** ClipPilot requires:
- Windows 10 (1809+) or Windows 11
- 64-bit (x64) architecture
- 4 GB RAM minimum (8 GB recommended)
- 500 MB free disk space
- Internet connection for YouTube integration

### **Q: Why does Windows show a security warning when installing?**
**A:** This is normal for new software. ClipPilot is safe to install. Click "More info" → "Run anyway" to proceed. The warning appears because the installer isn't signed with an expensive code signing certificate.

### **Q: Do I need a YouTube API key to use ClipPilot?**
**A:** No, ClipPilot works without an API key for basic functionality. An API key enhances the search experience and provides access to trending videos.

### **Q: How do I update ClipPilot?**
**A:** ClipPilot includes an auto-updater that checks for updates on startup. You can also manually download and install the latest version from the GitHub releases page.

## 🔍 **Search & Discovery**

### **Q: Why don't I see any search results?**
**A:** This could be due to:
- Network connectivity issues
- YouTube API quota limits
- Invalid search terms
- Regional content restrictions

Try searching for popular terms or check your internet connection.

### **Q: Can I search for specific channels or playlists?**
**A:** Currently, ClipPilot focuses on individual video search. Channel and playlist support is planned for future releases.

### **Q: How does the trending videos feature work?**
**A:** Trending videos are fetched from YouTube's public API and show popular content in various categories. This feature requires a YouTube API key for full functionality.

## 👁️ **Video Preview**

### **Q: Why does the preview show "Sign in to confirm you're not a bot"?**
**A:** Some YouTube videos have embedding restrictions or trigger bot detection. Use the "Open in YouTube" button as a fallback to watch the video in your browser.

### **Q: Can I preview videos in different qualities?**
**A:** The preview uses YouTube's embed player, which automatically adjusts quality based on your connection and device capabilities.

### **Q: Why don't some videos show previews?**
**A:** Video previews depend on:
- Content creator settings (embedding permissions)
- YouTube's regional restrictions
- Content licensing restrictions
- Video availability

## ⬇️ **Downloads**

### **Q: What video formats does ClipPilot support?**
**A:** ClipPilot supports multiple formats:
- **Video**: MP4, WebM, MKV
- **Audio**: MP3, AAC, FLAC, WAV
- **Quality**: 360p to 4K (depending on source)

### **Q: Why do some downloads fail?**
**A:** Download failures can occur due to:
- Video unavailability or removal
- Network connectivity issues
- Insufficient disk space
- Geographic restrictions
- Copyright protection

### **Q: Where are downloaded files saved?**
**A:** By default, files are saved to your Downloads folder. You can change this location in Settings → Download Path.

### **Q: Can I download entire playlists?**
**A:** Individual video downloads are currently supported. Playlist downloading is a planned feature for future releases.

### **Q: How do I download audio-only files?**
**A:** In Settings, choose an audio format (MP3, AAC, etc.) as your default. Then use the download button on any video to extract just the audio.

## 🌐 **Language & Interface**

### **Q: Which languages does ClipPilot support?**
**A:** ClipPilot supports 9 languages:
- English, Hebrew, German, Spanish, French
- Portuguese (Brazil & Portugal), Japanese, Chinese

### **Q: How do I change the interface language?**
**A:** Go to Settings (🔧) → Language → Select your preferred language. Some changes may require restarting the application.

### **Q: Does ClipPilot support right-to-left (RTL) languages?**
**A:** Yes! ClipPilot has full RTL support for Hebrew, including proper text direction and interface mirroring.

## 🔒 **Privacy & Legal**

### **Q: Is ClipPilot safe to use?**
**A:** Yes, ClipPilot is completely safe:
- Open source code available on GitHub
- No data collection or tracking
- All processing done locally
- No advertisements or malware

### **Q: Does ClipPilot respect copyright laws?**
**A:** ClipPilot includes license-aware features and respects YouTube's Terms of Service. Users are responsible for ensuring their downloads comply with applicable copyright laws and fair use guidelines.

### **Q: What data does ClipPilot collect?**
**A:** ClipPilot prioritizes privacy:
- No user data collection
- No tracking or analytics
- Settings stored locally only
- API calls made directly to YouTube

### **Q: Can I use ClipPilot for commercial purposes?**
**A:** ClipPilot is licensed under Apache 2.0, allowing commercial use. However, ensure any downloaded content complies with its respective licensing and copyright terms.

## ⚙️ **Settings & Configuration**

### **Q: How do I change the default download quality?**
**A:** Go to Settings → Video Format → Select your preferred quality (360p, 720p, 1080p, 4K).

### **Q: Can I change where files are downloaded?**
**A:** Yes, in Settings → Download Path, click "Browse" to select a new folder.

### **Q: How do I reset ClipPilot to default settings?**
**A:** Delete the settings file located at:
`%APPDATA%\clippilot-desktop\settings.json`

Then restart ClipPilot.

### **Q: Can I run multiple downloads simultaneously?**
**A:** Yes, ClipPilot supports concurrent downloads. You can adjust the number of simultaneous downloads in Settings.

## 🛠️ **Troubleshooting**

### **Q: ClipPilot won't start after installation**
**A:** Try these solutions:
1. Run as Administrator
2. Check Windows compatibility mode
3. Install Visual C++ Redistributable
4. Check antivirus software blocking

### **Q: The interface appears corrupted or garbled**
**A:** This may be due to:
- Graphics driver issues
- DPI scaling problems
- Corrupted installation

Try updating graphics drivers or reinstalling ClipPilot.

### **Q: Downloads are very slow**
**A:** Speed depends on:
- Your internet connection
- YouTube server load
- Selected video quality
- System resources

Try downloading during off-peak hours or choosing lower quality.

### **Q: "Network Error" messages**
**A:** Check:
- Internet connectivity
- Firewall settings
- Antivirus blocking network access
- VPN or proxy configuration

## 🔄 **Updates & Versions**

### **Q: How often is ClipPilot updated?**
**A:** ClipPilot receives regular updates with bug fixes, new features, and improvements. Major updates are released quarterly, with patch updates as needed.

### **Q: Will my settings be preserved during updates?**
**A:** Yes, your settings, download history, and preferences are preserved during updates.

### **Q: How do I check which version I'm running?**
**A:** Click the About button (ℹ️) in the top toolbar to see version information.

## 🆘 **Getting More Help**

### **Q: Where can I report bugs or request features?**
**A:** Visit our GitHub repository:
- **Bug Reports**: [Create an Issue](https://github.com/ronled86/ClipPilot/issues/new?template=bug_report.md)
- **Feature Requests**: [Request Feature](https://github.com/ronled86/ClipPilot/issues/new?template=feature_request.md)
- **Discussions**: [GitHub Discussions](https://github.com/ronled86/ClipPilot/discussions)

### **Q: How can I contribute to ClipPilot?**
**A:** We welcome contributions! See our [Contributing Guidelines](Contributing-Guidelines) for:
- Code contributions
- Documentation improvements
- Translation help
- Bug testing

### **Q: Is there a user community or forum?**
**A:** Join our community:
- **GitHub Discussions**: Ask questions and share tips
- **Issues**: Report problems and track fixes
- **Wiki**: Browse and improve documentation

---

**Still have questions?** Create a [GitHub Discussion](https://github.com/ronled86/ClipPilot/discussions) or check our [User Guide](User-Guide) for detailed instructions.
