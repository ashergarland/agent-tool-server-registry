# Contributing

All catalog changes are reviewed pull requests to this repository. Edit
[`catalog.json`](catalog.json) by hand; nothing here is generated.

## What belongs here

Only broad discovery and lifecycle information: an ID, display name, short
summary, repository URL, lifecycle, and categories.

Everything else — tools, configuration, secrets, authentication, MCP and OpenAPI
interfaces, infrastructure, packages, images, security controls, and releases —
belongs in the server repository and must not be duplicated here.

## Add or update a server

1. Confirm the repository is an `ashergarland/agent-tool-server-*` repository.
   The template and this registry are not catalog entries.
2. Add an object to `servers` with:
   - `id`: the repository name, lowercase kebab-case;
   - `name`: a short display name;
   - `summary`: a factual description of the project's broad purpose, under 200
     characters;
   - `repository`: `https://github.com/ashergarland/<id>`;
   - `lifecycle`: the most conservative accurate value; and
   - `categories`: a nonempty, unique, alphabetically sorted list of lowercase
     kebab-case tags.
3. Keep `servers` sorted by `id`.
4. Run `npm run verify`.

Base the lifecycle and summary on the repository's current contents, not on
intent or older metadata.

## Deprecate a server

Set `lifecycle` to `deprecated` and add a `deprecation` object with a concrete
`reason` and, when known, a `replacement` server ID. Deprecated entries stay in
the catalog so existing references remain discoverable. Use `archived` for
historical, unmaintained repositories that are not superseded.

Only a deprecated entry may carry a `deprecation` object.

## Review standards

Reviewers verify repository ownership and naming, unique IDs and repository
URLs, sorted entries and categories, conservative and accurate lifecycle values,
factual summaries, the absence of duplicated per-server metadata, and that all
local checks pass.
