# Security Policy

Report vulnerabilities in registry schemas, validators, workflows, or metadata
handling through
[GitHub private vulnerability reporting](https://github.com/ashergarland/agent-tool-server-registry/security/advisories/new).
Do not include credentials or exploitable details in a public issue.

## Trust boundaries

Registry inclusion is not a security certification, endorsement, package
signature, runtime audit, or guarantee of availability. Consumers must
independently review:

- server source and dependency integrity;
- granted permissions and least-privilege scopes;
- inbound and provider authentication;
- deployment and network exposure;
- data collection, storage, logging, and retention; and
- the exact package, image, or commit they execute.

The registry stores no credentials, API keys, subscription or tenant IDs,
personal contact information, or deployment-specific secrets. Configuration
records contain variable names and descriptions only.

## Threat model and validation boundary

Untrusted contributions may contain malicious metadata, deceptive links, stale
claims, or references to compromised packages and images. Schemas reject unknown
fields and malformed values; custom validation checks naming, uniqueness,
consistency, safety metadata, and generated output. Pull-request review,
dependency review, secret scanning, and CodeQL provide additional repository
controls.

Online verification downloads JSON from expected HTTPS locations and never
executes code from a registered repository. It checks source metadata structure
and selected consistency claims. It does not prove that a URL is controlled
safely, a package or image is uncompromised, a server behaves as described, or a
runtime is securely deployed. Records can become stale after review, and
external registries can change independently.

Report a compromised linked artifact to its publisher and ecosystem as well as
notifying this registry so the affected record can be blocked, deprecated, or
corrected.
