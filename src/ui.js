/**
 * API Vault Web Studio - Dense Tech Archetype UI
 * Modern, High-Performance Local API Client replacing Hoppscotch / Postman
 */

function getDashboardHTML() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Vault - Local Developer Studio</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
  <style>
    :root {
      --bg: #090d13;
      --panel: #0d1117;
      --card: #161b22;
      --card-hover: #1f242c;
      --border: #30363d;
      --border-focus: #58a6ff;
      --text: #c9d1d9;
      --text-white: #ffffff;
      --text-muted: #8b949e;
      --accent: #38bdf8;
      --primary: #238636;
      --primary-hover: #2ea043;
      --success: #3fb950;
      --warn: #d29922;
      --error: #f85149;
      --purple: #bc8cff;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
    
    /* Top Navbar */
    #navbar { height: 48px; background: var(--panel); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0; }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 15px; color: var(--text-white); }
    .brand-tag { font-size: 10px; padding: 2px 6px; background: rgba(56, 189, 248, 0.15); color: var(--accent); border-radius: 4px; font-weight: 600; text-transform: uppercase; }
    .nav-actions { display: flex; align-items: center; gap: 12px; }
    .btn-new { background: var(--card); border: 1px solid var(--border); color: var(--text-white); padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; }
    .btn-new:hover { background: var(--card-hover); border-color: var(--text-muted); }
    .status-pill { font-size: 12px; color: var(--success); display: flex; align-items: center; gap: 6px; background: rgba(63, 185, 80, 0.1); padding: 4px 10px; border-radius: 20px; border: 1px solid rgba(63, 185, 80, 0.2); }
    .pulse-dot { width: 7px; height: 7px; background: var(--success); border-radius: 50%; box-shadow: 0 0 8px var(--success); }

    /* App Layout */
    #workspace { flex: 1; display: flex; overflow: hidden; }

    /* Sidebar */
    #sidebar { width: 340px; background: var(--panel); border-right: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0; }
    .sidebar-header { padding: 12px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; }
    .search-input { width: 100%; background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 7px 10px; color: var(--text); font-size: 12px; outline: none; }
    .search-input:focus { border-color: var(--border-focus); }
    .filter-bar { display: flex; justify-content: space-between; align-items: center; gap: 6px; }
    .filter-bar select { background: var(--card); border: 1px solid var(--border); border-radius: 4px; color: var(--text); padding: 4px 8px; font-size: 11px; outline: none; }
    .item-counter { font-size: 11px; color: var(--text-muted); }

    .history-list { flex: 1; overflow-y: auto; }
    .history-item { padding: 9px 12px; border-bottom: 1px solid rgba(48, 54, 61, 0.4); cursor: pointer; transition: background 0.12s; border-left: 2px solid transparent; }
    .history-item:hover { background: var(--card); }
    .history-item.active { background: var(--card); border-left-color: var(--accent); }
    .h-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; }
    .method-badge { font-family: var(--font-mono); font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 3px; text-transform: uppercase; }
    .method-get { color: #38bdf8; background: rgba(56, 189, 248, 0.15); }
    .method-post { color: #3fb950; background: rgba(63, 185, 80, 0.15); }
    .method-put { color: #d29922; background: rgba(210, 153, 34, 0.15); }
    .method-delete { color: #f85149; background: rgba(248, 81, 73, 0.15); }
    .method-patch { color: #bc8cff; background: rgba(188, 140, 255, 0.15); }
    .h-code { font-size: 11px; font-weight: 600; font-family: var(--font-mono); }
    .code-2xx { color: var(--success); }
    .code-3xx { color: var(--accent); }
    .code-4xx { color: var(--warn); }
    .code-5xx { color: var(--error); }
    .h-title { font-size: 12px; font-weight: 600; color: #f0f6fc; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .h-url { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .h-time { font-size: 10px; color: var(--text-muted); }

    /* Grouping & Accordion */
    .history-group { margin-bottom: 2px; }
    .group-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 7px 10px; background: rgba(22, 27, 34, 0.85);
      border-top: 1px solid rgba(48, 54, 61, 0.4);
      border-bottom: 1px solid rgba(48, 54, 61, 0.4);
      cursor: pointer; user-select: none;
      font-size: 11px; font-weight: 600; color: #c9d1d9;
      position: sticky; top: 0; z-index: 2;
      transition: background 0.12s, color 0.12s;
    }
    .group-header:hover { background: #21262d; color: #fff; }
    .group-left { display: flex; align-items: center; gap: 6px; overflow: hidden; min-width: 0; }
    .group-arrow {
      font-size: 9px; color: var(--text-muted);
      transition: transform 0.15s ease; display: inline-block; width: 12px; text-align: center;
    }
    .history-group.collapsed .group-arrow { transform: rotate(-90deg); }
    .group-icon { font-size: 11px; flex-shrink: 0; }
    .group-name {
      font-family: var(--font-mono); font-size: 11px;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .group-badge {
      font-size: 10px; padding: 1px 6px;
      background: rgba(56, 189, 248, 0.12); color: var(--accent);
      border-radius: 10px; font-weight: 600; font-family: var(--font-mono);
      border: 1px solid rgba(56, 189, 248, 0.2); flex-shrink: 0;
    }
    .history-group.collapsed .group-items { display: none; }
    .group-items { display: block; }
    .group-items .history-item { padding-left: 18px; }

    /* Main Content */
    #main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg); }

    /* Request Bar */
    #request-bar { padding: 14px 20px; background: var(--panel); border-bottom: 1px solid var(--border); display: flex; gap: 8px; align-items: center; }
    .method-select { background: var(--card); border: 1px solid var(--border); color: #fff; font-family: var(--font-mono); font-weight: 700; font-size: 13px; padding: 10px 14px; border-radius: 6px; outline: none; cursor: pointer; }
    .url-input-container { flex: 1; position: relative; }
    .url-input { width: 100%; background: var(--card); border: 1px solid var(--border); border-radius: 6px; padding: 10px 14px; color: #fff; font-family: var(--font-mono); font-size: 13px; outline: none; transition: border-color 0.15s; }
    .url-input:focus { border-color: var(--border-focus); box-shadow: 0 0 0 2px rgba(88, 166, 255, 0.2); }
    .btn-send { background: var(--primary); border: 1px solid rgba(240, 246, 252, 0.1); color: #fff; font-weight: 600; font-size: 13px; padding: 10px 22px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.15s; flex-shrink: 0; }
    .btn-send:hover { background: var(--primary-hover); }
    .btn-send:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Tab Panels Split */
    #panes-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

    /* Request Config Tabs */
    #request-config { height: 42%; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; background: var(--panel); }
    .tab-nav { display: flex; border-bottom: 1px solid var(--border); background: #0b0f14; padding: 0 16px; flex-shrink: 0; }
    .tab-btn { background: transparent; border: none; border-bottom: 2px solid transparent; color: var(--text-muted); padding: 9px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .tab-btn:hover { color: var(--text); }
    .tab-btn.active { color: var(--text-white); border-bottom-color: var(--accent); }
    .tab-content { flex: 1; overflow-y: auto; padding: 14px 20px; display: none; }
    .tab-content.active { display: block; }

    /* Key Value Table */
    .kv-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 12px; }
    .kv-table th { text-align: left; padding: 6px 8px; color: var(--text-muted); font-size: 11px; font-weight: 600; text-transform: uppercase; border-bottom: 1px solid var(--border); }
    .kv-table td { padding: 4px 6px; border-bottom: 1px solid rgba(48, 54, 61, 0.3); }
    .kv-input { width: 100%; background: var(--card); border: 1px solid var(--border); border-radius: 4px; padding: 6px 8px; color: #fff; font-family: var(--font-mono); font-size: 12px; outline: none; }
    .kv-input:focus { border-color: var(--border-focus); }
    .btn-icon { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px 8px; font-size: 14px; border-radius: 4px; }
    .btn-icon:hover { color: var(--error); background: rgba(248, 81, 73, 0.1); }
    .btn-add-row { background: #21262d; border: 1px solid var(--border); color: var(--text); padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; margin-top: 8px; }
    .btn-add-row:hover { background: #30363d; color: #fff; }
    .btn-tool {
      background: var(--card); border: 1px solid var(--border); color: var(--text-muted);
      cursor: pointer; padding: 3px 7px; font-size: 11px; font-weight: 600; border-radius: 4px;
      transition: all 0.15s; display: inline-flex; align-items: center; justify-content: center;
      font-family: var(--font-mono); line-height: 1.2;
    }
    .btn-tool:hover {
      background: var(--card-hover); color: var(--text-white); border-color: var(--text-muted);
    }
    .btn-tool.active {
      color: var(--accent); background: rgba(56, 189, 248, 0.15); border-color: rgba(56, 189, 248, 0.35);
    }

    /* Code Editor Textarea */
    .code-textarea { width: 100%; height: 100%; min-height: 120px; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 10px; color: #7ee787; font-family: var(--font-mono); font-size: 12px; line-height: 1.5; resize: none; outline: none; }
    .code-textarea:focus { border-color: var(--border-focus); }

    /* Response View */
    #response-container { flex: 1; display: flex; flex-direction: column; background: var(--bg); overflow: hidden; }
    .resp-header { height: 42px; background: var(--panel); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; flex-shrink: 0; }
    .resp-meta { display: flex; align-items: center; gap: 14px; font-size: 12px; font-family: var(--font-mono); }
    .resp-actions { display: flex; gap: 8px; }
    .btn-action { background: var(--card); border: 1px solid var(--border); color: var(--text); padding: 4px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; transition: all 0.15s; }
    .btn-action:hover { background: var(--card-hover); color: #fff; }
    .resp-body-container { flex: 1; overflow: auto; padding: 16px; }
    .resp-pre { font-family: var(--font-mono); font-size: 12px; line-height: 1.6; color: #f0f6fc; white-space: pre-wrap; word-break: break-all; }

    /* Empty state */
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); font-size: 13px; gap: 12px; }
  </style>
</head>
<body>
  <div id="navbar">
    <div class="brand">
      <span style="font-size: 18px;">⚡</span>
      <span>API Vault</span>
      <span class="brand-tag">Dense Studio</span>
    </div>
    <div class="nav-actions">
      <button class="btn-new" onclick="createNewRequest()">
        <span>+</span>
        <span>New Request</span>
      </button>
      <div class="status-pill">
        <div class="pulse-dot"></div>
        <span id="storage-status">SQLite Local (160 records)</span>
      </div>
    </div>
  </div>

  <div id="workspace">
    <!-- Left History Sidebar -->
    <div id="sidebar">
      <div class="sidebar-header">
        <input type="text" id="search-input" class="search-input" placeholder="🔍 Search URL, title, response... (Cmd+K)" oninput="filterHistory()">
        <div class="filter-bar">
          <select id="filter-method" onchange="filterHistory()" title="Filter by HTTP Method">
            <option value="">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
          <select id="group-by" onchange="filterHistory()" title="Group requests by" style="flex:1;">
            <option value="domain">🌐 Host / Domain</option>
            <option value="date">📅 Date</option>
            <option value="status">🚦 Status Code</option>
            <option value="method">🏷️ Method</option>
            <option value="none">≡ No Grouping</option>
          </select>
          <button id="btn-toggle-short-url" class="btn-tool active" title="Rút gọn Endpoint: BẬT (Path only / Middle Truncation)" onclick="toggleShortUrl()">/api</button>
          <button id="btn-toggle-all" class="btn-tool" style="font-size:12px; padding:2px 6px;" title="Toggle Expand / Collapse All Groups" onclick="toggleAllGroups()">⊟</button>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 0 2px;">
          <span id="history-counter" class="item-counter">0 requests</span>
          <span id="group-counter" class="item-counter" style="color:var(--accent);">0 groups</span>
        </div>
      </div>
      <div id="history-list" class="history-list"></div>
    </div>

    <!-- Right Execution Workspace -->
    <div id="main-content">
      <!-- Request Bar -->
      <div id="request-bar">
        <select id="req-method" class="method-select">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
          <option value="HEAD">HEAD</option>
          <option value="OPTIONS">OPTIONS</option>
        </select>
        <div class="url-input-container">
          <input type="text" id="req-url" class="url-input" placeholder="Enter request URL (e.g. https://httpbin.org/get or https://api.github.com/users/octocat)..." onkeydown="handleUrlKey(event)">
        </div>
        <button id="btn-send" class="btn-send" onclick="sendRequest()">
          <span>Send</span>
          <span style="font-size:10px; opacity:0.8; font-family:var(--font-mono);">↵</span>
        </button>
      </div>

      <div id="panes-wrapper">
        <!-- Request Configuration Tabs -->
        <div id="request-config">
          <div class="tab-nav">
            <button class="tab-btn active" onclick="switchReqTab('params')">Params</button>
            <button class="tab-btn" onclick="switchReqTab('headers')">Headers</button>
            <button class="tab-btn" onclick="switchReqTab('body')">Body</button>
            <button class="tab-btn" onclick="switchReqTab('auth')">Auth</button>
            <button class="tab-btn" onclick="switchReqTab('notes')">Notes / Docs</button>
          </div>

          <!-- Tab: Params -->
          <div id="tab-params" class="tab-content active">
            <table class="kv-table" id="params-table">
              <thead>
                <tr>
                  <th style="width: 30px;"></th>
                  <th>Key</th>
                  <th>Value</th>
                  <th style="width: 40px;"></th>
                </tr>
              </thead>
              <tbody id="params-tbody"></tbody>
            </table>
            <button class="btn-add-row" onclick="addParamRow()">+ Add Parameter</button>
          </div>

          <!-- Tab: Headers -->
          <div id="tab-headers" class="tab-content">
            <table class="kv-table" id="headers-table">
              <thead>
                <tr>
                  <th style="width: 30px;"></th>
                  <th>Header Key</th>
                  <th>Header Value</th>
                  <th style="width: 40px;"></th>
                </tr>
              </thead>
              <tbody id="headers-tbody"></tbody>
            </table>
            <button class="btn-add-row" onclick="addHeaderRow()">+ Add Header</button>
          </div>

          <!-- Tab: Body -->
          <div id="tab-body" class="tab-content" style="height:100%; display:flex; flex-direction:column;">
            <div style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">Content-Type: application/json</span>
              <button class="btn-action" onclick="formatBodyJSON()">Format JSON</button>
            </div>
            <textarea id="req-body-text" class="code-textarea" placeholder='{\n  "key": "value"\n}'></textarea>
          </div>

          <!-- Tab: Auth -->
          <div id="tab-auth" class="tab-content">
            <div style="display:flex; flex-direction:column; gap:12px; max-width:500px;">
              <div style="display:flex; gap:10px; align-items:center;">
                <label style="font-size:12px; width:100px; color:var(--text-muted);">Auth Type:</label>
                <select id="auth-type" onchange="toggleAuthFields()" style="background:var(--card); color:#fff; border:1px solid var(--border); padding:6px 10px; border-radius:4px; font-size:12px;">
                  <option value="none">No Auth</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                </select>
              </div>
              <div id="auth-bearer-group" style="display:none; flex-direction:column; gap:6px;">
                <label style="font-size:12px; color:var(--text-muted);">Token:</label>
                <input type="text" id="auth-token" class="search-input" placeholder="Bearer eyJhbGciOi...">
              </div>
              <div id="auth-basic-group" style="display:none; flex-direction:column; gap:8px;">
                <input type="text" id="auth-username" class="search-input" placeholder="Username">
                <input type="password" id="auth-password" class="search-input" placeholder="Password">
              </div>
            </div>
          </div>

          <!-- Tab: Notes / Docs -->
          <div id="tab-notes" class="tab-content">
            <div style="display:flex; flex-direction:column; gap:10px; height:100%;">
              <input type="text" id="req-title" class="search-input" placeholder="Semantic Title (e.g. Check Airflow Health)">
              <textarea id="req-description" class="code-textarea" style="color:var(--text);" placeholder="Enter business context and purpose explaining why this request is called..."></textarea>
            </div>
          </div>
        </div>

        <!-- Response Container -->
        <div id="response-container">
          <div class="resp-header">
            <div class="resp-meta">
              <span id="resp-status" class="h-code" style="font-size:13px;">No Response</span>
              <span id="resp-time" style="color:var(--text-muted)">0 ms</span>
              <span id="resp-size" style="color:var(--text-muted)">0 B</span>
              <span id="resp-audit-id" style="color:var(--accent); font-weight:600;"></span>
            </div>
            <div class="resp-actions">
              <button class="btn-action" onclick="copyCurl()">Copy cURL</button>
              <button class="btn-action" onclick="copyResponseBody()">Copy Response</button>
            </div>
          </div>
          <div class="resp-body-container">
            <pre id="resp-body-pre" class="resp-pre">// Hit Send or pick a past request from the sidebar to inspect output</pre>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let activeHistoryId = null;
    let historyRecords = [];

    let collapsedGroups = new Set();
    let isAllCollapsed = false;

    // Load full history from local SQLite API
    async function loadHistory() {
      try {
        const res = await fetch('/api/requests?limit=1000');
        historyRecords = await res.json();
        renderHistory(historyRecords);
        document.getElementById('storage-status').innerText = \`SQLite Local (\${historyRecords.length} records)\`;
      } catch(e) {
        console.error(e);
      }
    }

    function getGroupKey(r, groupBy) {
      if (groupBy === 'domain') {
        try {
          const u = new URL(r.url);
          return { key: u.host || 'other-hosts', label: u.host || 'Other Hosts', icon: '🌐' };
        } catch(e) {
          return { key: 'relative-urls', label: 'Local / Relative Endpoints', icon: '🔗' };
        }
      }
      if (groupBy === 'date') {
        const d = r.date || 'Unknown Date';
        return { key: d, label: d, icon: '📅' };
      }
      if (groupBy === 'status') {
        if (!r.status_code) return { key: 'err', label: 'Errors / Network Failures', icon: '🔴' };
        const s = parseInt(r.status_code, 10);
        if (s >= 200 && s < 300) return { key: '2xx', label: '2xx Success', icon: '🟢' };
        if (s >= 300 && s < 400) return { key: '3xx', label: '3xx Redirection', icon: '🔵' };
        if (s >= 400 && s < 500) return { key: '4xx', label: '4xx Client Error', icon: '🟡' };
        if (s >= 500) return { key: '5xx', label: '5xx Server Error', icon: '🔴' };
        return { key: 'status-' + s, label: 'Status ' + s, icon: '🚦' };
      }
      if (groupBy === 'method') {
        const m = (r.method || 'GET').toUpperCase();
        return { key: m, label: m, icon: '🏷️' };
      }
      return null;
    }

    function toggleGroupElement(headerEl) {
      const groupEl = headerEl.closest('.history-group');
      if (!groupEl) return;
      const key = groupEl.getAttribute('data-group-key');
      if (collapsedGroups.has(key)) {
        collapsedGroups.delete(key);
        groupEl.classList.remove('collapsed');
      } else {
        collapsedGroups.add(key);
        groupEl.classList.add('collapsed');
      }
    }

    function toggleAllGroups() {
      isAllCollapsed = !isAllCollapsed;
      const groupEls = document.querySelectorAll('.history-group');
      groupEls.forEach(el => {
        const key = el.getAttribute('data-group-key');
        if (isAllCollapsed) {
          collapsedGroups.add(key);
          el.classList.add('collapsed');
        } else {
          collapsedGroups.delete(key);
          el.classList.remove('collapsed');
        }
      });
      const btn = document.getElementById('btn-toggle-all');
      if (btn) btn.innerText = isAllCollapsed ? '⊞' : '⊟';
    }

    let isShortEndpoint = true;

    function formatEndpoint(rawUrl, shorten) {
      if (!shorten || !rawUrl) return rawUrl;
      try {
        const u = new URL(rawUrl);
        const path = u.pathname;
        const search = u.search;
        const full = path + search;
        if (!full || full === "/") return "/";

        // If already reasonably short, display clean path as is
        if (full.length <= 42) return full;

        const segments = path.split("/").filter(Boolean);
        if (segments.length >= 3) {
          const tailSegments = segments.slice(-2).join("/");
          const firstSegment = segments[0];
          const qStr = search ? (search.length > 12 ? search.slice(0, 10) + "..." : search) : "";

          // Candidate 1: /first/.../last2
          let candidate = "/" + firstSegment + "/.../" + tailSegments + qStr;
          if (candidate.length <= 44) return candidate;

          // Candidate 2: .../last2
          candidate = ".../" + tailSegments + qStr;
          if (candidate.length <= 44) return candidate;

          // Candidate 3: .../last1
          const lastSeg = segments[segments.length - 1];
          if (lastSeg.length > 28) {
            return ".../" + lastSeg.slice(0, 12) + "..." + lastSeg.slice(-10) + qStr;
          }
          return ".../" + lastSeg + qStr;
        }

        const head = full.slice(0, 15);
        const tail = full.slice(-18);
        return head + "..." + tail;
      } catch (e) {
        return rawUrl.length > 40 ? rawUrl.slice(0, 15) + "..." + rawUrl.slice(-18) : rawUrl;
      }
    }

    function toggleShortUrl() {
      isShortEndpoint = !isShortEndpoint;
      const btn = document.getElementById('btn-toggle-short-url');
      if (btn) {
        btn.classList.toggle('active', isShortEndpoint);
        btn.title = isShortEndpoint ? 'Rút gọn Endpoint: BẬT (Path only / Middle Truncation)' : 'Rút gọn Endpoint: TẮT (Full URL)';
        btn.innerText = isShortEndpoint ? '/api' : 'URL';
      }
      filterHistory();
    }

    function renderHistoryItemHTML(r) {
      const displayUrl = formatEndpoint(r.url, isShortEndpoint);
      return \`
        <div class="history-item \${activeHistoryId === r.id ? 'active' : ''}" onclick="selectHistoryItem(\${r.id})">
          <div class="h-top">
            <span class="method-badge method-\${r.method.toLowerCase()}">\${r.method}</span>
            <span class="h-code code-\${String(r.status_code)[0]}xx">\${r.status_code || 'ERR'}</span>
            <span class="h-time">\${r.time}</span>
          </div>
          <div class="h-title">\${escapeHtml(r.title || r.url)}</div>
          <div class="h-url" title="\${escapeHtml(r.url)}">\${escapeHtml(displayUrl)}</div>
        </div>
      \`;
    }

    function renderHistory(records) {
      const container = document.getElementById('history-list');
      const groupByEl = document.getElementById('group-by');
      const groupBy = groupByEl ? groupByEl.value : 'domain';
      
      document.getElementById('history-counter').innerText = \`\${records.length} requests\`;
      
      if (!records.length) {
        container.innerHTML = '<div style="padding:20px; color:var(--text-muted); text-align:center; font-size:12px;">No requests found</div>';
        const gc = document.getElementById('group-counter');
        if (gc) gc.innerText = '0 groups';
        return;
      }

      if (groupBy === 'none') {
        const gc = document.getElementById('group-counter');
        if (gc) gc.innerText = 'Flat view';
        container.innerHTML = records.map(r => renderHistoryItemHTML(r)).join('');
        return;
      }

      // Group records
      const groupsMap = new Map();
      records.forEach(r => {
        const meta = getGroupKey(r, groupBy);
        const k = meta.key;
        if (!groupsMap.has(k)) {
          groupsMap.set(k, { label: meta.label, icon: meta.icon, items: [] });
        }
        groupsMap.get(k).items.push(r);
      });

      const gc = document.getElementById('group-counter');
      if (gc) gc.innerText = \`\${groupsMap.size} groups\`;

      // Render groups
      let html = '';
      for (const [key, g] of groupsMap.entries()) {
        const isCollapsed = collapsedGroups.has(key);
        const containsActive = activeHistoryId && g.items.some(it => it.id === activeHistoryId);
        const effectivelyCollapsed = isCollapsed && !containsActive;

        html += \`
          <div class="history-group \${effectivelyCollapsed ? 'collapsed' : ''}" data-group-key="\${escapeHtml(key)}">
            <div class="group-header" onclick="toggleGroupElement(this)">
              <div class="group-left">
                <span class="group-arrow">▼</span>
                <span class="group-icon">\${g.icon}</span>
                <span class="group-name" title="\${escapeHtml(g.label)}">\${escapeHtml(g.label)}</span>
              </div>
              <span class="group-badge">\${g.items.length}</span>
            </div>
            <div class="group-items">
              \${g.items.map(r => renderHistoryItemHTML(r)).join('')}
            </div>
          </div>
        \`;
      }
      container.innerHTML = html;
    }

    function filterHistory() {
      const q = document.getElementById('search-input').value.toLowerCase();
      const method = document.getElementById('filter-method').value;

      const filtered = historyRecords.filter(r => {
        const matchQ = !q || (r.url && r.url.toLowerCase().includes(q)) || 
                             (r.title && r.title.toLowerCase().includes(q)) ||
                             (r.description && r.description.toLowerCase().includes(q)) ||
                             (r.response_preview && r.response_preview.toLowerCase().includes(q));
        const matchMethod = !method || r.method === method;
        return matchQ && matchMethod;
      });
      renderHistory(filtered);
    }

    async function selectHistoryItem(id) {
      activeHistoryId = id;
      filterHistory();

      try {
        const res = await fetch('/api/requests/' + id);
        const r = await res.json();
        
        // Populate Request Composer
        document.getElementById('req-method').value = r.method;
        document.getElementById('req-url').value = r.url;
        document.getElementById('req-title').value = r.title || '';
        document.getElementById('req-description').value = r.description || '';
        document.getElementById('req-body-text').value = r.request_body || '';

        // Headers
        let hdrs = [];
        try {
          const parsedH = JSON.parse(r.request_headers);
          if (Array.isArray(parsedH)) hdrs = parsedH;
          else if (typeof parsedH === 'object') hdrs = Object.entries(parsedH).map(([key, value]) => ({ key, value, active: true }));
        } catch(e){}
        populateHeadersTable(hdrs);

        // Populate Params from URL
        syncUrlToParamsTable(r.url);

        // Populate Response
        renderResponse({
          status: r.status_code,
          statusText: r.status_text,
          duration: r.duration_ms,
          auditId: r.id,
          body: r.response_body
        });
      } catch(e) {
        console.error(e);
      }
    }

    // Execute Request from Browser
    async function sendRequest() {
      const method = document.getElementById('req-method').value;
      const url = document.getElementById('req-url').value.trim();
      if (!url) {
        alert("Please enter a target URL");
        return;
      }

      const sendBtn = document.getElementById('btn-send');
      sendBtn.disabled = true;
      sendBtn.innerText = "Sending...";

      // Gather headers
      const headers = {};
      const headerRows = document.querySelectorAll('#headers-tbody tr');
      headerRows.forEach(row => {
        const active = row.querySelector('.col-active').checked;
        const key = row.querySelector('.col-key').value.trim();
        const val = row.querySelector('.col-val').value.trim();
        if (active && key) headers[key] = val;
      });

      // Gather auth
      let auth = undefined;
      const authType = document.getElementById('auth-type').value;
      if (authType === 'bearer') {
        auth = { type: 'bearer', token: document.getElementById('auth-token').value.trim() };
      } else if (authType === 'basic') {
        auth = {
          type: 'basic',
          username: document.getElementById('auth-username').value.trim(),
          password: document.getElementById('auth-password').value.trim()
        };
      }

      // Gather body
      const body = ['GET', 'HEAD'].includes(method) ? undefined : document.getElementById('req-body-text').value;
      const title = document.getElementById('req-title').value.trim();
      const description = document.getElementById('req-description').value.trim();

      const payload = {
        method,
        url,
        headers,
        body,
        auth,
        title,
        description
      };

      try {
        const res = await fetch('/api/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();

        // Render response
        renderResponse({
          status: result.statusCode,
          statusText: result.statusText,
          duration: result.durationMs,
          auditId: result.auditId,
          body: result.body,
          error: result.error
        });

        // Reload history
        activeHistoryId = result.auditId;
        await loadHistory();
      } catch(err) {
        renderResponse({
          status: 'ERR',
          statusText: 'FETCH_FAILED',
          duration: 0,
          auditId: null,
          body: err.message
        });
      } finally {
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<span>Send</span><span style="font-size:10px; opacity:0.8; font-family:var(--font-mono);">↵</span>';
      }
    }

    function renderResponse(res) {
      const statusEl = document.getElementById('resp-status');
      statusEl.className = 'h-code code-' + String(res.status)[0] + 'xx';
      statusEl.innerText = (res.status || 'ERR') + ' ' + (res.statusText || '');

      document.getElementById('resp-time').innerText = (res.duration || 0) + ' ms';
      const sizeBytes = new Blob([res.body || '']).size;
      document.getElementById('resp-size').innerText = sizeBytes > 1024 ? (sizeBytes/1024).toFixed(1) + ' KB' : sizeBytes + ' B';
      document.getElementById('resp-audit-id').innerText = res.auditId ? '#' + res.auditId : '';

      let prettyText = res.body || '';
      try {
        const parsed = JSON.parse(res.body);
        prettyText = JSON.stringify(parsed, null, 2);
      } catch(e){}

      document.getElementById('resp-body-pre').innerText = prettyText || '(empty response)';
    }

    function createNewRequest() {
      activeHistoryId = null;
      document.getElementById('req-method').value = 'GET';
      document.getElementById('req-url').value = '';
      document.getElementById('req-title').value = '';
      document.getElementById('req-description').value = '';
      document.getElementById('req-body-text').value = '';
      document.getElementById('params-tbody').innerHTML = '';
      document.getElementById('headers-tbody').innerHTML = '';
      document.getElementById('resp-status').innerText = 'No Response';
      document.getElementById('resp-time').innerText = '0 ms';
      document.getElementById('resp-size').innerText = '0 B';
      document.getElementById('resp-audit-id').innerText = '';
      document.getElementById('resp-body-pre').innerText = '// Enter URL and click Send';
      filterHistory();
      document.getElementById('req-url').focus();
    }

    // Tabs navigation
    function switchReqTab(tabName) {
      document.querySelectorAll('#request-config .tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('#request-config .tab-content').forEach(c => c.classList.remove('active'));

      event.target.classList.add('active');
      const target = document.getElementById('tab-' + tabName);
      if (target) {
        target.classList.add('active');
        if (tabName === 'body') target.style.display = 'flex';
      }
    }

    // Dynamic Params
    function syncUrlToParamsTable(urlStr) {
      const tbody = document.getElementById('params-tbody');
      tbody.innerHTML = '';
      try {
        const u = new URL(urlStr);
        u.searchParams.forEach((val, key) => {
          appendParamRow(key, val, true);
        });
      } catch(e){}
    }

    function appendParamRow(key = '', val = '', active = true) {
      const tbody = document.getElementById('params-tbody');
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td><input type="checkbox" class="col-active" \${active ? 'checked' : ''} onchange="syncParamsToUrl()"></td>
        <td><input type="text" class="kv-input col-key" value="\${escapeHtml(key)}" placeholder="Parameter key" oninput="syncParamsToUrl()"></td>
        <td><input type="text" class="kv-input col-val" value="\${escapeHtml(val)}" placeholder="Value" oninput="syncParamsToUrl()"></td>
        <td><button class="btn-icon" onclick="this.closest('tr').remove(); syncParamsToUrl();">×</button></td>
      \`;
      tbody.appendChild(tr);
    }
    function addParamRow() { appendParamRow('', '', true); }

    function syncParamsToUrl() {
      const urlInput = document.getElementById('req-url');
      try {
        const u = new URL(urlInput.value || 'http://localhost');
        u.search = '';
        const rows = document.querySelectorAll('#params-tbody tr');
        rows.forEach(r => {
          const active = r.querySelector('.col-active').checked;
          const k = r.querySelector('.col-key').value.trim();
          const v = r.querySelector('.col-val').value.trim();
          if (active && k) u.searchParams.append(k, v);
        });
        urlInput.value = urlInput.value.includes('://') ? u.toString() : u.pathname + u.search;
      } catch(e){}
    }

    // Dynamic Headers
    function appendHeaderRow(key = '', val = '', active = true) {
      const tbody = document.getElementById('headers-tbody');
      const tr = document.createElement('tr');
      tr.innerHTML = \`
        <td><input type="checkbox" class="col-active" \${active ? 'checked' : ''}></td>
        <td><input type="text" class="kv-input col-key" value="\${escapeHtml(key)}" placeholder="Header name"></td>
        <td><input type="text" class="kv-input col-val" value="\${escapeHtml(val)}" placeholder="Header value"></td>
        <td><button class="btn-icon" onclick="this.closest('tr').remove();">×</button></td>
      \`;
      tbody.appendChild(tr);
    }
    function addHeaderRow() { appendHeaderRow('', '', true); }

    function populateHeadersTable(hdrs) {
      const tbody = document.getElementById('headers-tbody');
      tbody.innerHTML = '';
      hdrs.forEach(h => appendHeaderRow(h.key, h.value, h.active !== false));
    }

    function toggleAuthFields() {
      const t = document.getElementById('auth-type').value;
      document.getElementById('auth-bearer-group').style.display = t === 'bearer' ? 'flex' : 'none';
      document.getElementById('auth-basic-group').style.display = t === 'basic' ? 'flex' : 'none';
    }

    function formatBodyJSON() {
      const ta = document.getElementById('req-body-text');
      try {
        ta.value = JSON.stringify(JSON.parse(ta.value), null, 2);
      } catch(e) {
        alert("Invalid JSON format");
      }
    }

    function copyCurl() {
      const method = document.getElementById('req-method').value;
      const url = document.getElementById('req-url').value;
      let curl = \`curl -X \${method} "\${url}"\`;
      const rows = document.querySelectorAll('#headers-tbody tr');
      rows.forEach(r => {
        if (r.querySelector('.col-active').checked) {
          const k = r.querySelector('.col-key').value.trim();
          const v = r.querySelector('.col-val').value.trim();
          if (k) curl += \` \\\n  -H "\${k}: \${v}"\`;
        }
      });
      const body = document.getElementById('req-body-text').value;
      if (body && !['GET', 'HEAD'].includes(method)) {
        curl += \` \\\n  -d '\${body.replace(/'/g, "'\\\\''")}'\`;
      }
      navigator.clipboard.writeText(curl);
      alert("cURL copied to clipboard!");
    }

    function copyResponseBody() {
      const text = document.getElementById('resp-body-pre').innerText;
      navigator.clipboard.writeText(text);
      alert("Response copied to clipboard!");
    }

    function handleUrlKey(e) {
      if (e.key === 'Enter') sendRequest();
    }

    function escapeHtml(str) {
      return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        sendRequest();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input').focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        createNewRequest();
      }
    });

    // Initial Load
    loadHistory();
  </script>
</body>
</html>`;
}

module.exports = { getDashboardHTML };
