import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFigmaUrl } from '../dist/figma-rest/client.js';
import { walk } from '../dist/figma-rest/resolve.js';

test('parseFigmaUrl extracts file key from a design URL', () => {
  const { fileKey } = parseFigmaUrl('https://www.figma.com/design/ABC123/My-File');
  assert.equal(fileKey, 'ABC123');
});

test('parseFigmaUrl extracts and normalizes node-id', () => {
  const { fileKey, nodeId } = parseFigmaUrl(
    'https://www.figma.com/design/ABC123/My-File?node-id=12-345&t=x',
  );
  assert.equal(fileKey, 'ABC123');
  assert.equal(nodeId, '12:345');
});

test('parseFigmaUrl throws on a non-Figma URL', () => {
  assert.throws(() => parseFigmaUrl('https://example.com/foo'));
});

test('walk visits every node depth-first', () => {
  const tree = {
    id: '0', name: 'root', type: 'DOCUMENT',
    children: [
      { id: '1', name: 'a', type: 'FRAME', children: [{ id: '2', name: 'b', type: 'TEXT' }] },
      { id: '3', name: 'c', type: 'COMPONENT' },
    ],
  };
  const ids = [];
  walk(tree, (n) => ids.push(n.id));
  assert.deepEqual(ids, ['0', '1', '2', '3']);
});

test('walk handles a leaf node with no children', () => {
  const visited = [];
  walk({ id: 'x', name: 'leaf', type: 'TEXT' }, (n) => visited.push(n.id));
  assert.deepEqual(visited, ['x']);
});
