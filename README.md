# 🔍 Header Inspector Lite

A lightweight Chrome extension that captures and displays **HTTP response headers** and **security headers** for any web page you visit — with configurable settings and a clean, developer-focused UI.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **Security Tab** — instantly see which key security headers are present or missing, grouped by category (Transport, Content, Privacy, Isolation)
- **Security Score** — percentage score based on required headers that are present
- **All Headers Tab** — browse every response header with live search/filter
- **Configurable** — settings page lets you choose exactly which headers appear via checkboxes, grouped by category
- **Copy to clipboard** — click the copy icon on any header value
- **Status indicator** — shows HTTP status code (200/301/404…) for the current page
- **Dark theme** — readable, minimal developer UI
- **Manifest V3** — uses the modern `webRequest` listener (read-only, non-blocking) for compatibility and performance

---

## 📦 Installation (Developer Mode)

1. **Clone or download** this repository
   ```bash
   git clone https://github.com/yourusername/header-inspector-lite.git
   ```

2. Open Chrome and go to `chrome://extensions/`

3. Enable **Developer mode** (toggle in the top-right corner)

4. Click **"Load unpacked"** and select the project folder

5. The extension icon appears in your toolbar — **reload any page** to start seeing headers

---

## 🖥️ Usage

### Popup

Click the extension icon on any page to open the popup.

| Tab | Description |
|-----|-------------|
| **Security** | Shows all configured security headers with present/missing indicators and a score bar |
| **All Headers** | Lists every response header alphabetically with a live search filter |

Click the **refresh** button (↻) to reload the page and recapture headers.  
Click the **⚙ settings** icon to open the Settings page.

### Settings

The Settings page (`options.html`) lets you:
- **Check/uncheck** individual headers to show or hide them in the Security tab
- Use **Select All / Deselect All** for quick bulk actions
- Click **Save settings** to persist your choices (synced via `chrome.storage.sync`)
- Click **Reset to defaults** to restore all headers

---

## 🛡️ Tracked Security Headers

| Header | Category | Key |
|--------|----------|-----|
| `Strict-Transport-Security` | Transport Security | ✅ |
| `Content-Security-Policy` | Content Security | ✅ |
| `X-Content-Type-Options` | Content Security | ✅ |
| `X-Frame-Options` | Content Security | ✅ |
| `Referrer-Policy` | Privacy | ✅ |
| `Permissions-Policy` | Privacy | |
| `Cross-Origin-Opener-Policy` | Isolation | |
| `Cross-Origin-Resource-Policy` | Isolation | |
| `Cross-Origin-Embedder-Policy` | Isolation | |
| `X-XSS-Protection` | Legacy | |
| `Cache-Control` | Caching | |
| `Server` | Info Disclosure | |
| `X-Powered-By` | Info Disclosure | |

> **Key** headers are the most critical ones and factor into the Security Score.

---

## 🗂️ Project Structure

```
header-inspector-lite/
├── manifest.json          # Extension manifest (MV3)
├── background.js          # Service worker — captures response headers
├── popup.html             # Popup UI entry point
├── popup.css              # Popup styles
├── popup.js               # Popup logic
├── options.html           # Settings page
├── options.css            # Settings styles
├── options.js             # Settings logic
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md
├── CHANGELOG.md
├── CONTRIBUTING.md
└── LICENSE
```

---

## 🔑 Permissions

| Permission | Reason |
|-----------|--------|
| `webRequest` | Read (non-blocking) response headers |
| `storage` | Persist user settings via `chrome.storage.sync` |
| `tabs` | Get the active tab ID to look up its headers |
| `activeTab` | Access the current tab URL |
| `host_permissions: <all_urls>` | Required by `webRequest` to observe all page navigations |

> **No data is sent anywhere.** All header data stays in memory within the extension's service worker and is never stored to disk or transmitted.

---

## 🔒 Privacy

- Header data is held **in-memory only** and cleared when a tab is closed or navigated
- No telemetry, no analytics, no external network requests
- Settings are stored locally via `chrome.storage.sync`

---

## 🏗️ Technical Notes

- Uses `chrome.webRequest.onHeadersReceived` with the `"responseHeaders"` and `"extraHeaders"` flags to read (not modify) response headers — compatible with Manifest V3
- The service worker stores the latest headers per `tabId` and responds to popup queries via `chrome.runtime.sendMessage`
- The blocking `webRequestBlocking` permission is **not** used — the extension only reads, never modifies, headers

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md).

---

## 📄 License

[MIT](LICENSE) © 2026
