# Contributing to ClipPilot

Thank you for your interest in contributing to ClipPilot! This document provides guidelines and information for contributors.

## 🎯 Ways to Contribute

### 🐛 Bug Reports
- Use GitHub Issues to report bugs
- Include steps to reproduce
- Provide system information (OS, Node.js version)
- Include relevant logs or screenshots

### 💡 Feature Requests
- Check existing issues first
- Describe the problem you're solving
- Provide clear use cases
- Consider implementation complexity

### 🔧 Code Contributions
- Fork the repository
- Create a feature branch
- Follow our coding standards
- Add tests for new features
- Update documentation

### 📚 Documentation
- Fix typos and improve clarity
- Add examples and tutorials
- Translate to other languages
- Update API documentation

## 🚀 Development Setup

### Prerequisites
```bash
# Required tools
Node.js 18+
Git
Windows 10/11 (for full testing)

# External tools (for testing)
ffmpeg.exe
yt-dlp.exe
```

### Quick Start
```bash
# 1. Fork and clone
git clone https://github.com/your-username/clippilot.git
cd clippilot

# 2. Install dependencies
npm ci

# 3. Setup tools (optional for development)
# Download ffmpeg.exe to tools/ffmpeg/
# Download yt-dlp.exe to tools/yt-dlp/

# 4. Start development
npm run dev
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Add your YouTube API key (optional)
# YOUTUBE_API_KEY=your_key_here
```

## 📝 Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Add type annotations for public APIs
- Prefer interfaces over types for objects
- Use Zod for runtime validation

```typescript
// ✅ Good
interface VideoInfo {
  id: string
  title: string
  duration: number
}

// ✅ Good - with validation
const VideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  duration: z.number()
})
```

### React Components
- Use functional components with hooks
- Keep components focused and small
- Use proper TypeScript props typing
- Follow React best practices

```tsx
// ✅ Good component structure
interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}

export default function SearchBar({ onSearch, placeholder }: SearchBarProps) {
  // Component implementation
}
```

### Styling
- Use Tailwind CSS for styling
- Follow responsive design principles
- Maintain consistent spacing and colors
- Use semantic HTML elements

```tsx
// ✅ Good styling
<button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
  Download
</button>
```

### Electron Best Practices
- Keep main process minimal
- Use secure IPC patterns
- Validate all renderer inputs
- Follow Electron security guidelines

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test SearchBar.test.tsx

# Run tests in watch mode
npm test -- --watch
```

### Test Coverage
- Add tests for new features
- Maintain existing test coverage
- Test both happy path and error cases
- Include integration tests for critical features

### Manual Testing
```bash
# Test development build
npm run dev

# Test production build
npm run dist
# Test the generated installer
```

## 📦 Release Process

### Version Management
```bash
# Bump version (automatically updates package.json and version.ts)
npm run version:patch  # Bug fixes
npm run version:minor  # New features
npm run version:major  # Breaking changes
```

### Pre-release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped appropriately
- [ ] Security audit clean (`npm audit`)
- [ ] Manual testing completed

### Creating a Release
1. **Update version**: `npm run version:minor`
2. **Update CHANGELOG.md** with new features/fixes
3. **Commit changes**: `git commit -am "Release v1.x.x"`
4. **Create tag**: `git tag v1.x.x`
5. **Push changes**: `git push && git push --tags`
6. **Create GitHub release** with built artifacts

## 🌍 Internationalization

### Adding New Languages
1. **Create translation file**: `src/renderer/i18n/locales/[lang]/translation.json`
2. **Add language option** in App.tsx header dropdown
3. **Test RTL support** if applicable
4. **Update documentation**

```json
// Example translation file structure
{
  "search_placeholder": "Search for videos...",
  "download": "Download",
  "settings": "Settings"
}
```

## 🔒 Security Guidelines

### Code Security
- Never commit API keys or secrets
- Validate all user inputs
- Use parameterized commands for external tools
- Follow Electron security best practices

### Dependency Security
- Run `npm audit` before releases
- Keep dependencies updated
- Review new dependencies carefully
- Use exact versions for security-critical packages

## 📋 Pull Request Process

### Before Submitting
1. **Fork** the repository
2. **Create branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** following our guidelines
4. **Test thoroughly** on your local environment
5. **Update documentation** if needed

### PR Requirements
- [ ] Clear description of changes
- [ ] Tests added/updated for new features
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Security considerations addressed
- [ ] Performance impact considered

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Manual testing completed
- [ ] Automated tests added/updated
- [ ] Cross-platform testing (if applicable)

## Screenshots (if UI changes)
[Include screenshots or GIFs]
```

## 🤝 Code Review Process

### For Contributors
- Be open to feedback
- Respond promptly to review comments
- Keep PRs focused and reasonably sized
- Test suggestions before implementing

### For Reviewers
- Be constructive and respectful
- Focus on code quality and security
- Test changes when possible
- Provide clear, actionable feedback

## 🎨 Design Guidelines

### UI/UX Principles
- **Simplicity**: Keep interfaces clean and intuitive
- **Consistency**: Use consistent patterns throughout
- **Accessibility**: Support keyboard navigation and screen readers
- **Performance**: Optimize for smooth user experience

### Visual Design
- Follow existing color scheme and typography
- Use icons consistently (prefer emoji for simplicity)
- Maintain proper spacing and alignment
- Support both light theme (current) and future dark theme

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: For security issues (see SECURITY.md)

### Documentation
- **README.md**: General project information
- **PROJECT_INFO.md**: Technical overview
- **SECURITY.md**: Security policies and reporting
- **API Documentation**: In-code TypeScript definitions

## 🏆 Recognition

### Contributors
All contributors will be:
- Listed in our README.md contributors section
- Credited in release notes for their contributions
- Given appropriate GitHub repository permissions for ongoing contributors

### Types of Contributions Recognized
- Code contributions (features, bug fixes)
- Documentation improvements
- Bug reports and testing
- Design and UX feedback
- Security research and reporting
- Community support and moderation

---

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

### Our Pledge
- **Be welcoming**: Inclusive environment for all
- **Be respectful**: Respectful communication always
- **Be collaborative**: Work together constructively
- **Be patient**: Help others learn and grow

### Unacceptable Behavior
- Harassment or discrimination of any kind
- Trolling, insulting, or derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct inappropriate in a professional setting

### Enforcement
- Report issues to project maintainers
- Violations may result in temporary or permanent bans
- Decisions will be made fairly and transparently

### License Agreement
By contributing to this project, you agree that your contributions will be licensed under the Apache License 2.0.

---

**Thank you for contributing to ClipPilot! Together we can build something amazing. 🚀**
