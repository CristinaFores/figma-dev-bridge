import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { requestFromPlugin } from '../../figma-bridge/store.js';

export const GET_NODES_INFO = 'get_nodes_info';

export const getNodesInfoDefinition = {
  name: GET_NODES_INFO,
  description: 'Fetches multiple Figma nodes by id (live, on-demand) in one call. Returns an array of node info up to a given depth.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      ids: { type: 'array', items: { type: 'string' }, description: 'List of node ids to fetch.' },
      depth: { type: 'number', description: 'Children depth per node. Default 1.' },
    },
    required: ['ids'],
  },
};

export async function handleGetNodesInfo(args: Record<string, unknown>): Promise<CallToolResult> {
  const ids = Array.isArray(args.ids) ? (args.ids as unknown[]).filter((x) => typeof x === 'string') : [];
  if (ids.length === 0) return { content: [{ type: 'text', text: 'Provide an "ids" array of node ids.' }] };
  const params: Record<string, unknown> = { ids };
  if (typeof args.depth === 'number') params.depth = args.depth;
  const result = await requestFromPlugin(GET_NODES_INFO, params);
  return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
}
