# figma-dev-bridge

<p align="center">
  <img src="https://raw.githubusercontent.com/CristinaFores/figma-dev-bridge/main/.github/cover.svg" alt="figma-dev-bridge — MCP server that connects Figma to any AI agent" width="100%"/>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/figma-dev-bridge"><img src="https://img.shields.io/npm/v/figma-dev-bridge?color=a78bfa&labelColor=18181b" alt="npm version"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-4ade80?labelColor=18181b" alt="MIT license"/></a>
  <img src="https://img.shields.io/badge/node-%3E%3D18-60a5fa?labelColor=18181b" alt="Node ≥ 18"/>
  <img src="https://img.shields.io/badge/tools-15-fb923c?labelColor=18181b" alt="15 MCP tools"/>
</p>

A **client-agnostic [MCP](https://modelcontextprotocol.io) server** that gives any AI agent live access to your Figma design context — selection, colors, text, spacing tokens, variables, prototype interactions — and on-demand navigation of the **entire document** by node id. Also supports reading any Figma file directly via URL using the Figma REST API.

Works with Claude Code, Cursor, OpenCode, Claude Desktop, or anything that speaks MCP over stdio.

---

## How it works

```
┌──────────────┐   stdio    ┌─────────────────────┐   HTTP :3055   ┌──────────────┐
│  AI client   │ ◀───────▶  │  MCP server         │ ◀───────────▶  │ Figma plugin │
│ (Claude Code,│   tools    │  (this package)     │  push + poll   │ (in Figma)   │
│  Cursor, …)  │            │  + local bridge     │                │              │
└──────────────┘            └─────────────────────┘                └──────────────┘
                                      ▲
                                      │ fetch()
                               api.figma.com/v1
                             (REST API — no plugin)
```

---

## Requirements

- **Node.js ≥ 18**
- **Figma desktop app** — for plugin mode
- An MCP-compatible AI client

---

## Installation

### Option A — npx (recommended)

```bash
npx figma-dev-bridge
```

### Option B — from source

```bash
git clone https://github.com/CristinaFores/figma-dev-bridge.git
cd figma-dev-bridge
npm install
npm run build:all
```

---

## Setup

### 1. Configure your AI client

**Claude Code / Cursor / Claude Desktop**

```json
{
  "mcpServers": {
    "figma-dev-bridge": {
      "command": "npx",
      "args": ["-y", "figma-dev-bridge"],
      "type": "stdio"
    }
  }
}
```

**OpenCode** (`~/.config/opencode/opencode.jsonc`)

```json
{
  "mcp": {
    "figma-dev-bridge": {
      "type": "local",
      "command": ["npx", "-y", "figma-dev-bridge"],
      "enabled": true
    }
  }
}
```

Ready-to-copy snippets for all clients in [`client-config-examples/`](client-config-examples).

### 2. Install the Figma plugin

1. Figma desktop → **Menu → Plugins → Development → Import plugin from manifest…**
2. Select **`figma-plugin/manifest.json`** from this repo
3. Run it: **Plugins → Development → Figma Dev Bridge**

> 🟢 **Conectado al bridge** — everything is connected  
> 🔴 **Sin bridge** — start your AI client first, then reopen the plugin

---

## Three ways to read your design

### Mode 1 — Select in Figma, ask the AI

Select any frame, component, or layer. The plugin pushes context automatically.

```
"What colors does this component use?"
"List all text nodes in this selection."
"What spacing tokens are applied here?"
```

No arguments needed — the AI reads whatever you have selected.

### Mode 2 — Navigate by node id

Get frame ids from `get_current_page`, then drill in on-demand. The plugin fetches each node live — no need to load the whole tree.

```
get_current_page                          # get top-level frame ids
get_node_info { id: "123:456", depth: 2 } # drill in
scan_nodes_by_types { types: ["INSTANCE"] } # find all component instances
```

### Mode 3 — Read by URL (no plugin needed)

Pass any Figma URL. Requires `FIGMA_ACCESS_TOKEN` in your environment.

```
get_file_from_url { url: "https://www.figma.com/design/ABC123/..." }
get_node_from_url { url: "https://www.figma.com/design/ABC123/...?node-id=0-1" }
```

---

## Tools

### 🟣 Selection — plugin pushes automatically

| Tool | Returns |
|------|---------|
| `get_current_selection` | Selected nodes with fills, position, size, and text |
| `get_selected_colors` | Unique hex colors from the selection and its descendants |
| `get_selected_texts` | Text content, font family, and font size |
| `get_selected_spacing` | Auto-layout spacing with bound token names (local or library) |
| `get_selected_interactions` | Prototype animations: trigger, action, transition, duration, easing |

### 🔵 Document overview — plugin required

| Tool | Returns |
|------|---------|
| `get_current_page` | Top-level frames of the current page with ids |
| `get_all_pages` | All pages in the document |
| `get_frame_by_name` | Frame or layer by name (case-insensitive partial match) |
| `get_component_definitions` | Components and component sets on the current page |
| `get_variables` | All local design tokens by collection and mode — filter with `{ type }` |

### 🔵 On-demand navigation — plugin required

| Tool | Returns |
|------|---------|
| `get_node_info` | Any node by id + children to a given `depth` |
| `get_nodes_info` | Several nodes by id in one call |
| `scan_nodes_by_types` | Every node matching `types` (e.g. `["TEXT","INSTANCE"]`), capped at 1000 |

### 🟢 REST API — no plugin needed

Requires `FIGMA_ACCESS_TOKEN`.

| Tool | Returns |
|------|---------|
| `get_file_from_url` | Pages, frames, and metadata from any Figma URL |
| `get_node_from_url` | A specific node from a URL that includes `?node-id=X-Y` |

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `FIGMA_BRIDGE_PORT` | `3055` | Port for the local HTTP bridge. If you change this, also update `figma-plugin/code.ts` and rebuild the plugin — the plugin can't read env vars. |
| `FIGMA_ACCESS_TOKEN` | — | Figma personal access token. Get it at Figma → Settings → Security → Access tokens. Required only for `get_file_from_url` and `get_node_from_url`. |

---

## Development

```bash
npm run build         # compile MCP server (src → dist)
npm run build:plugin  # compile Figma plugin
npm run build:all     # both
npm run watch:plugin  # recompile plugin on save
npm run dev           # run server with tsx (no build step)
npm run lint          # eslint
npm test              # build + node:test suite
```

```
src/
  index.ts                  entry: starts MCP stdio server + local bridge
  core/types.ts             shared types
  figma-bridge/
    ws-server.ts            HTTP bridge (push + on-demand request/response)
    store.ts                file-based shared state + requestFromPlugin()
  figma-rest/
    client.ts               Figma REST API client + URL parser
    tools/
      get-file-from-url.ts
      get-node-from-url.ts
  mcp-server/
    tool-registry.ts        registers all 15 tools
    tools/*.ts              one file per tool
figma-plugin/
  code.ts                   plugin main thread (push + poll loop)
  ui.html                   status UI
  manifest.json             import this into Figma
```

---

## Troubleshooting

**Plugin stuck on "Iniciando…" / 🔴 "Sin bridge"**  
The MCP server isn't running. Start your AI client or run `npm start`. Verify:
```bash
curl -X POST http://localhost:3055/update -H "Content-Type: application/json" -d '{}'
# → {"ok":true}
```

**`get_file_from_url` returns "FIGMA_ACCESS_TOKEN is not set"**  
Add `FIGMA_ACCESS_TOKEN` to the `env` block of your MCP client config.

**On-demand tools time out**  
The plugin must be open in Figma. Reopen it and check for the green dot.

**Changed the port and it broke**  
Update `figma-plugin/code.ts`, run `npm run build:plugin`, re-import the plugin in Figma.

---

## License

[MIT](LICENSE) © Cristina Fores Campos
