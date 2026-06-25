import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { store } from '../../figma-bridge/store.js';

export const GET_COMPONENT_DEFINITIONS = 'get_component_definitions';

export const getComponentDefinitionsDefinition = {
  name: GET_COMPONENT_DEFINITIONS,
  description: 'Returns all component and component set definitions in the current Figma page.',
  inputSchema: { type: 'object' as const, properties: {}, required: [] as string[] },
};

export function handleGetComponentDefinitions(): CallToolResult {
  const ctx = store.getContext();
  if (!ctx || !ctx.components) return { content: [{ type: 'text', text: 'No component data yet. Make sure the plugin is connected (green dot) and try again.' }] };
  if (ctx.components.length === 0) return { content: [{ type: 'text', text: 'No components found in the current page.' }] };
  return { content: [{ type: 'text', text: JSON.stringify(ctx.components, null, 2) }] };
}
