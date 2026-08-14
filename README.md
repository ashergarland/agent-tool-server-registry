# Agent Tool Server Registry

A small, static catalog of Asher Garland's `agent-tool-server-*` source
repositories. It exists so the family is discoverable in one place.

## What this repository is

This repository is deliberately simple. It contains one handwritten
[`catalog.json`](catalog.json), a JSON Schema for that file, and a validator.

It is **not** a hosted registry, marketplace, control plane, deployment tracker,
runtime dependency, or comprehensive mirror of each server's metadata. Inclusion
does not publish, deploy, proxy, certify, or test a server.

Each server repository remains authoritative for its tools and capabilities,
configuration and secrets, authentication and permissions, MCP and OpenAPI
interfaces, infrastructure and deployment, packages and container images,
security controls, and releases. This catalog carries only broad discovery and
lifecycle information.

## Catalog

| Server                                                                                   | Lifecycle   |
| ---------------------------------------------------------------------------------------- | ----------- |
| [AST Summarizer](https://github.com/ashergarland/agent-tool-server-ast-summarizer)       | Development |
| [Azure](https://github.com/ashergarland/agent-tool-server-azure)                         | Development |
| [Data Cruncher](https://github.com/ashergarland/agent-tool-server-data-cruncher)         | Development |
| [Doc RAG](https://github.com/ashergarland/agent-tool-server-doc-rag)                     | Development |
| [eBay](https://github.com/ashergarland/agent-tool-server-ebay)                           | Development |
| [Game Prices](https://github.com/ashergarland/agent-tool-server-game-prices)             | Development |
| [Git Optimizer](https://github.com/ashergarland/agent-tool-server-git-optimizer)         | Development |
| [Music Marketplace](https://github.com/ashergarland/agent-tool-server-music-marketplace) | Development |
| [OfferUp](https://github.com/ashergarland/agent-tool-server-offerup)                     | Scaffold    |
| [Shopping](https://github.com/ashergarland/agent-tool-server-shopping)                   | Development |
| [Vision](https://github.com/ashergarland/agent-tool-server-vision)                       | Development |

See [`catalog.json`](catalog.json) for summaries and categories.

## Entry shape

Every entry records an ID, display name, short summary, repository URL,
lifecycle, and categories. A `deprecated` entry also records a deprecation
reason and an optional replacement server ID.

Lifecycle values:

- `scaffold`: the repository exists but lacks a usable domain implementation;
- `development`: an initial or evolving domain implementation exists;
- `active`: usable, intentionally maintained, and ready for current use;
- `deprecated`: retained but superseded or discouraged; and
- `archived`: historical and unmaintained.

Lifecycle is a conservative statement about the source repository, not a
guarantee about any deployment.

## Validation

Node.js 22 or newer is required.

```bash
npm ci
npm run verify
```

`npm run verify` checks formatting and runs
[`scripts/validate.mjs`](scripts/validate.mjs), which validates `catalog.json`
against [`schema/catalog.schema.json`](schema/catalog.schema.json) and checks
that server IDs and repository URLs are unique, entries are sorted by ID, and
each repository URL matches its ID under `ashergarland`.

Validation is entirely offline. It never contacts GitHub or any server.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Security reporting and limitations are
in [SECURITY.md](SECURITY.md).
