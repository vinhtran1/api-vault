# ⚡ API Vault

> **Local-first API Client & Model Context Protocol (MCP) Server powered by Node.js Native SQLite.**  
> Zero cloud limits, zero data truncation, 100% private, with a high-density developer Web Studio.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![MCP Ready](https://img.shields.io/badge/MCP-Protocol%202024--11--05-orange.svg)](https://modelcontextprotocol.io/)
[![Zero External Dependencies](https://img.shields.io/badge/Dependencies-Zero-success.svg)](https://nodejs.org/api/sqlite.html)

---

## 💡 Why API Vault?

Traditional cloud-based API clients (Postman, Hoppscotch Cloud) often hit painful ceilings:
- **Cloud Document Size Limits:** E.g. Hoppscotch Cloud syncs user collections in a single Google Cloud Firestore document with a hard **1MB limit**. Large OpenAPI specs, logs, or payload responses silently break sync (`user/collection_creation_failed`).
- **Privacy & Secret Leakage:** Internal tokens, staging endpoints, and private corporate data end up on third-party cloud servers.
- **Disconnected AI Agents:** When coding with Claude Desktop, Cursor, or Antigravity, AI agents cannot easily audit past requests or execute internal API queries without manual curl copying.

**API Vault solves this permanently.** Built entirely on Node.js 22+ native SQLite (`node:sqlite`) with **zero external npm dependencies**, API Vault stores gigabytes of full headers, input bodies, and raw responses locally on your machine, while seamlessly exposing an MCP interface to AI agents and a keyboard-friendly Web Studio for humans.

---

## ✨ Features

- 🚀 **Zero Size Limits & 100% Local Storage:** Every request and response is persistently stored in `~/.api-vault/api_vault.db` using Node.js native SQLite. No truncation, no cloud fees.
- 🤖 **Native MCP Server:** Plug directly into **Claude Desktop**, **Cursor**, **Antigravity**, **Cline**, and any MCP client.
- 📝 **Mandatory AI Purpose Logging:** AI agents are required to declare *why* an endpoint is called (`description`), keeping an interpretable audit trail of all automated actions.
- 🖥️ **Dense Tech Web Studio:**
  - **Collapsible Multi-Criteria Grouping:** Group past requests by Host/Domain, Date, HTTP Status, Method, or Flat view.
  - **Smart Endpoint Shortening:** Automatically strips verbose schemes and hostnames, applying middle truncation (`.../dags/demo/dagRuns`) so you can identify resources at a glance.
  - **One-Click Toggle (`/api` & `⊟`):** Switch between compact paths and full URLs, or expand/collapse all groups instantly.
  - **Hover Tooltips:** Hover over any shortened endpoint to view the 100% complete URL.
- 🌐 **CORS-Free Execution Proxy:** Call private VPN hosts, staging microservices, or local Docker services without browser CORS restrictions.
- ⚡ **Zero Dependencies:** Pure Node.js standard library (`node:http`, `node:sqlite`, `node:child_process`). Instant startup.

---

## 🚀 Quickstart

### 1. Launch the Web Studio
Run one command to start the local proxy and launch the Web Studio in your default browser:

```bash
npx api-vault studio
```

Options:
```bash
# Specify custom port (default: 54193)
npx api-vault studio -p 54193

# Specify custom SQLite data directory (default: ~/.api-vault)
API_VAULT_DATA_DIR=/path/to/data npx api-vault studio
```

### 2. Run as an MCP Server
To run API Vault as an MCP Stdio Server for your AI assistants:

```bash
npx api-vault
```

---

## 🔌 MCP Client Configuration

### Claude Desktop
Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "api-vault": {
      "command": "npx",
      "args": ["-y", "api-vault"]
    }
  }
}
```

### Cursor (`mcp.json`)
```json
{
  "mcpServers": {
    "api-vault": {
      "command": "npx",
      "args": ["-y", "api-vault"]
    }
  }
}
```

### Antigravity / Gemini CLI (`mcp_config.json`)
```json
{
  "mcpServers": {
    "api-vault": {
      "command": "node",
      "args": ["/path/to/api-vault/src/server.js"],
      "env": {
        "API_VAULT_PORT": "54193"
      }
    }
  }
}
```

---

## 🛠️ MCP Tools Reference

| Tool | Description | Key Parameters |
| :--- | :--- | :--- |
| `execute_request` | Execute an HTTP/REST/GraphQL request with unlimited SQLite audit logging. | `method`, `url`, `description` (mandatory), `headers`, `body`, `auth` |
| `search_history` | Search historical requests by keyword, date, method, or HTTP status. | `query`, `date`, `method`, `status_code`, `limit` |
| `get_request_detail` | Retrieve full untruncated headers, request body, and response body by ID. | `id` |
| `get_dashboard_url` | Get the live URL and status of the local Web Studio. | — |
| `export_history` | Export all stored requests into a clean JSON file. | `file_path` |

---

## 🏗️ Architecture

```
                    ┌─────────────────────────────────────┐
                    │      AI Agent / MCP Client          │
                    │  (Claude Desktop, Cursor, Antigravity)│
                    └──────────────────┬──────────────────┘
                                       │ JSON-RPC (stdio)
                                       ▼
┌──────────────────────┐    ┌─────────────────────────────────────┐
│   Developer Browser  │    │         API Vault Engine            │
│  (Dense Tech Studio) │    │                                     │
└──────────┬───────────┘    │  • MCP Server (tools/call)          │
           │ HTTP / SSE     │  • CORS Proxy Bridge                │
           └───────────────►│  • Smart Truncation & Grouping      │
                            └──────────────────┬──────────────────┘
                                               │ node:sqlite
                                               ▼
                                    ┌──────────────────────┐
                                    │    Local SQLite DB   │
                                    │  (~/.api-vault/*.db) │
                                    └──────────────────────┘
```

---

## 📜 License

MIT License © 2026 [Vinh Tran](https://github.com/vinhtran1). Free and open-source for personal and commercial use.
