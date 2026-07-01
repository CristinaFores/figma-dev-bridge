# Figma Community listing copy

Ready-to-paste copy for the Figma Community submission form. Keep this wording out of the manifest/UI too — none of it should mention MCP, AI agents, or specific AI tools as the primary positioning.

## Name

Frontend Handoff Snapshot

## Description

Frontend Handoff Snapshot helps developers export selected Figma design information to a local handoff tool running on their own machine.

It captures useful implementation details such as selected layers, colors, text styles, spacing, layout information, variables, and prototype interaction notes. The plugin is designed for frontend documentation, component review, and implementation handoff workflows.

The plugin only sends data to localhost and does not modify the Figma file.

## Notes for the reviewer (if there's a free-text field)

This plugin only communicates with a local server on the user's own machine (`http://localhost:3055`), started and controlled by the user. No data leaves the user's device. Sync is off by default — the user must press "Sync selection" in the plugin UI before any data is exported, and can pause it at any time. The plugin does not read or write to any third-party or remote service, and does not modify the Figma file.
