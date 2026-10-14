#!/usr/bin/env node

/**
 * API Vault - Model Context Protocol (MCP) Server
 * Local-first, Zero-Truncation HTTP/REST Client powered by Node.js 22+ Native SQLite
 */

const { DatabaseSync } = require("node:sqlite");
const path = require("node:path");
const fs = require("node:fs");
const readline = require("node:readline");

const DATA_DIR = process.env.API_VAULT_DATA_DIR || path.join(process.env.HOME || "", ".api-vault");
const DB_PATH = path.join(DATA_DIR, "api_vault.db");
const DASHBOARD_PORT = parseInt(process.env.API_VAULT_PORT || "54193", 10);

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

// Prepared Statements
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
         substr(response_body, 1, 300) as response_preview
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
  return `${method} API`;
}

// Tool Execution Handlers
async function handleExecuteRequest(args) {
  const method = (args.method || "GET").toUpperCase();
  const url = args.url;
  if (!url) throw new Error("URL is required");

  if (!args.description || !args.description.trim()) {
    throw new Error("Field 'description' is mandatory: explain business context and why AI is executing this request.");
  }

  const timeoutMs = args.timeout || 30000;
  const headers = { ...(args.headers || {}) };

  // Auth helper
  if (args.auth) {
    if (args.auth.type === "bearer" && args.auth.token) {
      headers["Authorization"] = `Bearer ${args.auth.token}`;
    } else if (args.auth.type === "basic" && args.auth.username) {
      const cred = Buffer.from(`${args.auth.username}:${args.auth.password || ""}`).toString("base64");
      headers["Authorization"] = `Basic ${cred}`;
    } else if (args.auth.type === "api-key" && args.auth.key && args.auth.value) {
      if (args.auth.addTo === "query") {
        const u = new URL(url);
        u.searchParams.set(args.auth.key, args.auth.value);
      } else {
        headers[args.auth.key] = args.auth.value;
      }
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
  const callerHeader = "🤖 **Caller:** AI Agent Automated Request.";
  const desc = args.description.trim();
  const finalDescription = (desc.includes("AI Agent") || desc.includes("do AI"))
    ? desc
    : `${callerHeader}\n\n🎯 **Purpose:** ${desc}`;

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

  // Insert into SQLite database (UNLIMITED STORAGE)
  let insertResult;
  try {
    insertResult = insertStmt.run(
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
  } catch (dbErr) {
    process.stderr.write(`[API-Vault DB Error] ${dbErr.message}\n`);
  }

  const auditId = insertResult ? insertResult.lastInsertRowid : null;

  // Build clean output for AI context
  let output = `Status: ${statusCode} ${statusText}\nResponse Time: ${durationMs}ms\nAudit Log ID: #${auditId} (SQLite Local)\n\nHeaders:\n`;
  for (const [k, v] of Object.entries(respHeaders)) {
    output += `  ${k}: ${v}\n`;
  }
  output += `\nBody:\n`;

  try {
    const parsed = JSON.parse(respBody);
    output += JSON.stringify(parsed, null, 2);
  } catch (e) {
    output += respBody || "(empty body)";
  }

  if (errorMessage) {
    output += `\n\n⚠️ Error Details: ${errorMessage}`;
  }

  return {
    content: [{ type: "text", text: output }]
  };
}

async function handleSearchHistory(args) {
  const q = args.query || null;
  const date = args.date || null;
  const method = args.method ? args.method.toUpperCase() : null;
  const status = args.status_code ? parseInt(args.status_code, 10) : null;
  const limit = Math.min(parseInt(args.limit || "50", 10), 200);

  const rows = searchStmt.all(q, q, q, q, q, date, date, method, method, status, status, limit);
  let summary = `Found ${rows.length} request(s) in local SQLite vault:\n\n`;
  for (const r of rows) {
    summary += `• [#${r.id}] [${r.date} ${r.time}] ${r.method} ${r.status_code || "ERR"} (${r.duration_ms}ms) - ${r.title || r.url}\n`;
    if (r.description) {
      const firstLine = r.description.split("\n").filter(l => l.trim() && !l.includes("Caller:"))[0] || "";
      if (firstLine) summary += `   ${firstLine}\n`;
    }
  }
  return {
    content: [{ type: "text", text: summary }]
  };
}

async function handleGetRequestDetail(args) {
  const id = parseInt(args.id, 10);
  if (!id) throw new Error("ID is required");

  const row = detailStmt.get(id);
  if (!row) {
    return {
      content: [{ type: "text", text: `Request #${id} not found in database.` }]
    };
  }

  let text = `=== API Request Audit #${row.id} ===\n`;
  text += `Timestamp: ${row.timestamp}\n`;
  text += `Method: ${row.method}\n`;
  text += `URL: ${row.url}\n`;
  text += `Title: ${row.title}\n`;
  text += `Status: ${row.status_code} ${row.status_text}\n`;
  text += `Duration: ${row.duration_ms}ms\n\n`;
  text += `Description:\n${row.description || "(none)"}\n\n`;
  text += `--- Request Headers ---\n${row.request_headers || "{}"}\n\n`;
  text += `--- Request Body ---\n${row.request_body || "(none)"}\n\n`;
  text += `--- Response Headers ---\n${row.response_headers || "{}"}\n\n`;
  text += `--- Response Body ---\n${row.response_body || "(empty)"}\n`;

  return {
    content: [{ type: "text", text }]
  };
}

async function handleGetDashboardUrl() {
  const url = `http://127.0.0.1:${DASHBOARD_PORT}`;
  return {
    content: [
      {
        type: "text",
        text: `API Vault Web Studio is available at: ${url}\nDatabase Path: ${DB_PATH}\n(To launch standalone studio, run: npx api-vault studio)`
      }
    ]
  };
}

async function handleExportHistory(args) {
  const targetPath = args.file_path || path.join(DATA_DIR, `api_vault_export_${Date.now()}.json`);
  const allRows = db.prepare("SELECT * FROM api_requests ORDER BY id ASC").all();
  fs.writeFileSync(targetPath, JSON.stringify(allRows, null, 2), "utf8");
  return {
    content: [
      {
        type: "text",
        text: `Successfully exported ${allRows.length} requests to: ${targetPath}`
      }
    ]
  };
}

// Tool definitions for MCP tools/list
const TOOLS = [
  {
    name: "execute_request",
    description: "Execute an HTTP/REST/GraphQL request with unlimited audit logging into local SQLite database. Supports GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS. No size limits, 100% private.",
    inputSchema: {
      type: "object",
      properties: {
        method: {
          type: "string",
          enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
          description: "HTTP method"
        },
        url: {
          type: "string",
          description: "Target URL (supports http, https, private hosts, localhost)"
        },
        description: {
          type: "string",
          description: "MANDATORY: Business context and explicit purpose explaining why this request is called"
        },
        title: {
          type: "string",
          description: "Short semantic title for the request"
        },
        headers: {
          type: "object",
          additionalProperties: { type: "string" },
          description: "Request headers (key-value pairs)"
        },
        body: {
          type: "string",
          description: "Request body (for POST, PUT, PATCH)"
        },
        auth: {
          type: "object",
          description: "Authentication configuration",
          properties: {
            type: { type: "string", enum: ["bearer", "basic", "api-key"] },
            token: { type: "string" },
            username: { type: "string" },
            password: { type: "string" },
            key: { type: "string" },
            value: { type: "string" },
            addTo: { type: "string", enum: ["header", "query"] }
          },
          required: ["type"]
        },
        timeout: {
          type: "number",
          description: "Timeout in milliseconds (default: 30000)"
        }
      },
      required: ["method", "url", "description"]
    }
  },
  {
    name: "search_history",
    description: "Search local SQLite API history by keyword, date, method, or HTTP status code.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keyword to search in URL, title, description, or response body" },
        date: { type: "string", description: "Filter by date (format: YYYY-MM-DD)" },
        method: { type: "string", enum: ["GET", "POST", "PUT", "PATCH", "DELETE"], description: "Filter by HTTP method" },
        status_code: { type: "number", description: "Filter by HTTP status code (e.g. 200, 404, 500)" },
        limit: { type: "number", description: "Max results to return (default: 50, max: 200)" }
      }
    }
  },
  {
    name: "get_request_detail",
    description: "Retrieve complete audit details of a previous request by its ID (including 100% full headers, input body, and response body).",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "number", description: "The ID of the request in the SQLite vault" }
      },
      required: ["id"]
    }
  },
  {
    name: "get_dashboard_url",
    description: "Get the link and connection info to the local API Vault Web Studio.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "export_history",
    description: "Export all historical requests from local SQLite into a clean JSON file.",
    inputSchema: {
      type: "object",
      properties: {
        file_path: { type: "string", description: "Target JSON file path (default: ~/.api-vault/api_vault_export_<timestamp>.json)" }
      }
    }
  }
];

