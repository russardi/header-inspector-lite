const SECURITY_HEADERS = [
  { name: "strict-transport-security", label: "Strict-Transport-Security", category: "Transport Security", required: true, desc: "Forces HTTPS connections (HSTS)" },
  { name: "content-security-policy", label: "Content-Security-Policy", category: "Content Security", required: true, desc: "Restricts sources of scripts, styles, etc." },
  { name: "x-content-type-options", label: "X-Content-Type-Options", category: "Content Security", required: true, desc: "Prevents MIME-type sniffing" },
  { name: "x-frame-options", label: "X-Frame-Options", category: "Content Security", required: true, desc: "Prevents clickjacking via iframes" },
  { name: "referrer-policy", label: "Referrer-Policy", category: "Privacy", required: true, desc: "Controls referrer information sent to other sites" },
  { name: "permissions-policy", label: "Permissions-Policy", category: "Privacy", required: false, desc: "Restricts browser features (camera, mic, geo…)" },
  { name: "cross-origin-opener-policy", label: "Cross-Origin-Opener-Policy", category: "Isolation", required: false, desc: "Isolates browsing context from cross-origin docs" },
  { name: "cross-origin-resource-policy", label: "Cross-Origin-Resource-Policy", category: "Isolation", required: false, desc: "Prevents cross-origin no-cors loading of resources" },
  { name: "cross-origin-embedder-policy", label: "Cross-Origin-Embedder-Policy", category: "Isolation", required: false, desc: "Requires CORP for embedded resources" },
  { name: "x-xss-protection", label: "X-XSS-Protection", category: "Legacy", required: false, desc: "Legacy XSS protection (deprecated, prefer CSP)" },
  { name: "cache-control", label: "Cache-Control", category: "Caching", required: false, desc: "Controls HTTP caching behaviour" },
  { name: "server", label: "Server", category: "Info Disclosure", required: false, desc: "Server software version — ideally not exposed" },
  { name: "x-powered-by", label: "X-Powered-By", category: "Info Disclosure", required: false, desc: "Tech stack info — should be removed" },
];

const DEFAULT_SETTINGS = { enabledHeaders: SECURITY_HEADERS.map((h) => h.name) };

let settings = { ...DEFAULT_SETTINGS };
let currentData = null;
let activeTab = "security";

// ── DOM refs ──────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const securityList = $("security-list");
const allList      = $("all-list");
const urlText      = $("url-text");
const statusBadge  = $("status-badge");
const mainContent  = $("main-content");
const searchInput  = $("search-input");

// ── Init ──────────────────────────────────────────────────
async function init() {
  const stored = await chrome.storage.sync.get("settings");
  if (stored.settings) settings = { ...DEFAULT_SETTINGS, ...stored.settings };

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  const sessionData = await chrome.storage.session.get("tabHeaders");
  const all = sessionData.tabHeaders ?? {};
  const data = all[tab.id] ?? null;

  if (data) {
    currentData = data;
    renderAll(data);
  }
}

// ── Rendering ─────────────────────────────────────────────
function renderAll(data) {
  renderUrlBar(data);
  renderScoreBar(data);
  renderSecurityTab(data);
  renderAllTab(data);
}

function renderUrlBar(data) {
  const url = new URL(data.url);
  urlText.textContent = url.hostname + url.pathname;
  urlText.title = data.url;

  statusBadge.textContent = data.status;
  statusBadge.className = "status-badge";
  if (data.status >= 200 && data.status < 300) statusBadge.classList.add("ok");
  else if (data.status >= 300 && data.status < 400) statusBadge.classList.add("redir");
  else statusBadge.classList.add("error");
}

