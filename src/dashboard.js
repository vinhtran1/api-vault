#!/usr/bin/env node

/**
 * Standalone Web Studio & CORS-Free Proxy Server for API Vault
 * Runs on Node.js 22+ Native SQLite
 */

const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const { exec } = require("node:child_process");
const { DatabaseSync } = require("node:sqlite");
const { getDashboardHTML } = require("./ui.js");

const DATA_DIR = process.env.API_VAULT_DATA_DIR || path.join(process.env.HOME || "", ".api-vault");
const DB_PATH = path.join(DATA_DIR, "api_vault.db");
const PORT = parseInt(process.env.API_VAULT_PORT || "54193", 10);

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS api_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    method TEXT NOT NULL,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    request_headers TEXT,
    request_body TEXT,
    status_code INTEGER,
    status_text TEXT,
    duration_ms INTEGER,
    response_headers TEXT,
    response_body TEXT,
    is_error INTEGER DEFAULT 0,
    error_message TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_req_date ON api_requests(date);
  CREATE INDEX IF NOT EXISTS idx_req_method ON api_requests(method);
  CREATE INDEX IF NOT EXISTS idx_req_status ON api_requests(status_code);
`);

const insertStmt = db.prepare(`
  INSERT INTO api_requests (
    timestamp, date, time, method, url, title, description,
    request_headers, request_body, status_code, status_text,
    duration_ms, response_headers, response_body, is_error, error_message
  ) VALUES (
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?, ?
  )
`);

const searchStmt = db.prepare(`
  SELECT id, timestamp, date, time, method, url, title, description,
         status_code, status_text, duration_ms,
         substr(response_body, 1, 500) as response_preview
  FROM api_requests
  WHERE (? IS NULL OR url LIKE '%' || ? || '%' OR title LIKE '%' || ? || '%' OR description LIKE '%' || ? || '%' OR response_body LIKE '%' || ? || '%')
    AND (? IS NULL OR date = ?)
    AND (? IS NULL OR method = ?)
    AND (? IS NULL OR status_code = ?)
  ORDER BY id DESC
  LIMIT ?
`);

const detailStmt = db.prepare("SELECT * FROM api_requests WHERE id = ?");

function deriveTitle(method, url) {
  try {
    const u = new URL(url);
    const pathSegments = u.pathname.split("/").filter(Boolean);
    if (pathSegments.length >= 2) return `${pathSegments[pathSegments.length - 1]} (${pathSegments[pathSegments.length - 2]})`;
    if (pathSegments.length === 1) return `/${pathSegments[0]}`;
  } catch (e) {}
  return `${method} Request`;
}

async function executeFromBrowser(args) {
  const method = (args.method || "GET").toUpperCase();
  const url = args.url;
  if (!url) throw new Error("URL is required");

  const timeoutMs = args.timeout || 30000;
  const headers = { ...(args.headers || {}) };

  if (args.auth) {
    if (args.auth.type === "bearer" && args.auth.token) {
      headers["Authorization"] = `Bearer ${args.auth.token}`;
    } else if (args.auth.type === "basic" && args.auth.username) {
      const cred = Buffer.from(`${args.auth.username}:${args.auth.password || ""}`).toString("base64");
      headers["Authorization"] = `Basic ${cred}`;
    }
  }

  let body = args.body;
  if (body && typeof body === "object") {
    body = JSON.stringify(body);
    if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";
  }

  const now = new Date();
  let dateStr, timeStr;
  try {
    dateStr = new Intl.DateTimeFormat("en-CA").format(now);
    timeStr = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now);
  } catch (e) {
    dateStr = now.toISOString().slice(0, 10);
    timeStr = now.toTimeString().split(" ")[0];
  }

  const smartTitle = args.title || deriveTitle(method, url);
  const finalDescription = args.description ? args.description.trim() : `Manual request executed from API Vault Studio.`;

  const startTime = Date.now();
  let statusCode = 0;
  let statusText = "";
  let respHeaders = {};
  let respBody = "";
  let isError = 0;
  let errorMessage = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      method,
      headers,
      body: ["GET", "HEAD"].includes(method) ? undefined : body,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    statusCode = res.status;
    statusText = res.statusText || (statusCode === 200 ? "OK" : "");
    res.headers.forEach((val, key) => {
      respHeaders[key] = val;
    });

    respBody = await res.text();
  } catch (err) {
    isError = 1;
    errorMessage = err.message || String(err);
    statusText = "FETCH_ERROR";
  }

  const durationMs = Date.now() - startTime;

  const insertResult = insertStmt.run(
    now.toISOString(),
    dateStr,
    timeStr,
    method,
    url,
    smartTitle,
    finalDescription,
    JSON.stringify(headers, null, 2),
    body || null,
    statusCode,
    statusText,
    durationMs,
    JSON.stringify(respHeaders, null, 2),
    respBody,
    isError,
    errorMessage
  );

  return {
    auditId: insertResult.lastInsertRowid,
    statusCode,
    statusText,
    durationMs,
    headers: respHeaders,
    body: respBody,
    error: errorMessage
  };
}

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);

  // API: Execute request
  if (req.method === "POST" && reqUrl.pathname === "/api/execute") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        const result = await executeFromBrowser(payload);
        res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API: List requests
  if (reqUrl.pathname === "/api/requests") {
    const q = reqUrl.searchParams.get("q") || null;
    const date = reqUrl.searchParams.get("date") || null;
    const method = reqUrl.searchParams.get("method") || null;
    const status = reqUrl.searchParams.get("status") ? parseInt(reqUrl.searchParams.get("status"), 10) : null;
    const limit = Math.min(parseInt(reqUrl.searchParams.get("limit") || "500", 10), 5000);

    const rows = searchStmt.all(q, q, q, q, q, date, date, method, method, status, status, limit);
    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    res.end(JSON.stringify(rows));
    return;
  }

  // API: Get single request
  if (reqUrl.pathname.startsWith("/api/requests/")) {
    const id = parseInt(reqUrl.pathname.split("/").pop(), 10);
    const row = detailStmt.get(id);
    if (row) {
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify(row));
    } else {
      res.writeHead(404, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ error: "Request not found" }));
    }
    return;
  }

  // Serve UI
  if (req.method === "GET" && (reqUrl.pathname === "/" || reqUrl.pathname === "/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(getDashboardHTML());
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not Found");
});

server.listen(PORT, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${PORT}`;
  console.log(`⚡ API Vault Web Studio running at: ${url}`);
  console.log(`📦 Database: ${DB_PATH}`);

  // Auto-open browser
  const openCmd = process.platform === "darwin" ? `open "${url}"`
                : process.platform === "win32" ? `start "${url}"`
                : `xdg-open "${url}"`;
  exec(openCmd).on("error", () => {});
});
