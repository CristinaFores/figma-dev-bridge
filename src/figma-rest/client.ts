const FIGMA_API = 'https://api.figma.com/v1';

function getToken(): string {
  const token = process.env.FIGMA_ACCESS_TOKEN;
  if (!token) throw new Error('FIGMA_ACCESS_TOKEN is not set. Add it to your MCP server environment.');
  return token;
}

async function figmaFetch(path: string): Promise<unknown> {
  const res = await fetch(`${FIGMA_API}${path}`, {
    headers: { 'X-Figma-Token': getToken() },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Figma API ${res.status}: ${body}`);
  }
  return res.json();
}

export function parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } {
  const keyMatch = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
  if (!keyMatch) throw new Error(`Cannot parse Figma file key from URL: ${url}`);
  const fileKey = keyMatch[1];
  const nodeMatch = url.match(/node-id=([^&#]+)/);
  const nodeId = nodeMatch ? decodeURIComponent(nodeMatch[1]).replace(/-/g, ':') : undefined;
  return { fileKey, nodeId };
}

export async function fetchFile(fileKey: string): Promise<unknown> {
  return figmaFetch(`/files/${fileKey}?depth=2`);
}

export async function fetchNodes(fileKey: string, nodeIds: string[]): Promise<unknown> {
  const ids = nodeIds.map((id) => encodeURIComponent(id)).join(',');
  return figmaFetch(`/files/${fileKey}/nodes?ids=${ids}`);
}
