// Background service worker — listens to response headers and stores them per tabId

const tabHeaders = {};

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.type === "main_frame" && details.responseHeaders) {
      const headers = {};
      for (const h of details.responseHeaders) {
        headers[h.name.toLowerCase()] = h.value ?? "";
      }
      tabHeaders[details.tabId] = {
        url: details.url,
        status: details.statusCode,
        headers,
        timestamp: Date.now(),
      };
      // Notify popup if open
      chrome.runtime.sendMessage({
        type: "HEADERS_UPDATED",
        tabId: details.tabId,
      }).catch(() => {});
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders", "extraHeaders"]
);

// Clear cache when tab is removed
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabHeaders[tabId];
});

// Clear cache when tab navigates away
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    delete tabHeaders[tabId];
  }
});

// Respond to popup requests for header data
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_HEADERS") {
    sendResponse(tabHeaders[msg.tabId] ?? null);
  }
  return true;
});
