# Plugin setup

The Figma plugin runs inside Figma desktop and pushes design context to the AI in real time.

## Requirements

- Figma desktop app (not the browser version)
- Node.js ≥ 18
- An MCP-compatible AI client

## Install the plugin

1. Clone or download this repo
2. Open **Figma desktop** → Menu → Plugins → Development → **Import plugin from manifest…**
3. Select `figma-plugin/manifest.json`
4. Run it: **Plugins → Development → Design Context Bridge**

## Status indicators

| Status | Meaning |
|--------|---------|
| 🟢 Conectado al bridge | Plugin is connected — the AI can read your design |
| 🔴 Sin bridge | The MCP server isn't running — start your AI client first |

## Usage

Select any frame, component, or layer in Figma. The plugin pushes context automatically — no extra steps needed.

Keep the plugin window open while you work. Selection tools cache the last pushed state, but on-demand navigation tools (`get_node_info`, etc.) require the plugin to be live and responding.

## Verify the bridge is running

```bash
curl -X POST http://localhost:3055/update \
  -H "Content-Type: application/json" -d '{}'
# → {"ok":true}
```

## Custom port

The default port is `3055`. To change it, set `FIGMA_BRIDGE_PORT` in your MCP client env — but you must also update the hardcoded port in `figma-plugin/code.ts` and rebuild the plugin:

```bash
npm run build:plugin
```

Then re-import the manifest in Figma.
