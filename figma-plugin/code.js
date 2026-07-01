"use strict";
figma.showUI(__html__, { width: 280, height: 360, title: 'Frontend Handoff Snapshot' });
// ── helpers ───────────────────────────────────────────────────────────────────
function toHex(n) {
    var h = Math.round(n * 255).toString(16);
    return h.length === 1 ? '0' + h : h;
}
function rgbToHex(c) {
    return '#' + toHex(c.r) + toHex(c.g) + toHex(c.b);
}
function extractFills(fills) {
    if (!Array.isArray(fills))
        return [];
    return fills
        .filter(function (f) { return f.visible !== false; })
        .map(function (f) {
        if (f.type === 'SOLID')
            return { type: 'SOLID', color: rgbToHex(f.color), opacity: f.opacity !== undefined ? f.opacity : 1 };
        return { type: f.type, opacity: 1 };
    });
}
function extractNode(node) {
    var text = node.type === 'TEXT' ? node : null;
    return {
        id: node.id, name: node.name, type: node.type,
        x: 'x' in node ? node.x : 0,
        y: 'y' in node ? node.y : 0,
        width: 'width' in node ? node.width : 0,
        height: 'height' in node ? node.height : 0,
        visible: node.visible,
        opacity: 'opacity' in node ? node.opacity : 1,
        fills: 'fills' in node ? extractFills(node.fills) : [],
        strokes: 'strokes' in node ? extractFills(node.strokes) : [],
        characters: text ? text.characters : undefined,
        fontSize: text ? (text.fontSize === figma.mixed ? 'mixed' : text.fontSize) : undefined,
        fontFamily: text ? (text.fontName === figma.mixed ? 'mixed' : text.fontName.family) : undefined,
    };
}
// Limited depth to avoid hanging on large documents
function collectColors(node, map, depth) {
    if (depth < 0)
        return;
    if ('fills' in node) {
        extractFills(node.fills).forEach(function (f) {
            if (f.type === 'SOLID' && f.color) {
                if (!map[f.color])
                    map[f.color] = { opacity: f.opacity, usedBy: [] };
                if (map[f.color].usedBy.indexOf(node.name) === -1)
                    map[f.color].usedBy.push(node.name);
            }
        });
    }
    if ('children' in node && depth > 0) {
        node.children.forEach(function (c) { collectColors(c, map, depth - 1); });
    }
}
function collectTexts(node, out, depth) {
    if (depth < 0)
        return;
    if (node.type === 'TEXT') {
        var t = node;
        out.push({ id: t.id, name: t.name, characters: t.characters,
            fontSize: t.fontSize === figma.mixed ? 'mixed' : t.fontSize,
            fontFamily: t.fontName === figma.mixed ? 'mixed' : t.fontName.family });
    }
    if ('children' in node && depth > 0) {
        node.children.forEach(function (c) { collectTexts(c, out, depth - 1); });
    }
}
// Spacing from auto-layout nodes, with bound variable (token) names resolved.
var varNameCache = {};
function bvId(bound) {
    return bound && bound.type === 'VARIABLE_ALIAS' ? bound.id : null;
}
async function resolveVarName(id) {
    if (varNameCache[id])
        return varNameCache[id];
    try {
        var v = await figma.variables.getVariableByIdAsync(id);
        varNameCache[id] = v ? v.name : id;
    }
    catch (_e) {
        varNameCache[id] = id;
    }
    return varNameCache[id];
}
async function collectSpacing(node, out, depth) {
    if (depth < 0)
        return;
    if ('layoutMode' in node && node.layoutMode !== 'NONE') {
        var f = node;
        var bv = f.boundVariables || {};
        var tokens = {};
        var pairs = [
            ['itemSpacing', bv.itemSpacing], ['paddingLeft', bv.paddingLeft], ['paddingRight', bv.paddingRight],
            ['paddingTop', bv.paddingTop], ['paddingBottom', bv.paddingBottom],
        ];
        for (var i = 0; i < pairs.length; i++) {
            var id = bvId(pairs[i][1]);
            if (id)
                tokens[pairs[i][0]] = await resolveVarName(id);
        }
        out.push({
            name: f.name, layoutMode: f.layoutMode,
            itemSpacing: f.itemSpacing,
            padding: { top: f.paddingTop, right: f.paddingRight, bottom: f.paddingBottom, left: f.paddingLeft },
            tokens: tokens,
        });
    }
    if ('children' in node && depth > 0) {
        var kids = node.children;
        for (var j = 0; j < kids.length; j++)
            await collectSpacing(kids[j], out, depth - 1);
    }
}
// Shallow page tree — only top-level frames (depth 1)
function shallowTree(page) {
    return page.children.map(function (node) {
        return {
            id: node.id, name: node.name, type: node.type,
            fills: 'fills' in node ? extractFills(node.fills) : [],
            childCount: 'children' in node ? node.children.length : 0,
        };
    });
}
function extractComponents(page) {
    var results = [];
    var found = 0;
    function walk(node) {
        if (found >= 300)
            return;
        if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
            results.push({ id: node.id, name: node.name, type: node.type,
                description: 'description' in node ? node.description : '' });
            found++;
        }
        if ('children' in node)
            node.children.forEach(walk);
    }
    walk(page);
    return results;
}
// Prototype interactions / animations (node.reactions).
function mapTransition(t) {
    if (!t)
        return null;
    return {
        type: t.type, // SMART_ANIMATE | DISSOLVE | MOVE_IN | PUSH | SLIDE_IN ...
        duration: t.duration, // seconds
        easing: t.easing ? t.easing.type : undefined, // EASE_IN | EASE_OUT | LINEAR | GENTLE | BOUNCY ...
    };
}
function mapAction(a) {
    return {
        type: a.type, // NODE | URL | BACK | CLOSE | SCROLL_TO | SET_VARIABLE ...
        navigation: a.navigation, // NAVIGATE | SWAP | OVERLAY | SCROLL_TO ...
        destinationId: a.destinationId,
        transition: mapTransition(a.transition),
        preserveScrollPosition: a.preserveScrollPosition,
    };
}
function mapReaction(r) {
    var actions = r.actions ? r.actions : (r.action ? [r.action] : []);
    return {
        trigger: r.trigger ? { type: r.trigger.type, timeout: r.trigger.timeout, delay: r.trigger.delay } : null,
        actions: actions.map(mapAction),
    };
}
function collectInteractions(node, out, depth) {
    if (depth < 0)
        return;
    var reactions = node.reactions;
    if (reactions && reactions.length > 0) {
        out.push({ id: node.id, name: node.name, type: node.type, reactions: reactions.map(mapReaction) });
    }
    if ('children' in node && depth > 0) {
        node.children.forEach(function (c) { collectInteractions(c, out, depth - 1); });
    }
}
// ── variables (design tokens) ──────────────────────────────────────────────────
function resolveVarValue(type, raw) {
    if (raw && raw.type === 'VARIABLE_ALIAS')
        return { alias: raw.id };
    if (type === 'COLOR' && raw && typeof raw.r === 'number') {
        var hex = rgbToHex(raw);
        return raw.a !== undefined && raw.a < 1 ? { hex: hex, opacity: raw.a } : { hex: hex };
    }
    return raw; // FLOAT (spacing/radius), STRING, BOOLEAN
}
async function extractVariables() {
    if (!figma.variables)
        return [];
    var collections = await figma.variables.getLocalVariableCollectionsAsync();
    var vars = await figma.variables.getLocalVariablesAsync();
    var byId = {};
    collections.forEach(function (c) { byId[c.id] = c; });
    return vars.map(function (v) {
        var col = byId[v.variableCollectionId];
        var modes = {};
        if (col) {
            col.modes.forEach(function (m) {
                modes[m.name] = resolveVarValue(v.resolvedType, v.valuesByMode[m.modeId]);
            });
        }
        return {
            id: v.id,
            name: v.name,
            type: v.resolvedType,
            collection: col ? col.name : '',
            valuesByMode: modes,
        };
    });
}
// ── inspect broadcast (no network — always runs on selection change) ───────────
async function broadcastInspect() {
    var selected = figma.currentPage.selection;
    var colorMap = {};
    var texts = [];
    var spacing = [];
    selected.forEach(function (n) { collectColors(n, colorMap, 4); });
    selected.forEach(function (n) { collectTexts(n, texts, 4); });
    for (var i = 0; i < selected.length; i++)
        await collectSpacing(selected[i], spacing, 4);
    var colors = Object.keys(colorMap).map(function (hex) {
        return { hex: hex, opacity: colorMap[hex].opacity };
    });
    figma.ui.postMessage({ type: 'inspect', count: selected.length, colors: colors, texts: texts, spacing: spacing });
}
// ── export to local handoff tool (optional, user-initiated) ───────────────────
// Nothing is sent to the local handoff tool until the user presses "Export" in
// the UI. This avoids any background network activity without a visible,
// user-initiated action — only localhost:3055 is ever contacted.
var retryTimer = null;
var connected = false;
var pageContextSent = false;
var syncEnabled = false;
var pagesLoaded = false;
async function sendContext() {
    if (!syncEnabled)
        return;
    try {
        // dynamic-page mode: other pages' children throw unless loaded first
        if (!pagesLoaded) {
            await figma.loadAllPagesAsync();
            pagesLoaded = true;
        }
        var page = figma.currentPage;
        var selected = page.selection;
        var colorMap = {};
        var texts = [];
        var spacing = [];
        selected.forEach(function (n) { collectColors(n, colorMap, 4); });
        selected.forEach(function (n) { collectTexts(n, texts, 4); });
        for (var s = 0; s < selected.length; s++)
            await collectSpacing(selected[s], spacing, 4);
        var interactions = [];
        selected.forEach(function (n) { collectInteractions(n, interactions, 4); });
        var selectedColors = Object.keys(colorMap).map(function (hex) {
            return { hex: hex, opacity: colorMap[hex].opacity, usedBy: colorMap[hex].usedBy };
        });
        var variables = pageContextSent ? undefined : await extractVariables();
        var payload = {
            selection: { nodes: selected.map(extractNode), count: selected.length, timestamp: Date.now() },
            selectedColors: selectedColors,
            selectedTexts: texts,
            selectedSpacing: spacing,
            selectedInteractions: interactions,
            // Only send page tree and components once to avoid hanging
            currentPage: pageContextSent ? undefined : {
                id: page.id, name: page.name, childCount: page.children.length,
                tree: shallowTree(page),
            },
            pages: pageContextSent ? undefined : figma.root.children.map(function (p) {
                return { id: p.id, name: p.name, childCount: p.children.length };
            }),
            components: pageContextSent ? undefined : extractComponents(page),
            variables: variables,
            timestamp: Date.now(),
        };
        var response = await fetch('http://localhost:3055/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        connected = response.ok;
        if (connected)
            pageContextSent = true;
        figma.ui.postMessage({ type: 'status', syncEnabled: syncEnabled, connected: connected, count: selected.length });
    }
    catch (_e) {
        connected = false;
        figma.ui.postMessage({ type: 'status', syncEnabled: syncEnabled, connected: false, count: figma.currentPage.selection.length });
    }
    if (retryTimer !== null)
        clearTimeout(retryTimer);
    if (!syncEnabled)
        return;
    retryTimer = setTimeout(function () {
        retryTimer = null;
        sendContext();
    }, connected ? 10000 : 3000);
}
figma.on('selectionchange', function () {
    broadcastInspect();
    if (!syncEnabled)
        return;
    if (retryTimer !== null) {
        clearTimeout(retryTimer);
        retryTimer = null;
    }
    sendContext();
});
// When the user switches pages the cached currentPage/components/variables
// become stale. Reset the flag so the next sendContext does a full resend.
figma.on('currentpagechange', function () {
    pageContextSent = false;
    if (!syncEnabled)
        return;
    if (retryTimer !== null) {
        clearTimeout(retryTimer);
        retryTimer = null;
    }
    sendContext();
});
// ── on-demand request handling (navigate the whole document by id) ─────────────
function extractNodeDeep(node, depth) {
    var base = extractNode(node);
    if ('reactions' in node) {
        var r = node.reactions;
        if (r && r.length > 0)
            base.reactions = r.map(mapReaction);
    }
    if ('layoutMode' in node && node.layoutMode !== 'NONE') {
        var f = node;
        base.layout = {
            layoutMode: f.layoutMode, itemSpacing: f.itemSpacing,
            padding: { top: f.paddingTop, right: f.paddingRight, bottom: f.paddingBottom, left: f.paddingLeft },
        };
    }
    if ('children' in node) {
        if (depth > 0) {
            base.children = node.children.map(function (c) { return extractNodeDeep(c, depth - 1); });
        }
        else {
            base.childCount = node.children.length;
        }
    }
    return base;
}
function safeExtractDeep(node, depth) {
    // PageNode and DocumentNode are not SceneNodes but are valid navigation targets.
    if (node.type === 'PAGE' || node.type === 'DOCUMENT') {
        var base = { id: node.id, name: node.name, type: node.type };
        if ('children' in node && depth > 0) {
            base.children = node.children.map(function (c) { return safeExtractDeep(c, depth - 1); });
        }
        else if ('children' in node) {
            base.childCount = node.children.length;
        }
        return base;
    }
    return extractNodeDeep(node, depth);
}
async function handleRequest(type, params) {
    if (type === 'get_node_info') {
        var node = await figma.getNodeByIdAsync(params.id);
        if (!node)
            return { error: 'Node not found: ' + params.id };
        return safeExtractDeep(node, params.depth != null ? params.depth : 2);
    }
    if (type === 'get_nodes_info') {
        var out = [];
        var ids = params.ids || [];
        for (var i = 0; i < ids.length; i++) {
            var n = await figma.getNodeByIdAsync(ids[i]);
            out.push(n ? safeExtractDeep(n, params.depth != null ? params.depth : 1) : { id: ids[i], error: 'not found' });
        }
        return out;
    }
    if (type === 'scan_nodes_by_types') {
        var root = params.rootId ? await figma.getNodeByIdAsync(params.rootId) : figma.currentPage;
        if (!root)
            return { error: 'Root not found: ' + params.rootId };
        var types = params.types || [];
        var results = [];
        var cap = 1000;
        (function walk(nd) {
            if (results.length >= cap)
                return;
            if (types.indexOf(nd.type) !== -1)
                results.push({ id: nd.id, name: nd.name, type: nd.type });
            if ('children' in nd)
                nd.children.forEach(walk);
        })(root);
        return { count: results.length, capped: results.length >= cap, nodes: results };
    }
    return { error: 'Unknown request type: ' + type };
}
var pollTimer = null;
async function pollRequests() {
    if (!syncEnabled)
        return;
    try {
        var resp = await fetch('http://localhost:3055/requests');
        if (resp.ok) {
            var reqs = await resp.json();
            for (var i = 0; i < reqs.length; i++) {
                var r = reqs[i];
                var result;
                try {
                    result = await handleRequest(r.type, r.params || {});
                }
                catch (e) {
                    result = { error: String(e) };
                }
                await fetch('http://localhost:3055/response', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: r.id, result: result }),
                });
            }
        }
    }
    catch (_e) { /* local tool not running, retry next tick */ }
    if (pollTimer !== null)
        clearTimeout(pollTimer);
    if (!syncEnabled)
        return;
    pollTimer = setTimeout(pollRequests, 1200);
}
// The user controls sync from the UI: "Connect" / "Sync selection" starts
// it, "Pause" stops it. Nothing runs automatically on plugin load.
figma.ui.onmessage = function (msg) {
    if (!msg || typeof msg.type !== 'string')
        return;
    if (msg.type === 'connect' || msg.type === 'sync') {
        syncEnabled = true;
        sendContext();
        pollRequests();
    }
    else if (msg.type === 'pause') {
        syncEnabled = false;
        connected = false;
        if (retryTimer !== null) {
            clearTimeout(retryTimer);
            retryTimer = null;
        }
        if (pollTimer !== null) {
            clearTimeout(pollTimer);
            pollTimer = null;
        }
        figma.ui.postMessage({ type: 'status', syncEnabled: false, connected: false, count: figma.currentPage.selection.length });
    }
};
broadcastInspect();
figma.ui.postMessage({ type: 'status', syncEnabled: syncEnabled, connected: false, count: figma.currentPage.selection.length });
