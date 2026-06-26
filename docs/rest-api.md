# REST API mode

Read any Figma file by URL — no plugin, no selection needed.

## Requirements

- A Figma personal access token
- Node.js ≥ 18

## Get a token

1. Open Figma → click your **avatar** → **Settings**
2. Go to **Security** → **Personal access tokens**
3. Click **Generate new token**, name it (e.g. `design-context-bridge`), and copy it

## Add it to your client config

Add `FIGMA_ACCESS_TOKEN` to the `env` block of your MCP server entry. Example for Claude Code:

```json
{
  "mcpServers": {
    "design-context-bridge": {
      "command": "npx",
      "args": ["-y", "design-context-bridge"],
      "type": "stdio",
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_xxxxxxxxxxxx"
      }
    }
  }
}
```

See [clients.md](clients.md) for the exact config path and format for every supported client.

## What you can do in REST mode

With a token set, every document and navigation tool accepts a `url` (see [tools.md](tools.md)). On top of that, these REST-only tools read and reason about a whole file:

| Tool | What it does |
|------|-------------|
| `get_file_from_url` | Pages, frames, and metadata — or the node for a URL's `node-id` |
| `get_node_from_url` | A specific node from a URL |
| `extract_design_system` | Colors, type scale, spacing, radii and shadows — even without Figma Variables |
| `analyze_structure` | Pages, screens, suggested routes, component inventory |
| `get_component_variants` | A component's property definitions and all variant values |
| `find_assets` | Export-worthy nodes (icons, vectors) with suggested filenames |
| `export_image` | SVG source inline, or a render URL for PNG/JPG |

> The Figma **Variables** REST API (`get_variables` with a `url`) is Enterprise-only. On other plans, use `extract_design_system` to derive tokens from the design instead.

## Example

```
get_file_from_url {
  url: "https://www.figma.com/design/BLIwwwzcRVrVb2CxhfMCtG/My-File"
}

get_node_from_url {
  url: "https://www.figma.com/design/BLIwwwzcRVrVb2CxhfMCtG/My-File?node-id=0-1"
}
```