function renderScoreBar(data) {
  const existing = document.querySelector(".score-bar");
  if (existing) existing.remove();

  const enabledSecHeaders = SECURITY_HEADERS.filter(
    (h) => h.required && settings.enabledHeaders.includes(h.name)
  );
  const present = enabledSecHeaders.filter((h) => data.headers[h.name] !== undefined);
  const score = enabledSecHeaders.length
    ? Math.round((present.length / enabledSecHeaders.length) * 100)
    : 0;

  const bar = document.createElement("div");
  bar.className = "score-bar";
  const grade = score >= 80 ? "high" : score >= 50 ? "medium" : "low";
  bar.innerHTML = `
    <span class="score-label">Security Score</span>
    <div class="score-track">
      <div class="score-fill ${grade}" style="width:${score}%"></div>
    </div>
    <span class="score-value ${grade}">${score}%</span>
  `;
  $("url-bar").insertAdjacentElement("afterend", bar);
}

function renderSecurityTab(data) {
  securityList.innerHTML = "";

  const filtered = SECURITY_HEADERS.filter((h) =>
    settings.enabledHeaders.includes(h.name)
  );

  const categories = {};
  for (const h of filtered) {
    if (!categories[h.category]) categories[h.category] = [];
    categories[h.category].push(h);
  }

  for (const [cat, headers] of Object.entries(categories)) {
    const section = document.createElement("div");
    section.className = "security-section";

    const label = document.createElement("div");
    label.className = "section-label";
    label.textContent = cat;
    section.appendChild(label);

    for (const h of headers) {
      const value = data.headers[h.name];
      const isPresent = value !== undefined;
      const isInfoDisclosure = h.category === "Info Disclosure";
      const indicatorClass = isInfoDisclosure
        ? (isPresent ? "warning" : "present")
        : (isPresent ? "present" : "missing");

      const row = document.createElement("div");
      row.className = "security-row";
      row.innerHTML = `
        <div class="sec-indicator ${indicatorClass}" title="${indicatorClass}"></div>
        <div class="sec-info">
          <div class="sec-name">${h.label}</div>
          <div class="sec-value ${isPresent ? "" : "missing"}">
            ${isPresent ? escHtml(value) : "— not set"}
          </div>
          <div class="sec-desc">${h.desc}</div>
        </div>
        ${isPresent ? `<button class="copy-btn" data-copy="${escAttr(value)}" title="Copy value" aria-label="Copy value">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>` : ""}
      `;
      section.appendChild(row);
    }
    securityList.appendChild(section);
  }
}

function renderAllTab(data, filter = "") {
  allList.innerHTML = "";

  const entries = Object.entries(data.headers).filter(([name]) =>
    !filter || name.includes(filter.toLowerCase())
  );

  if (!entries.length) {
    allList.innerHTML = `<div style="padding:16px 12px;color:var(--text-muted);font-size:12px;">No headers match the filter.</div>`;
    return;
  }

  for (const [name, value] of entries.sort(([a], [b]) => a.localeCompare(b))) {
    const row = document.createElement("div");
    row.className = "header-row";
    row.innerHTML = `
      <div class="header-name">${escHtml(name)}</div>
      <div class="header-value">${escHtml(value)}</div>
      <button class="copy-btn" data-copy="${escAttr(value)}" title="Copy value" aria-label="Copy value">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
        </svg>
      </button>
    `;
    allList.appendChild(row);
  }
}

// ── Event listeners ───────────────────────────────────────
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll(".tab-btn").forEach((b) => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-selected", b === btn ? "true" : "false");
    });
    document.querySelectorAll(".tab-panel").forEach((p) => {
      const isActive = p.id === `tab-${activeTab}`;
      p.classList.toggle("active", isActive);
      p.hidden = !isActive;
    });
  });
});

$("btn-refresh").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) chrome.tabs.reload(tab.id);
  setTimeout(init, 2000);
});

searchInput.addEventListener("input", () => {
  if (currentData) renderAllTab(currentData, searchInput.value.trim());
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".copy-btn");
  if (!btn) return;
  navigator.clipboard.writeText(btn.dataset.copy).then(() => {
    btn.classList.add("copied");
    setTimeout(() => btn.classList.remove("copied"), 1500);
  });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "HEADERS_UPDATED") init();
});

// ── Utils ─────────────────────────────────────────────────
function escHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

init();
