# Tools reference

Every tool runs in one of two modes:

- **Plugin mode** (default) — reads from the live Figma plugin bridge. No `url` argument.
- **REST mode** — pass a `url` argument and the tool reads the same data over the Figma REST API. Requires `FIGMA_ACCESS_TOKEN` ([setup](rest-api.md)). No plugin, no Figma desktop needed.

Selection tools are plugin-only (they describe live state). Everything else supports **both modes** — same tool, same shape, two transports.

---

## Selection tools · plugin only

The plugin pushes these automatically when you select something in Figma. No arguments needed.

| Tool | Returns |
|------|---------|
| `get_current_selection` | Selected nodes with fills, position, size, and text content |
| `get_selected_colors` | Unique hex colors from the selection and all its descendants |
| `get_selected_texts` | Text nodes with content, font family, and font size |
| `get_selected_spacing` | Auto-layout gap and padding, including the name of any bound spacing token |
| `get_selected_interactions` | Prototype reactions: trigger, action, destination, transition, duration, easing |

---

## Document & navigation tools · plugin or REST

Each accepts an optional `url`. Without it, reads from the plugin; with it, reads over REST.

| Tool | Arguments | Returns |
|------|-----------|---------|
| `get_all_pages` | `url?` | All pages with id, name, and child count |
| `get_current_page` | `url?` | Current page and its top-level frames. In REST mode: the page containing the URL's node-id, or the first page |
| `get_frame_by_name` | `name`, `url?` | Frame or layer by name (case-insensitive partial match) |
| `get_component_definitions` | `url?` | All components and component sets. REST mode scans the whole file; plugin mode the current page |
| `get_variables` | `type?`, `url?` | Local design tokens by collection and mode. Filter: `COLOR` · `FLOAT` · `STRING` · `BOOLEAN`. **REST mode is Enterprise-only** — use `extract_design_system` otherwise |
| `get_node_info` | `id?`, `depth?`, `url?` | A node and its children up to `depth` (default 2). In REST mode the id can come from the URL's `node-id` |
| `get_nodes_info` | `ids[]`, `depth?`, `url?` | Multiple nodes by id in one call |
| `scan_nodes_by_types` | `types[]`, `rootId?`, `url?` | Every node whose type matches, capped at 1000. Types: `TEXT` `INSTANCE` `FRAME` `COMPONENT` `RECTANGLE` `VECTOR`… |

**Navigation pattern (works in either mode):**

```
get_all_pages { url }                                 # page ids
get_node_info { url, id: "12:34", depth: 2 }          # drill into a frame
scan_nodes_by_types { url, types: ["INSTANCE"] }      # find all instances
get_node_info { url, id: "..." }                      # inspect one
```

---

## Analysis tools · REST only

These read the whole file and reason about it like a developer planning the build.

| Tool | Arguments | Returns |
|------|-----------|---------|
| `extract_design_system` | `url`, `id?` | Colors (with usage counts), type scale, spacing scale, border radii and shadows — derived from the design even when no Figma Variables exist. Add a node-id to scope it to one frame |
| `analyze_structure` | `url` | Pages and screens, suggested app routes from screen names, component inventory, and most-used instances. Answers "what routes would this app have?" and "how do we split the work?" |
| `get_component_variants` | `url`, `id?` | A component set's property definitions and every variant's values (e.g. `State=Hover`), so you can recreate all states faithfully |

---

## Asset tools · REST only

Build an `assets/` or `icons/` folder from a design.

| Tool | Arguments | Returns |
|------|-----------|---------|
| `find_assets` | `url` | Export-worthy nodes (export settings, vectors, icon/logo-named layers) with ids and suggested filenames |
| `export_image` | `url`, `ids?`, `format?`, `scale?` | SVG source inlined (ready to write to a file), or a render URL for `png`/`jpg`. `format`: `svg` (default) · `png` · `jpg` |

**Asset export pattern:**

```
find_assets { url }                              # discover icons/vectors
export_image { url, ids: [...], format: "svg" }  # get the SVG source for each
# → write each asset.svg to your assets/ folder
```

---

## File entry points · REST only

Convenience tools when you start from a raw URL.

| Tool | Arguments | Returns |
|------|-----------|---------|
| `get_file_from_url` | `url` | The node for the URL's `node-id` if present, otherwise the file overview (pages, frames, metadata) |
| `get_node_from_url` | `url`, `node_id?` | A specific node from a URL |
