import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { loadEntries } from "./catalog.js";
import type { ServerEntry } from "./types.js";

interface McpPackage {
  registryType?: string;
  identifier?: string;
  version?: string;
  transport?: { type?: string };
}

interface McpMetadata {
  $schema?: string;
  name?: string;
  repository?: { url?: string };
  version?: string;
  packages?: McpPackage[];
  remotes?: Array<{ type?: string }>;
}

export interface OnlineResult {
  id: string;
  status: "ok" | "mismatch" | "network-error";
  messages: string[];
}

export function compareMetadata(entry: ServerEntry, metadata: McpMetadata): string[] {
  const messages: string[] = [];
  const expectedName = `io.github.ashergarland/${entry.id}`;
  if (metadata.name !== expectedName) {
    messages.push(`name: expected ${expectedName}, received ${String(metadata.name)}`);
  }
  if (metadata.repository?.url?.replace(/\.git$/, "") !== entry.repository) {
    messages.push(
      `repository: expected ${entry.repository}, received ${String(metadata.repository?.url)}`,
    );
  }
  if (entry.version !== undefined && metadata.version !== entry.version) {
    messages.push(`version: expected ${entry.version}, received ${String(metadata.version)}`);
  }

  const npmPackage = metadata.packages?.find((item) => item.registryType === "npm");
  if (entry.distribution?.npm !== undefined) {
    if (npmPackage?.identifier !== entry.distribution.npm.package) {
      messages.push("npm package identifier differs from the curated published package");
    }
    if (npmPackage?.version !== entry.distribution.npm.version) {
      messages.push("npm package version differs from the curated published package");
    }
  }

  const sourceTransports = new Set<string>();
  for (const item of metadata.packages ?? []) {
    if (item.transport?.type !== undefined) sourceTransports.add(item.transport.type);
  }
  for (const remote of metadata.remotes ?? []) {
    if (remote.type !== undefined) sourceTransports.add(remote.type);
  }
  for (const transport of sourceTransports) {
    if (!entry.interfaces.transports.includes(transport)) {
      messages.push(`transport ${transport} is declared upstream but absent from the entry`);
    }
  }
  return messages;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { accept: "application/json", "user-agent": "agent-tool-server-registry" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<unknown>;
}

export async function verifyEntryOnline(entry: ServerEntry): Promise<OnlineResult> {
  const metadataUrl = `${entry.repository.replace("github.com", "raw.githubusercontent.com")}/main/server.json`;
  let metadata: McpMetadata;
  try {
    metadata = (await fetchJson(metadataUrl)) as McpMetadata;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const missing = message.startsWith("HTTP 404");
    return {
      id: entry.id,
      status: missing ? "mismatch" : "network-error",
      messages: [missing ? `committed server.json is missing at ${metadataUrl}` : message],
    };
  }

  const messages: string[] = [];
  if (metadata.$schema === undefined || !metadata.$schema.startsWith("https://")) {
    messages.push("server.json must reference an HTTPS official MCP schema");
  } else {
    try {
      const schema = await fetchJson(metadata.$schema);
      const ajv = new Ajv2020({ allErrors: true, strict: false });
      addFormats(ajv);
      const validate = ajv.compile(schema);
      if (!validate(metadata)) {
        messages.push(
          `official MCP schema: ${(validate.errors ?? [])
            .map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`)
            .join("; ")}`,
        );
      }
    } catch (error) {
      return {
        id: entry.id,
        status: "network-error",
        messages: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  messages.push(...compareMetadata(entry, metadata));
  return { id: entry.id, status: messages.length === 0 ? "ok" : "mismatch", messages };
}

export async function verifyOnline(root: string): Promise<OnlineResult[]> {
  const loaded = await loadEntries(root);
  return Promise.all(loaded.map(({ entry }) => verifyEntryOnline(entry)));
}
