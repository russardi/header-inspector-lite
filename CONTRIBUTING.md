# Contributing to Header Inspector Lite

Thank you for your interest in contributing! This is a small, focused Chrome extension — contributions that improve accuracy, usability, or code quality are very welcome.

## Getting Started

1. Fork this repository and clone your fork
2. Load the extension in Developer Mode (see README for instructions)
3. Make your changes
4. Test manually by reloading the unpacked extension at `chrome://extensions/`
5. Submit a pull request

## Development Setup

No build tools required — this is plain HTML/CSS/JS.

```bash
git clone https://github.com/yourusername/header-inspector-lite.git
cd header-inspector-lite
# Load unpacked in Chrome Developer Mode
```

## Guidelines

### Code Style
- Plain ES2022+ JavaScript, no frameworks or bundlers
- Keep popup and options pages self-contained (no external CDN dependencies)
- Follow existing naming conventions (camelCase for JS, kebab-case for CSS classes)

### Adding New Headers
Edit the `SECURITY_HEADERS` array in **both** `popup.js` and `options.js`:

```js
{
  name: "header-name-lowercase",     // exact lowercase HTTP header name
  label: "Header-Name",              // display label (canonical capitalisation)
  category: "Category Name",         // grouping category
  required: true,                    // true = counts toward security score
  desc: "One-line description",      // shown in the UI
}
```

### Pull Request Checklist
- [ ] Manual testing: open popup on at least 3 different sites
- [ ] Settings page saves and loads correctly after browser restart
- [ ] No console errors in the service worker or popup
- [ ] `README.md` updated if new headers or features were added
- [ ] `CHANGELOG.md` entry added under `[Unreleased]`

## Reporting Bugs

Open an issue with:
- Chrome version and OS
- URL of the page that triggered the issue (if not sensitive)
- Screenshot or console output if available

## Feature Requests

Open an issue with the label `enhancement`. Please explain the use case — what problem it solves and for whom.
