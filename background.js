// Background service worker — captures response headers and persists them
// via chrome.storage.session so data survives service worker restarts.

async function getTabHeaders() {
  const data = await chrome.storage.session.get("tabHeaders");
  return data.tabHeaders ?? {};
}

async function setTabHeader(tabId, value) {
  const all = await getTabHeaders();
  all[tabId] = value;
  await chrome.storage.session.set({ tabHeaders: all });
}

async function removeTabHeader(tabId) {
  const all = await getTabHeaders();
  delete all[tabId];
  await chrome.storage.session.set({ tabHeaders: all });
}

// Capture response headers for every main frame navigation
chrome.webRequest.onHeadersReceived.addListener(
  async (details) => {
    if (details.type === "main_frame" && details.responseHeaders) {
      const headers = {};
      for (const h of details.responseHeaders) {
        headers[h.name.toLowerCase()] = h.value ?? "";
      }
      await setTabHeader(details.tabId, {
        url: details.url,
        status: details.statusCode,
        headers,
        timestamp: Date.now(),
      });
      // Notify popup if open so it silently refreshes
      chrome.runtime.sendMessage({
        type: "HEADERS_UPDATED",
        tabId: details.tabId,
      }).catch(() => {});
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders", "extraHeaders"]
);

// Only remove headers when the tab is fully closed — NOT on navigation start.
// This keeps the last known headers visible in the popup until new ones arrive.
chrome.tabs.onRemoved.addListener(async (tabId) => {
  await removeTabHeader(tabId);
});

// Respond to any legacy GET_HEADERS messages (kept for compatibility)
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_HEADERS") {
    getTabHeaders().then((all) => sendResponse(all[msg.tabId] ?? null));
    return true;
  }
});
