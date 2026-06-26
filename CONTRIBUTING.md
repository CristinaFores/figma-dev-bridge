# Contributing

## Setup

```bash
git clone https://github.com/CristinaFores/design-context-bridge.git
cd design-context-bridge
npm install
npm run build:all
```

## Development workflow

```bash
npm run build        # compile MCP server
npm run build:plugin # compile Figma plugin
npm run watch:plugin # recompile plugin on save
npm test             # run test suite
npm run lint         # eslint
```

After changing `figma-plugin/code.ts`, always run `npm run build:plugin` — the compiled `code.js` must be committed because Figma loads it directly.

## Adding a new tool

1. Create `src/mcp-server/tools/your-tool-name.ts` — export `TOOL_NAME`, `toolDefinition`, and `handleTool()`.
2. If the tool needs live Figma data not in the cache, add a new request type in `handleRequest()` in `figma-plugin/code.ts`.
3. Register the tool in `src/mcp-server/tool-registry.ts`.
4. Document it in the Tools table in `README.md`.
5. Run `npm run build:all && npm test`.

## Commit style

[Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `test:`, `chore:`.

## Pull requests

Use the PR template. Each PR should pass CI and have `npm run build:all` + `npm test` green locally before opening.
