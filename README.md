# Agent Tool Server Registry

The canonical curated catalog for independently deployable repositories in the
`ashergarland/agent-tool-server-*` family. The registry makes reviewable metadata easier to
discover and validates that metadata against a strict, versioned contract.

## What this repository is

This repository is a curated index and verification layer. It owns:

- the canonical family catalog and its JSON Schemas;
- inclusion, classification, review, and registration policy;
- deterministic generation and offline validation rules; and
- an explicit online check of source `server.json` metadata.

It is **not** the official MCP Registry, npm, Docker Hub, Docker's MCP catalog, GitHub repository
search, a package or image publisher, or a hosted MCP gateway/proxy. Inclusion does not publish,
deploy, proxy, certify, or continuously test a server.

## Architecture and ownership

1. [`agent-tool-server-template`](https://github.com/ashergarland/agent-tool-server-template)
   defines recommended implementation and metadata conventions.
2. Individual `agent-tool-server-*` repositories implement independently deployable servers.
3. Each server owns its implementation and source metadata, including `server.json`.
4. This registry owns curated inclusion, the catalog schema, validation, review policy, and the
   registration lifecycle.
5. Servers never depend on this registry at runtime.
6. Template changes do not mutate existing servers.
7. Registrations and metadata changes arrive through reviewed pull requests here.

The server repository is authoritative for implementation and `server.json`. This registry is
authoritative for catalog publication and curated classifications. Online verification reports a
mismatch rather than choosing one source silently.

## Catalog

| Server | Lifecycle | Hosting | Review |
| --- | --- | --- | --- |
| [Azure](https://github.com/ashergarland/agent-tool-server-azure) | Development | Self-hosted | Source metadata mismatch |
| [eBay](https://github.com/ashergarland/agent-tool-server-ebay) | Development | Self-hosted | Source metadata mismatch |
| [OfferUp](https://github.com/ashergarland/agent-tool-server-offerup) | Planned | Unavailable | Blocked pending implementation |

Browse [`catalog.json`](catalog.json) for the combined catalog or [`entries/`](entries/) for
reviewable source records. `catalog.json` is generated; never edit it directly.

Discovery begins with curated fields in the catalog and ends at the independently maintained
repository. Distribution links appear only after publication is verified. URL templates describe
self-hosting routes; they are not claims of a public endpoint.

## Validation

Node.js 22 or newer is required.

```bash
npm ci
npm run verify
```

Useful individual commands:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run validate
npm run catalog:generate
npm run catalog:check
npm run verify:online
```

Offline validation checks schemas, naming, uniqueness, semantic versions, URLs, hosting and
deprecation rules, mutation safety metadata, and exact generated output. Unit tests use local
fixtures and do not require GitHub.

Online verification is intentionally separate. It downloads data only, never executes remote
code. It retrieves each default branch's committed `server.json`, validates it against the
referenced HTTPS MCP schema, and compares identity, repository, version, published-package
metadata when curated, and transports. Missing metadata and content mismatches are distinguished
from network failures.

Curated claims are review-time metadata, not independently verified runtime behavior. Consumers
must inspect source, authentication, permissions, deployment, data handling, and current
distribution artifacts before use.

## Registration and lifecycle

Read [CONTRIBUTING.md](CONTRIBUTING.md), add or update one `entries/<server-id>.json`, regenerate
the catalog, and open a pull request using the registration checklist.

Lifecycle values:

- `planned`: reserved or designed, without a reviewable implementation;
- `development`: implemented but still evolving or carrying known metadata gaps;
- `active`: reviewable and intended for current use;
- `deprecated`: retained for discovery with a reason and optional replacement; and
- `archived`: preserved as historical metadata and not maintained.

Security limitations and reporting instructions are in [SECURITY.md](SECURITY.md).
