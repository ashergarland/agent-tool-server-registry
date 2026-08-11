import { readFile, readdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

import type { Catalog, ServerEntry, ValidationIssue } from "./types.js";
import { schemaVersion } from "./types.js";

interface PackageMetadata {
  version: string;
}

export interface LoadedEntry {
  filename: string;
  entry: ServerEntry;
}

export async function loadEntries(root: string): Promise<LoadedEntry[]> {
  const directory = join(root, "entries");
  const filenames = (await readdir(directory))
    .filter((filename) => filename.endsWith(".json"))
    .sort((left, right) => left.localeCompare(right));

  return Promise.all(
    filenames.map(async (filename) => ({
      filename,
      entry: JSON.parse(
        await readFile(join(directory, filename), "utf8"),
      ) as ServerEntry,
    })),
  );
}

function sorted<T>(values: T[], key: (value: T) => string): T[] {
  return [...values].sort((left, right) => key(left).localeCompare(key(right)));
}

export function normalizeEntry(entry: ServerEntry): ServerEntry {
  return {
    ...entry,
    categories: sorted(entry.categories, String),
    tags: sorted(entry.tags, String),
    interfaces: {
      ...entry.interfaces,
      transports: sorted(entry.interfaces.transports, String),
      authentication: sorted(entry.interfaces.authentication, String),
      requiredConfiguration: sorted(
        entry.interfaces.requiredConfiguration,
        (configuration) => configuration.name,
      ),
    },
    capabilities: {
      tools: sorted(entry.capabilities.tools, (tool) => tool.name),
    },
  };
}

export async function generateCatalog(root: string): Promise<Catalog> {
  const metadata = JSON.parse(
    await readFile(join(root, "package.json"), "utf8"),
  ) as PackageMetadata;
  const loaded = await loadEntries(root);

  return {
    schemaVersion,
    catalogVersion: metadata.version,
    entries: sorted(
      loaded.map(({ entry }) => normalizeEntry(entry)),
      (entry) => entry.id,
    ),
  };
}

export function serializeCatalog(catalog: Catalog): string {
  return `${JSON.stringify(catalog, null, 2)}\n`;
}

export async function writeCatalog(root: string): Promise<void> {
  await writeFile(
    join(root, "catalog.json"),
    serializeCatalog(await generateCatalog(root)),
  );
}

export async function checkCatalog(root: string): Promise<ValidationIssue[]> {
  const expected = serializeCatalog(await generateCatalog(root));
  const path = join(root, "catalog.json");
  let actual: string;

  try {
    actual = await readFile(path, "utf8");
  } catch {
    return [
      { source: "catalog.json", message: "generated catalog is missing" },
    ];
  }

  return actual === expected
    ? []
    : [
        {
          source: basename(path),
          message: "generated catalog is stale; run npm run catalog:generate",
        },
      ];
}
