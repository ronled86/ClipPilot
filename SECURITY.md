# Security Policy

## 🔒 Security Overview

ClipPilot takes security seriously. This document outlines our security practices and how to report security vulnerabilities.

## 🛡️ Security Features

### Application Security
- **Context Isolation**: Enabled for all renderer processes
- **Sandboxing**: Renderer processes run in sandbox mode
- **No Node.js in Renderer**: Eliminates Node.js access from frontend
- **Secure IPC**: All inter-process communication uses validated channels
- **Input Validation**: Zod schemas validate all data exchange
- **Local Processing**: All downloads processed locally, no cloud dependencies

### Data Protection
- **No Data Collection**: ClipPilot doesn't collect or transmit user data
- **Local Storage Only**: Search history stored locally using browser localStorage
- **No Analytics**: No tracking or analytics services integrated
- **Offline Capable**: Core functionality works without internet (except search)

### External Tool Security
- **Static Binaries**: Uses vetted, static builds of ffmpeg and yt-dlp
- **Sandboxed Execution**: External tools run with limited permissions
- **Input Sanitization**: All parameters passed to external tools are sanitized
- **Process Isolation**: External processes run separately from main application

## 🔍 Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | ✅ Yes             |
| < 1.0   | ❌ No              |

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

### How to Report
1. **Email**: Send details to [security@clippilot.com] (replace with actual email)
2. **GitHub**: Create a private security advisory on GitHub
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect
- **Acknowledgment**: Within 24-48 hours
- **Initial Assessment**: Within 7 days
- **Progress Updates**: Weekly until resolved
- **Resolution**: Critical issues within 30 days, others within 90 days

### Responsible Disclosure
- Please don't publicly disclose the vulnerability until we've had a chance to fix it
- We'll credit you in our security advisory if you'd like
- We may offer a token of appreciation for significant security findings

## 🛠️ Security Best Practices for Users

### Installation Security
1. **Download from Official Sources**: Only download ClipPilot from official GitHub releases
2. **Verify Checksums**: Verify file integrity using provided checksums
3. **Antivirus Scanning**: Scan downloads with your antivirus software
4. **Windows SmartScreen**: Allow Windows SmartScreen warnings for known-good releases

### Usage Security
1. **API Keys**: Keep your YouTube API key secure and private
2. **Download Sources**: Only download content you have permission to access
3. **File Locations**: Be cautious about download folder permissions
4. **External Tools**: Keep ffmpeg and yt-dlp updated to latest versions

### Environment Security
```bash
# ✅ Good - API key in environment file (not committed)
YOUTUBE_API_KEY=your_secret_key_here

# ❌ Bad - API key in source code
const apiKey = "AIzaSy..." // Never do this!
```

## 🔐 Security Configuration

### Electron Security Settings
```typescript
// Main process security configuration
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,        // ✅ Disabled
    contextIsolation: true,        // ✅ Enabled  
    sandbox: true,                 // ✅ Enabled
    webSecurity: true,             // ✅ Enabled
    allowRunningInsecureContent: false, // ✅ Disabled
    experimentalFeatures: false    // ✅ Disabled
  }
})
```

### IPC Security
- All IPC channels use Zod validation
- No direct Node.js access from renderer
- Whitelist-based API exposure
- Input sanitization on all channels

## 🎯 Security Auditing

### Regular Security Practices
- **Dependency Auditing**: `npm audit` run before each release
- **Static Analysis**: TypeScript strict mode catches many issues
- **Code Review**: All changes reviewed for security implications
- **External Tool Updates**: Regular updates to ffmpeg and yt-dlp

### Self-Audit Checklist
- [ ] No hardcoded secrets in source code
- [ ] All dependencies up to date
- [ ] Electron security features enabled
- [ ] Input validation on all user inputs
- [ ] External tool execution is sandboxed
- [ ] No sensitive data in logs
- [ ] File permissions are restrictive

## 📋 Security FAQ

**Q: Is my YouTube API key secure?**  
A: Yes, if stored in `.env` file (which is not committed to git). Never put API keys in source code.

**Q: Can ClipPilot access my personal files?**  
A: Only files in the download folder you specify. The app runs in a sandbox with limited file system access.

**Q: Does ClipPilot send data to external servers?**  
A: Only to YouTube's API for search functionality. No personal data is transmitted.

**Q: Are downloaded files safe?**  
A: Files are processed locally using ffmpeg. However, scan downloads with antivirus as with any internet content.

**Q: Can I audit the code myself?**  
A: Yes! ClipPilot is open source. Review the code, especially `src/main/index.ts` for security-critical functions.

## 🆘 Emergency Response

If you believe you've found a critical security vulnerability:

1. **Stop using the affected feature immediately**
2. **Report the issue using the channels above**
3. **Update to the latest version when patch is available**
4. **Check our GitHub releases for security updates**

---

**Remember**: Security is a shared responsibility. Keep your system updated, use strong API keys, and report any concerns promptly.
