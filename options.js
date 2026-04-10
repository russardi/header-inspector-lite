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

const DEFAULT_SETTINGS = {
  enabledHeaders: SECURITY_HEADERS.map((h) => h.name),
};

let settings = { ...DEFAULT_SETTINGS };

const groupsContainer = document.getElementById("header-groups");
const saveStatus = document.getElementById("save-status");

// ── Build UI ──────────────────────────────────────────────
async function init() {
  const stored = await chrome.storage.sync.get("settings");
  if (stored.settings) settings = { ...DEFAULT_SETTINGS, ...stored.settings };
  renderGroups();
}

function renderGroups() {
  groupsContainer.innerHTML = "";

  const categories = {};
  for (const h of SECURITY_HEADERS) {
    if (!categories[h.category]) categories[h.category] = [];
    categories[h.category].push(h);
  }

  for (const [cat, headers] of Object.entries(categories)) {
    const group = document.createElement("div");
    group.className = "category-group";

    const catTitle = document.createElement("div");
    catTitle.className = "category-title";
    catTitle.textContent = cat;
    group.appendChild(catTitle);

    for (const h of headers) {
      const isEnabled = settings.enabledHeaders.includes(h.name);

      const row = document.createElement("div");
      row.className = "header-option";

      const checkWrap = document.createElement("div");
      checkWrap.className = "checkbox-wrap";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `chk-${h.name}`;
      checkbox.checked = isEnabled;
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          if (!settings.enabledHeaders.includes(h.name))
            settings.enabledHeaders.push(h.name);
        } else {
          settings.enabledHeaders = settings.enabledHeaders.filter(
            (n) => n !== h.name
          );
        }
      });

      const checkCustom = document.createElement("div");
      checkCustom.className = "checkbox-custom";

      checkWrap.appendChild(checkbox);
      checkWrap.appendChild(checkCustom);

      const label = document.createElement("label");
      label.htmlFor = `chk-${h.name}`;
      label.innerHTML = `
        <span class="opt-name">${h.label}${h.required ? '<span class="opt-required">Key</span>' : ""}</span>
        <span class="opt-desc">${h.desc}</span>
      `;

      row.appendChild(checkWrap);
      row.appendChild(label);
      group.appendChild(row);
    }

    groupsContainer.appendChild(group);
  }
}

// ── Bulk actions ──────────────────────────────────────────
document.getElementById("btn-all").addEventListener("click", () => {
  settings.enabledHeaders = SECURITY_HEADERS.map((h) => h.name);
  renderGroups();
});

document.getElementById("btn-none").addEventListener("click", () => {
  settings.enabledHeaders = [];
  renderGroups();
});

// ── Save / Reset ──────────────────────────────────────────
document.getElementById("btn-save").addEventListener("click", async () => {
  await chrome.storage.sync.set({ settings });
  saveStatus.textContent = "✓ Settings saved";
  setTimeout(() => (saveStatus.textContent = ""), 2500);
});

document.getElementById("btn-reset").addEventListener("click", async () => {
  settings = { ...DEFAULT_SETTINGS };
  await chrome.storage.sync.set({ settings });
  renderGroups();
  saveStatus.textContent = "✓ Reset to defaults";
  setTimeout(() => (saveStatus.textContent = ""), 2500);
});

init();