// JSON-RPC MCP Stdio Transport
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function sendJson(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let request;
  try {
    request = JSON.parse(trimmed);
  } catch (err) {
    return;
  }

  const { id, method, params } = request;

  try {
    if (method === "initialize") {
      sendJson({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: "api-vault",
            version: "1.0.0"
          }
        }
      });
      return;
    }

    if (method === "notifications/initialized") {
      return;
    }

    if (method === "tools/list") {
      sendJson({
        jsonrpc: "2.0",
        id,
        result: {
          tools: TOOLS
        }
      });
      return;
    }

    if (method === "tools/call") {
      const toolName = params.name;
      const toolArgs = params.arguments || {};

      let result;
      if (toolName === "execute_request") {
        result = await handleExecuteRequest(toolArgs);
      } else if (toolName === "search_history") {
        result = await handleSearchHistory(toolArgs);
      } else if (toolName === "get_request_detail") {
        result = await handleGetRequestDetail(toolArgs);
      } else if (toolName === "get_dashboard_url") {
        result = await handleGetDashboardUrl();
      } else if (toolName === "export_history") {
        result = await handleExportHistory(toolArgs);
      } else {
        throw new Error(`Unknown tool: ${toolName}`);
      }

      sendJson({
        jsonrpc: "2.0",
        id,
        result
      });
      return;
    }

    if (method === "ping") {
      sendJson({ jsonrpc: "2.0", id, result: {} });
      return;
    }

    // Default unknown method error
    sendJson({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method '${method}' not found` }
    });
  } catch (err) {
    sendJson({
      jsonrpc: "2.0",
      id,
      error: { code: -32603, message: err.message || String(err) }
    });
  }
});
