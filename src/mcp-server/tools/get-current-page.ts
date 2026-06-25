import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { store } from '../../figma-bridge/store.js';

export const GET_CURRENT_PAGE = 'get_current_page';

export const getCurrentPageDefinition = {
  name: GET_CURRENT_PAGE,
  description: 'Returns the name and top-level frame list of the current Figma page. For deep data on a specific frame, select it in Figma and use get_current_selection / get_selected_colors / get_selected_texts.',
  inputSchema: { type: 'object' as const, properties: {}, required: [] as string[] },
};

export function handleGetCurrentPage(): CallToolResult {
  const ctx = store.getContext();
  if (!ctx || !ctx.currentPage) return { content: [{ type: 'text', text: 'No page data yet. Make sure the plugin is connected (green dot) and try again.' }] };
  return { content: [{ type: 'text', text: JSON.stringify(ctx.currentPage, null, 2) }] };
}
