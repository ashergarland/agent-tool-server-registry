# Security Policy

Report vulnerabilities in this repository's schema, validator, workflows, or
catalog data through
[GitHub private vulnerability reporting](https://github.com/ashergarland/agent-tool-server-registry/security/advisories/new).
Do not include credentials or exploitable details in a public issue.

## Trust boundaries

Listing in this catalog is not a security certification, endorsement, audit, or
guarantee of availability. It records only that a repository exists and what its
broad purpose and lifecycle are.

Consumers must independently review each server's source and dependencies,
granted permissions, authentication, deployment and network exposure, data
handling, and the exact package, image, or commit they run. The server
repository is authoritative for all of that.

This repository stores no credentials, API keys, subscription or tenant
identifiers, personal contact information, or deployment-specific values.

## Validation boundary

Validation is offline. It checks that `catalog.json` matches the schema, that
IDs and repository URLs are unique and consistent, and that entries are sorted.
It never fetches remote metadata or executes code from a listed repository, and
it cannot prove that a repository behaves as its summary describes.

Catalog records can become stale after review. Pull-request review, dependency
review, secret scanning, and CodeQL provide additional repository controls.
