import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { parseFigmaUrl, fetchFile } from '../client.js';

export const GET_FILE_FROM_URL = 'get_file_from_url';

export const getFileFromUrlDefinition = {
  name: GET_FILE_FROM_URL,
  description:
    'Fetches a Figma file directly via the Figma REST API using a figma.com URL. Returns pages, top-level frames, and document metadata. Requires FIGMA_ACCESS_TOKEN in the server environment. Use this when you have a Figma link but the plugin is not running.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      url: {
        type: 'string',
        description: 'Figma file URL, e.g. https://www.figma.com/design/ABC123/My-File',
      },
    },
    required: ['url'],
  },
};

export async function handleGetFileFromUrl(args: Record<string, unknown>): Promise<CallToolResult> {
  const url = typeof args.url === 'string' ? args.url : '';
  if (!url) return { content: [{ type: 'text', text: 'Provide a "url" parameter.' }] };

  try {
    const { fileKey } = parseFigmaUrl(url);
    const file = (await fetchFile(fileKey)) as Record<string, unknown>;

    const doc = file.document as Record<string, unknown> | undefined;
    const pages = (doc?.children as Array<Record<string, unknown>> | undefined) ?? [];

    const summary = {
      name: file.name,
      lastModified: file.lastModified,
      version: file.version,
      fileKey,
      pages: pages.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        childCount: (p.children as unknown[] | undefined)?.length ?? 0,
        frames: ((p.children as Array<Record<string, unknown>> | undefined) ?? [])
          .filter((c) => c.type === 'FRAME' || c.type === 'COMPONENT' || c.type === 'SECTION')
          .map((c) => ({ id: c.id, name: c.name, type: c.type })),
      })),
    };

    return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
  } catch (err) {
    return { content: [{ type: 'text', text: `Error: ${(err as Error).message}` }] };
  }
}
