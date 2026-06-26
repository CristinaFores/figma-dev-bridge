import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { store, requestFromPlugin } from '../dist/figma-bridge/store.js';

const FILES = [
  'design-context-bridge-selection.json',
  'design-context-bridge-requests.json',
  'design-context-bridge-responses.json',
].map((f) => join(tmpdir(), f));

beforeEach(() => {
  for (const f of FILES) if (existsSync(f)) unlinkSync(f);
});

test('getContext returns null when nothing stored', () => {
  assert.equal(store.getContext(), null);
});

test('setContext merges partial updates without wiping document data', () => {
  // First full update (like the plugin's first send).
  store.setContext({
    selection: { nodes: [], count: 0, timestamp: 1 },
    currentPage: { id: 'p', name: 'Page 1', childCount: 2, tree: [] },
    pages: [{ id: 'p', name: 'Page 1', childCount: 2 }],
    components: [],
    timestamp: 1,
  });

  // Later selection-only update (currentPage/pages omitted).
  store.setContext({
    selection: { nodes: [{ id: 'n1' }], count: 1, timestamp: 2 },
    timestamp: 2,
  });

  const ctx = store.getContext();
  assert.equal(ctx.selection.count, 1, 'selection updated');
  assert.equal(ctx.currentPage.name, 'Page 1', 'currentPage preserved');
  assert.equal(ctx.pages.length, 1, 'pages preserved');
});

test('request queue: addRequest then takeRequests returns and clears', () => {
  store.addRequest({ id: 'r1', type: 'get_node_info', params: { id: '1:2' } });
  const first = store.takeRequests();
  assert.equal(first.length, 1);
  assert.equal(first[0].id, 'r1');
  // Queue is now empty.
  assert.deepEqual(store.takeRequests(), []);
});

test('response store: setResponse then takeResponse returns once and deletes', () => {
  store.setResponse('r1', { name: 'Button' });
  assert.deepEqual(store.takeResponse('r1'), { name: 'Button' });
  assert.equal(store.takeResponse('r1'), undefined);
});

test('requestFromPlugin resolves when a simulated plugin responds', async () => {
  // Simulated plugin: poll for the request and answer it.
  const responder = setInterval(() => {
    const reqs = store.takeRequests();
    for (const r of reqs) store.setResponse(r.id, { echoed: r.params.id });
  }, 50);

  const result = await requestFromPlugin('get_node_info', { id: 'abc' }, 3000);
  clearInterval(responder);
  assert.deepEqual(result, { echoed: 'abc' });
});

test('requestFromPlugin rejects on timeout when no plugin answers', async () => {
  await assert.rejects(
    () => requestFromPlugin('get_node_info', { id: 'x' }, 400),
    /Timeout waiting for the Figma plugin/,
  );
});
