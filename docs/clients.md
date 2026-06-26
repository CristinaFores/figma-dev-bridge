# Client configuration

Add design-context-bridge as an MCP server in your AI client. Replace `your-token-here` with your Figma access token (only needed for REST API tools — see [rest-api.md](rest-api.md)).

## Claude Code

File: `~/.claude.json` or `.claude/settings.json`

```json
{
  "mcpServers": {
    "design-context-bridge": {
      "command": "npx",
      "args": ["-y", "design-context-bridge"],
      "type": "stdio",
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Claude Desktop

File: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "design-context-bridge": {
      "command": "npx",
      "args": ["-y", "design-context-bridge"],
      "type": "stdio",
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Cursor

File: `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "design-context-bridge": {
      "command": "npx",
      "args": ["-y", "design-context-bridge"],
      "type": "stdio",
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

## OpenCode

File: `~/.config/opencode/opencode.jsonc`

```json
{
  "mcp": {
    "design-context-bridge": {
      "type": "local",
      "command": ["npx", "-y", "design-context-bridge"],
      "enabled": true,
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Windsurf

File: `~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "design-context-bridge": {
      "command": "npx",
      "args": ["-y", "design-context-bridge"],
      "type": "stdio",
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

## VS Code (Cline / Continue / Copilot)

File: `.vscode/mcp.json` in your workspace

```json
{
  "mcpServers": {
    "design-context-bridge": {
      "command": "npx",
      "args": ["-y", "design-context-bridge"],
      "type": "stdio",
      "env": {
        "FIGMA_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

## Any other MCP-compatible client

Use `npx -y design-context-bridge` as the command with `stdio` transport. Pass `FIGMA_ACCESS_TOKEN` as an environment variable if you want REST API access.
