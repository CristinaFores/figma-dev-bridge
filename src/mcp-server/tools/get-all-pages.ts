import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { store } from '../../figma-bridge/store.js';

export const GET_ALL_PAGES = 'get_all_pages';

export const getAllPagesDefinition = {
  name: GET_ALL_PAGES,
  description: 'Returns the list of all pages in the Figma document with their IDs and child counts.',
  inputSchema: { type: 'object' as const, properties: {}, required: [] as string[] },
};

export function handleGetAllPages(): CallToolResult {
  const ctx = store.getContext();
  if (!ctx || !ctx.pages) return { content: [{ type: 'text', text: 'No page list yet. Make sure the plugin is connected (green dot) and try again.' }] };
  return { content: [{ type: 'text', text: JSON.stringify(ctx.pages, null, 2) }] };
}
