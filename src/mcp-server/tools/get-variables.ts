import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { store } from '../../figma-bridge/store.js';

export const GET_VARIABLES = 'get_variables';

export const getVariablesDefinition = {
  name: GET_VARIABLES,
  description: 'Returns all local Figma Variables (design tokens): colors, spacing/sizing (FLOAT), strings and booleans, grouped by collection with their value per mode. Works for the whole document, no selection needed. Optionally filter by type.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      type: { type: 'string', enum: ['COLOR', 'FLOAT', 'STRING', 'BOOLEAN'], description: 'Optional. Only return variables of this resolved type.' },
    },
    required: [] as string[],
  },
};

export function handleGetVariables(args: Record<string, unknown>): CallToolResult {
  const ctx = store.getContext();
  if (!ctx || !ctx.variables) return { content: [{ type: 'text', text: 'No variable data yet. Make sure the plugin is connected (green dot) and try again.' }] };

  let vars = ctx.variables;
  const filter = typeof args.type === 'string' ? args.type.toUpperCase() : '';
  if (filter) vars = vars.filter((v) => v.type === filter);

  if (vars.length === 0) {
    return { content: [{ type: 'text', text: filter ? `No variables of type ${filter} found.` : 'No local variables found in this document.' }] };
  }
  return { content: [{ type: 'text', text: JSON.stringify(vars, null, 2) }] };
}
