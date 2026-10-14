#!/usr/bin/env node

/**
 * API Vault CLI Entrypoint
 * Usage:
 *   npx api-vault            Start Model Context Protocol (MCP) Stdio Server
 *   npx api-vault studio     Launch Web Studio on local port & open browser
 *   npx api-vault --help     Show usage help
 */

const { spawn } = require("node:child_process");
const path = require("node:path");

const args = process.argv.slice(2);
const command = args[0] || "";

if (command === "--help" || command === "-h" || command === "help") {
  console.log(`
⚡ API Vault - Local-first API Client & MCP Server with Native SQLite

Usage:
  npx api-vault              Start MCP Server for Claude, Cursor, Antigravity (stdio)
  npx api-vault studio       Start Web Studio & open browser
  npx api-vault studio -p 54193  Specify custom port (default: 54193)
  npx api-vault --help       Show this help message
  npx api-vault -v, --version Show version

Environment Variables:
  API_VAULT_PORT      Port for Web Studio (default: 54193)
  API_VAULT_DATA_DIR  Directory to store SQLite database (default: ~/.api-vault)
`);
  process.exit(0);
}

if (command === "--version" || command === "-v") {
  const pkg = require("../package.json");
  console.log(`api-vault v${pkg.version}`);
  process.exit(0);
}

if (command === "studio" || command === "--studio") {
  let port = process.env.API_VAULT_PORT || "54193";
  const portIdx = args.findIndex(a => a === "-p" || a === "--port");
  if (portIdx !== -1 && args[portIdx + 1]) {
    port = args[portIdx + 1];
  }
  process.env.API_VAULT_PORT = port;

  const dashboardScript = path.join(__dirname, "..", "src", "dashboard.js");
  const child = spawn(process.execPath, [dashboardScript], {
    stdio: "inherit",
    env: process.env
  });

  child.on("close", (code) => {
    process.exit(code || 0);
  });
} else {
  // Default: Run MCP Server
  const serverScript = path.join(__dirname, "..", "src", "server.js");
  const child = spawn(process.execPath, [serverScript], {
    stdio: "inherit",
    env: process.env
  });

  child.on("close", (code) => {
    process.exit(code || 0);
  });
}
