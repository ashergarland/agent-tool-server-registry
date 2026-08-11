import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { loadEntries } from "../src/catalog.js";
import { projectRoot } from "../src/paths.js";
import type { ServerEntry } from "../src/types.js";
import {
  validateConsistency,
  validateEntryDocument,
  validateRegistry,
} from "../src/validation.js";

async function azureEntry(): Promise<ServerEntry> {
  return JSON.parse(
    await readFile(
      join(projectRoot, "entries/agent-tool-server-azure.json"),
      "utf8",
    ),
  ) as ServerEntry;
}

function loaded(entry: ServerEntry, filename = `${entry.id}.json`) {
  return [{ filename, entry }];
}

describe("entry schema and consistency", () => {
  it("accepts every committed entry and the generated catalog", async () => {
    expect(await validateRegistry(projectRoot, false)).toEqual([]);
  });

  it("rejects unsupported schema versions", async () => {
    const entry = { ...(await azureEntry()), schemaVersion: "2.0.0" };
    expect(await validateEntryDocument(projectRoot, entry)).not.toEqual([]);
  });

  it("rejects unsupported authentication and transport values", async () => {
    const original = await azureEntry();
    const entry = {
      ...original,
      interfaces: {
        ...original.interfaces,
        authentication: ["password"],
        transports: ["websocket"],
      },
    };
    expect(await validateEntryDocument(projectRoot, entry)).not.toEqual([]);
  });

  it("rejects invalid URL templates", async () => {
    const original = await azureEntry();
    const entry = {
      ...original,
      interfaces: {
        ...original.interfaces,
        endpoints: { healthUrlTemplate: "http://localhost/health" },
      },
    };
    expect(await validateEntryDocument(projectRoot, entry)).not.toEqual([]);
  });

  it("rejects invalid names and semantic versions", async () => {
    const entry = {
      ...(await azureEntry()),
      id: "azure",
      version: "version-one",
    };
    expect(await validateEntryDocument(projectRoot, entry)).not.toEqual([]);
    expect(validateConsistency(loaded(entry, "azure.json"))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "invalid semantic version: version-one",
        }),
      ]),
    );
  });

  it("detects duplicate IDs and repository URLs", async () => {
    const entry = await azureEntry();
    const issues = validateConsistency([
      ...loaded(entry),
      { filename: "copy.json", entry: structuredClone(entry) },
    ]);
    expect(issues.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        `duplicate server ID: ${entry.id}`,
        `duplicate repository URL: ${entry.repository}`,
      ]),
    );
  });

  it("detects duplicate tool names", async () => {
    const entry = await azureEntry();
    entry.capabilities.tools.push(
      structuredClone(entry.capabilities.tools[0]!),
    );
    expect(validateConsistency(loaded(entry))[0]?.message).toContain(
      "duplicate tool name",
    );
  });

  it("requires safety controls for mutation tools", async () => {
    const entry = await azureEntry();
    entry.operations.explicitMutationConfirmation = false;
    expect(
      validateConsistency(loaded(entry)).map((issue) => issue.message),
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining("requires consequential=true"),
      ]),
    );
  });

  it("enforces deprecated-entry rules", async () => {
    const entry = { ...(await azureEntry()), lifecycle: "deprecated" as const };
    expect(await validateEntryDocument(projectRoot, entry)).not.toEqual([]);
    entry.deprecation = { reason: "Replaced after provider retirement." };
    expect(await validateEntryDocument(projectRoot, entry)).toEqual([]);
  });

  it("honestly represents unpublished and unhosted servers", async () => {
    const entries = (await loadEntries(projectRoot)).map(({ entry }) => entry);
    expect(entries.every((entry) => entry.distribution === undefined)).toBe(
      true,
    );
    const offerUp = entries.find(
      (entry) => entry.id === "agent-tool-server-offerup",
    );
    expect(offerUp?.interfaces.hosting).toBe("unavailable");
    expect(offerUp?.interfaces.transports).toEqual([]);
    expect(offerUp?.capabilities.tools).toEqual([]);
  });
});
