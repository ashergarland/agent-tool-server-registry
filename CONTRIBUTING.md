# Contributing

All registrations and metadata changes are reviewed pull requests to this repository.

## Prerequisites

A registrable server:

- is an `ashergarland/agent-tool-server-<provider>` repository;
- is independently deployable and does not depend on this registry at runtime;
- owns an accurate root `server.json` following current official MCP metadata conventions;
- documents tools, transports, authentication, configuration, safety controls, and lifecycle;
- has no credentials, personal contact details, or deployment-specific identifiers in metadata;
- distinguishes source declarations from actually published packages, images, and registrations.

A planned or blocked record may document an incomplete repository honestly. It must not claim
capabilities, distributions, transports, or hosting that do not exist.

## Add an entry

1. Copy the shape of an existing record into `entries/agent-tool-server-<provider>.json`.
2. Use only evidence from the server repository or a verifiable distribution.
3. Omit unpublished distribution channels. Use `unavailable`, `planned`, or `not-documented`
   rather than guessing.
4. Record required configuration names and whether they are secrets, never their values.
5. Classify every tool's behavior, consequence, safety, and availability.
6. For mutation tools, document that mutations default off and require explicit confirmation.
7. Run `npm run catalog:generate` and `npm run verify`.
8. Run `npm run verify:online` when the source repository contains `server.json`.

The entry filename must exactly match its ID. Deterministic generation sorts servers, tags,
categories, authentication methods, configuration variables, and tools.

## Update or deprecate an entry

Update an entry whenever the source version, interface, capability, publication, or review status
changes. Verify publication before adding an npm, container, official MCP Registry, or Docker MCP
catalog record. A hosted endpoint must be stable and intentionally documented.

Set lifecycle to `deprecated` and add a concrete `deprecation.reason`. Add `replacement` only when
the replacement ID is known. Deprecated entries remain in the catalog so existing references are
discoverable. Use `archived` for historical, unmaintained records that are not superseded.

## Review standards

Reviewers verify:

- repository ownership and naming;
- schema validity and source evidence;
- unique IDs, repository URLs, and tool names;
- safety classification and guardrails for mutations;
- authentication and secret-handling descriptions;
- actual distribution and hosting status;
- absence of secrets, personal information, and deployment identifiers;
- deterministic generated output and all local checks.

Changing one source entry produces diagnostics containing its filename and server ID where
available.

## Resolving metadata conflicts

The server repository is authoritative for implementation and source `server.json`. This registry
is authoritative for curated inclusion, classification, and catalog publication. A mismatch fails
online verification and must be resolved explicitly by correcting the source metadata, correcting
the curated entry with evidence, or retaining a documented blocked/mismatch state while the
upstream change is pending. Never silently merge conflicting values.

## Versions and releases

The entry and catalog schema use semantic versions:

- patch: clarification or validation fixes that preserve accepted documents;
- minor: backward-compatible optional fields or enum expansion;
- major: required fields, removals, changed meaning, or other breaking validation changes.

`catalogVersion` is this repository package/release version. It describes the catalog publication,
not any server version. A server's `version` remains independently owned by that server.

`catalog.json` is deterministically generated from `entries/` and committed with every change.
Repository releases are tagged `v<catalogVersion>`. Backward-compatible catalog corrections
increment patch; additive catalog/schema features increment minor; breaking schema changes
increment major. Deprecations remain present in subsequent releases.

Template releases do not alter registered servers automatically. Updating a server entry always
requires a reviewed registry pull request.
