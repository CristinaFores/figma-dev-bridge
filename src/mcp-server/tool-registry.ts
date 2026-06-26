import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { GET_CURRENT_SELECTION, getCurrentSelectionDefinition, handleGetCurrentSelection } from './tools/get-current-selection.js';
import { GET_CURRENT_PAGE, getCurrentPageDefinition, handleGetCurrentPage } from './tools/get-current-page.js';
import { GET_ALL_PAGES, getAllPagesDefinition, handleGetAllPages } from './tools/get-all-pages.js';
import { GET_FRAME_BY_NAME, getFrameByNameDefinition, handleGetFrameByName } from './tools/get-frame-by-name.js';
import { GET_COMPONENT_DEFINITIONS, getComponentDefinitionsDefinition, handleGetComponentDefinitions } from './tools/get-component-definitions.js';
import { GET_SELECTED_COLORS, getSelectedColorsDefinition, handleGetSelectedColors } from './tools/get-selected-colors.js';
import { GET_SELECTED_TEXTS, getSelectedTextsDefinition, handleGetSelectedTexts } from './tools/get-selected-texts.js';
import { GET_VARIABLES, getVariablesDefinition, handleGetVariables } from './tools/get-variables.js';
import { GET_SELECTED_SPACING, getSelectedSpacingDefinition, handleGetSelectedSpacing } from './tools/get-selected-spacing.js';
import { GET_SELECTED_INTERACTIONS, getSelectedInteractionsDefinition, handleGetSelectedInteractions } from './tools/get-selected-interactions.js';
import { GET_NODE_INFO, getNodeInfoDefinition, handleGetNodeInfo } from './tools/get-node-info.js';
import { GET_NODES_INFO, getNodesInfoDefinition, handleGetNodesInfo } from './tools/get-nodes-info.js';
import { SCAN_NODES_BY_TYPES, scanNodesByTypesDefinition, handleScanNodesByTypes } from './tools/scan-nodes-by-types.js';
import { GET_FILE_FROM_URL, getFileFromUrlDefinition, handleGetFileFromUrl } from '../figma-rest/tools/get-file-from-url.js';
import { GET_NODE_FROM_URL, getNodeFromUrlDefinition, handleGetNodeFromUrl } from '../figma-rest/tools/get-node-from-url.js';

export function registerTools(server: Server): void {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      getCurrentSelectionDefinition,
      getCurrentPageDefinition,
      getAllPagesDefinition,
      getFrameByNameDefinition,
      getComponentDefinitionsDefinition,
      getSelectedColorsDefinition,
      getSelectedTextsDefinition,
      getVariablesDefinition,
      getSelectedSpacingDefinition,
      getSelectedInteractionsDefinition,
      getNodeInfoDefinition,
      getNodesInfoDefinition,
      scanNodesByTypesDefinition,
      getFileFromUrlDefinition,
      getNodeFromUrlDefinition,
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;
    switch (name) {
      case GET_CURRENT_SELECTION:     return handleGetCurrentSelection();
      case GET_CURRENT_PAGE:          return handleGetCurrentPage();
      case GET_ALL_PAGES:             return handleGetAllPages();
      case GET_FRAME_BY_NAME:         return handleGetFrameByName(args as Record<string, unknown>);
      case GET_COMPONENT_DEFINITIONS: return handleGetComponentDefinitions();
      case GET_SELECTED_COLORS:       return handleGetSelectedColors();
      case GET_SELECTED_TEXTS:        return handleGetSelectedTexts();
      case GET_VARIABLES:             return handleGetVariables(args as Record<string, unknown>);
      case GET_SELECTED_SPACING:      return handleGetSelectedSpacing();
      case GET_SELECTED_INTERACTIONS: return handleGetSelectedInteractions();
      case GET_NODE_INFO:             return handleGetNodeInfo(args as Record<string, unknown>);
      case GET_NODES_INFO:            return handleGetNodesInfo(args as Record<string, unknown>);
      case SCAN_NODES_BY_TYPES:       return handleScanNodesByTypes(args as Record<string, unknown>);
      case GET_FILE_FROM_URL:         return handleGetFileFromUrl(args as Record<string, unknown>);
      case GET_NODE_FROM_URL:         return handleGetNodeFromUrl(args as Record<string, unknown>);
      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  });
}
