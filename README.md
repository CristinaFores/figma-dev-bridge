# figma-dev-bridge

<p align="center">
  <img src="https://raw.githubusercontent.com/CristinaFores/figma-dev-bridge/main/.github/cover.svg" alt="figma-dev-bridge" width="100%"/>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/figma-dev-bridge"><img src="https://img.shields.io/npm/v/figma-dev-bridge?color=a78bfa&labelColor=18181b" alt="npm"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-4ade80?labelColor=18181b" alt="MIT"/></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-60a5fa?labelColor=18181b" alt="Node ≥ 18"/>
  <img src="https://img.shields.io/badge/tools-15-fb923c?labelColor=18181b" alt="15 tools"/>
</p>

**Client-agnostic MCP server** that gives any AI agent live access to your Figma designs — selection, colors, text, spacing tokens, variables, prototype interactions, and full document navigation by node id.

Works with **Claude Code, Cursor, OpenCode, Claude Desktop, Windsurf, VS Code** and any other tool that supports the [Model Context Protocol](https://modelcontextprotocol.io).

---

## Two ways to connect

### Option A — Figma Plugin (local bridge)

The plugin runs inside Figma desktop and pushes design context to the AI in real time. Selections update automatically. On-demand tools let the agent walk the whole document by node id without loading the full tree.

**Requires:** Figma desktop app · Node.js ≥ 18 · Plugin installed (see below)

### Option B — Figma REST API (no plugin)

Pass any `figma.com` URL directly. The server calls the Figma REST API and returns file structure, pages, frames, and node data.

**Requires:** Figma personal access token · Node.js ≥ 18

Both options can run at the same time — the plugin handles the live selection flow, the REST API handles arbitrary file lookups.

---

## Quick start

```bash
npx figma-dev-bridge
```

---

## Client setup

Add figma-dev-bridge to your MCP client config. Use the snippets below for each client.

### Claude Code

Edit `~/.claude.json` (or `.claude/settings.json` in your project):

```json
{
  "mcpServers": {
    "figma-dev-bridge": {
      "command": "npx",
      "args": ["-y", "figma-dev-bridge"],
      "type": "stdio",
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "figma-dev-bridge": {
      "command": "npx",
      "args": ["-y", "figma-dev-bridge"],
      "type": "stdio",
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

### Cursor

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "figma-dev-bridge": {
      "command": "npx",
      "args": ["-y", "figma-dev-bridge"],
      "type": "stdio",
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

### OpenCode

Edit `~/.config/opencode/opencode.jsonc`:

```json
{
  "mcp": {
    "figma-dev-bridge": {
      "type": "local",
      "command": ["npx", "-y", "figma-dev-bridge"],
      "enabled": true,
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "figma-dev-bridge": {
      "command": "npx",
      "args": ["-y", "figma-dev-bridge"],
      "type": "stdio",
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

### VS Code (Copilot / Cline / Continue)

Edit `.vscode/mcp.json` in your workspace, or in user settings:

```json
{
  "mcpServers": {
    "figma-dev-bridge": {
      "command": "npx",
      "args": ["-y", "figma-dev-bridge"],
      "type": "stdio",
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

> `FIGMA_ACCESS_TOKEN` is only required for the REST API tools (`get_file_from_url`, `get_node_from_url`). For plugin-only usage you can omit it.

---

## Option A — Plugin setup

### Step 1 — Install the plugin

1. Clone or download this repo
2. Open **Figma desktop** → Menu → Plugins → Development → **Import plugin from manifest…**
3. Select `figma-plugin/manifest.json` from this repo
4. Run it: **Plugins → Development → Figma Dev Bridge**

The plugin window shows a status indicator:

- 🟢 **Conectado al bridge** — the AI agent can read your design
- 🔴 **Sin bridge** — start your AI client first, then reopen the plugin

### Step 2 — Keep the plugin open

The plugin must stay open while you work. Selection-based tools serve the last pushed context even if you switch focus, but on-demand navigation tools (`get_node_info`, etc.) require the plugin to be live.

---

## Option B — REST API setup

### Step 1 — Get a Figma personal access token

1. Open Figma (desktop or web) → click your **avatar** → **Settings**
2. Go to **Security** → scroll to **Personal access tokens**
3. Click **Generate new token**, give it a name (e.g. `figma-dev-bridge`), and copy it

### Step 2 — Add it to your client config

Add `"FIGMA_ACCESS_TOKEN": "your-token-here"` inside the `env` block of your client config (see the snippets above).

### Step 3 — Use it

```
get_file_from_url { url: "https://www.figma.com/design/ABC123/My-File" }
get_node_from_url { url: "https://www.figma.com/design/ABC123/My-File?node-id=0-1" }
```

---

## Tools reference

### Plugin tools — selection (auto-pushed)

These tools serve whatever is currently selected in Figma. No arguments needed.

| Tool | What it does |
|------|-------------|
| `get_current_selection` | Returns the selected nodes with fills, position, size, and text content |
| `get_selected_colors` | Returns all unique hex colors found in the selection and its descendants |
| `get_selected_texts` | Returns all text nodes with content, font family, and font size |
| `get_selected_spacing` | Returns auto-layout spacing (gap, padding) including the name of any bound spacing token from local or library variables |
| `get_selected_interactions` | Returns prototype interactions: trigger (ON_CLICK, ON_HOVER…), action, destination, transition type (SMART_ANIMATE, PUSH…), duration, and easing |

### Plugin tools — document overview

These tools return cached document structure. No selection needed, but plugin must be connected.

| Tool | What it does |
|------|-------------|
| `get_current_page` | Returns the name and top-level frames of the current page (with ids) |
| `get_all_pages` | Returns all pages in the document with their ids and child counts |
| `get_frame_by_name` | Finds a top-level frame by name (case-insensitive partial match) and returns its id |
| `get_component_definitions` | Returns all components and component sets on the current page |
| `get_variables` | Returns all local design tokens (color, spacing/FLOAT, string, boolean) grouped by collection and mode. Filter with `{ type: "COLOR" \| "FLOAT" \| "STRING" \| "BOOLEAN" }` |

### Plugin tools — on-demand navigation

These tools fetch nodes live from Figma by id. The plugin must be open to answer the request (12 s timeout).

| Tool | Arguments | What it does |
|------|-----------|-------------|
| `get_node_info` | `id` (required), `depth` (default 2) | Fetches any node by id and returns its properties and children up to the given depth |
| `get_nodes_info` | `ids[]` (required), `depth` (default 1) | Fetches multiple nodes by id in one call |
| `scan_nodes_by_types` | `types[]` (required), `rootId` (optional) | Scans the current page (or a subtree) and returns every node whose type matches — e.g. `["TEXT","INSTANCE","FRAME"]`. Capped at 1 000 results |

**Typical navigation flow:**

```
get_all_pages                              → get page ids
get_current_page                           → get top-level frame ids
get_node_info { id: "12:34", depth: 2 }    → drill into a frame
get_node_info { id: "12:56", depth: 1 }    → drill deeper, lazily

# Or search by type
scan_nodes_by_types { types: ["INSTANCE"] }  → find all component instances
get_node_info { id: "..." }                  → inspect one
```

### REST API tools — no plugin needed

These tools call the Figma REST API directly. Require `FIGMA_ACCESS_TOKEN`.

| Tool | Arguments | What it does |
|------|-----------|-------------|
| `get_file_from_url` | `url` (required) | Fetches a Figma file by URL and returns pages, top-level frames, and document metadata |
| `get_node_from_url` | `url` (required), `node_id` (optional override) | Fetches a specific node from a URL that includes `?node-id=X-Y` |

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FIGMA_BRIDGE_PORT` | `3055` | Port for the local HTTP bridge (plugin ↔ server). If you change this, also update `figma-plugin/code.ts` and rebuild the plugin — the plugin can't read env vars at runtime. |
| `FIGMA_ACCESS_TOKEN` | — | Figma personal access token. Required only for `get_file_from_url` and `get_node_from_url`. |

---

## Development

```bash
npm run build          # compile MCP server (src → dist)
npm run build:plugin   # compile Figma plugin (figma-plugin/code.ts → code.js)
npm run build:all      # both
npm run watch:plugin   # recompile plugin on save
npm run dev            # run server with tsx (no build step)
npm run lint           # eslint
npm test               # build + node:test suite
```

```
src/
  index.ts                    entry: starts MCP stdio server + local bridge
  core/types.ts               shared types
  figma-bridge/
    ws-server.ts              HTTP bridge (POST /update · GET /requests · POST /response)
    store.ts                  file-based shared state + requestFromPlugin()
  figma-rest/
    client.ts                 Figma REST API client + URL parser
    tools/
      get-file-from-url.ts
      get-node-from-url.ts
  mcp-server/
    tool-registry.ts          registers all 15 tools
    tools/                    one file per tool
figma-plugin/
  code.ts                     plugin main thread (push + poll loop)
  ui.html                     status UI
  manifest.json               import this into Figma desktop
```

---

## Troubleshooting

**🔴 Plugin shows "Sin bridge"**  
The MCP server isn't running. Start your AI client (it spawns the server automatically), or run `npm start` manually. Verify the bridge is up:
```bash
curl -X POST http://localhost:3055/update -H "Content-Type: application/json" -d '{}'
# → {"ok":true}
```

**`get_file_from_url` returns "FIGMA_ACCESS_TOKEN is not set"**  
Add the token to the `env` block of your MCP client config (see setup section above).

**On-demand tools time out**  
The plugin must be open in Figma. Reopen it and wait for the green dot before retrying.

**Changed the port and it broke**  
The plugin port is compiled in. Edit `figma-plugin/code.ts`, run `npm run build:plugin`, then re-import the manifest in Figma.

**Tools return "invalid result" or "Cannot read … of undefined"**  
Stale data from a previous session. Reconnect the MCP server in your client and reload the plugin.

---

## License

[MIT](LICENSE) © Cristina Fores Campos
