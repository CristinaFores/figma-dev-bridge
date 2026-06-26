# Privacy

Design Context Bridge runs **entirely on your machine**. It is a local relay between Figma and your AI client — it has no backend and its maintainers receive no data.

## What data is read

Depending on the mode you use, the server reads:

- **Plugin mode:** the current selection and document structure you expose from Figma desktop — layer names, text content, colors, spacing, variables, components, and prototype interactions.
- **REST API mode:** the contents of the Figma files whose URLs you provide — the same kinds of design data, for the whole file.

## Where it goes

- Design data is relayed to **the AI client you connect** (e.g. Claude Code, Cursor). That client may send it to its own model provider — review that client's privacy policy.
- In REST mode, requests go only to **`api.figma.com`** (and Figma's render CDN for asset export), authenticated with your token.
- Nothing is sent anywhere else.

## What is stored

- The plugin bridge writes the **latest design context** to a temporary file in your operating system's temp directory (`design-context-bridge-*.json`) while the server is running. This is a cache for the local bridge; it is not transmitted and can be deleted at any time.
- Your `FIGMA_ACCESS_TOKEN` is **never written to disk** and **never logged**. It is read from the environment and sent only in the `X-Figma-Token` request header.

## Your responsibility

You are responsible for **only using this tool with Figma files you have permission to access**, and for complying with your organization's policies and Figma's terms of service. Be mindful that design data passed to an AI client may leave your machine through that client.
