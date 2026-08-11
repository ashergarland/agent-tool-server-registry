export const schemaVersion = "1.0.0";

export interface ServerEntry {
  schemaVersion: string;
  id: string;
  name: string;
  description: string;
  version?: string;
  lifecycle: "planned" | "development" | "active" | "deprecated" | "archived";
  repository: string;
  license: string;
  maintainer: string;
  categories: string[];
  tags: string[];
  distribution?: {
    npm?: { package: string; version: string; url: string };
    container?: { image: string; immutableReference: string; url: string };
    officialMcpRegistry?: { identifier: string; url: string };
    dockerMcpCatalog?: { identifier: string; url: string };
  };
  interfaces: {
    transports: string[];
    hosting: "self-hosted" | "hosted" | "planned" | "unavailable";
    endpoints?: {
      remoteMcpUrlTemplate?: string;
      openApiUrlTemplate?: string;
      healthUrlTemplate?: string;
    };
    authentication: string[];
    requiredConfiguration: Array<{
      name: string;
      required: boolean;
      secret: boolean;
      description: string;
    }>;
  };
  capabilities: {
    tools: Array<{
      name: string;
      summary: string;
      safety: "low" | "moderate" | "high";
      behavior: "read-only" | "mutation";
      consequential: boolean;
      availability: "available" | "planned" | "blocked" | "unavailable";
      notes?: string;
    }>;
  };
  operations: {
    leastPrivilege: boolean | "not-documented";
    scopeAllowLists: boolean | "not-documented";
    mutationsDisabledByDefault: boolean | "not-documented";
    explicitMutationConfirmation: boolean | "not-documented";
    dryRun: boolean | "not-documented";
    auditLogging: boolean | "not-documented";
    credentialPersistence: "none" | "memory-only" | "external-store" | "not-documented";
    inputValidation: boolean | "not-documented";
    outputValidation: boolean | "not-documented";
    rateLimiting: boolean | "not-documented";
    healthMonitoring: boolean | "not-documented";
  };
  provenance: {
    sourceMetadata: {
      kind: "server-json" | "readme" | "repository";
      location: string;
    };
    lastVerifiedCommit?: string;
    reviewStatus: "pending" | "reviewed" | "mismatch" | "blocked";
    notes?: string[];
  };
  deprecation?: {
    reason: string;
    replacement?: string;
  };
}

export interface Catalog {
  schemaVersion: string;
  catalogVersion: string;
  entries: ServerEntry[];
}

export interface ValidationIssue {
  source: string;
  message: string;
}
