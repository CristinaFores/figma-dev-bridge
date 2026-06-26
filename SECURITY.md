# Security Policy

## Reporting a vulnerability

Please report security issues **privately** — do not open a public GitHub issue.

- Preferred: GitHub's [private vulnerability reporting](https://github.com/CristinaFores/design-context-bridge/security/advisories/new).
- Alternatively, contact the maintainer through the email listed on the npm package page.

You'll get an acknowledgement as soon as possible. Please allow reasonable time to release a fix before any public disclosure.

## Supported versions

The latest published minor version receives security fixes.

## Security model

- The local bridge listens on **`127.0.0.1:3055` only** and must never be exposed to untrusted networks.
- `FIGMA_ACCESS_TOKEN` is read from the environment, sent only to `api.figma.com` in the `X-Figma-Token` header, and is never logged, cached, or written to disk.
- Personal access tokens are intended for **local, single-user** use. For a public, multi-user deployment, use Figma OAuth instead of a shared PAT.
- Treat your token like a password: scope it minimally, never commit it, and revoke it if it may have been exposed.
