#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './mcp-server/tool-registry.js';
import { startFigmaBridge } from './figma-bridge/ws-server.js';

const server = new Server(
  { name: 'design-context-bridge', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

registerTools(server);
startFigmaBridge();

const transport = new StdioServerTransport();
await server.connect(transport);
