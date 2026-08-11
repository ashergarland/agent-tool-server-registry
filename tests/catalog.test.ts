import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  checkCatalog,
  generateCatalog,
  serializeCatalog,
  writeCatalog,
} from "../src/catalog.js";
import { projectRoot } from "../src/paths.js";

const temporaryRoots: string[] = [];

async function fixtureRoot(): Promise<string> {
  const root = join(projectRoot, ".test-tmp", crypto.randomUUID());
  temporaryRoots.push(root);
  await mkdir(root, { recursive: true });
  await Promise.all([
    cp(join(projectRoot, "entries"), join(root, "entries"), { recursive: true }),
    cp(join(projectRoot, "schema"), join(root, "schema"), { recursive: true }),
    cp(join(projectRoot, "package.json"), join(root, "package.json")),
  ]);
  return root;
}

afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true })));
});

describe("catalog generation", () => {
  it("is deterministic and sorts entries and nested sets", async () => {
    const first = serializeCatalog(await generateCatalog(projectRoot));
    const second = serializeCatalog(await generateCatalog(projectRoot));
    expect(second).toBe(first);
    const catalog = JSON.parse(first) as {
      entries: Array<{ id: string; tags: string[]; capabilities: { tools: { name: string }[] } }>;
    };
    expect(catalog.entries.map((entry) => entry.id)).toEqual(
      [...catalog.entries.map((entry) => entry.id)].sort(),
    );
    for (const entry of catalog.entries) {
      expect(entry.tags).toEqual([...entry.tags].sort());
      expect(entry.capabilities.tools.map((tool) => tool.name)).toEqual(
        [...entry.capabilities.tools.map((tool) => tool.name)].sort(),
      );
    }
  });

  it("detects stale generated output", async () => {
    const root = await fixtureRoot();
    await writeFile(join(root, "catalog.json"), "{}\n");
    expect(await checkCatalog(root)).toEqual([
      expect.objectContaining({ message: expect.stringContaining("stale") }),
    ]);
    await writeCatalog(root);
    expect(await checkCatalog(root)).toEqual([]);
    expect(await readFile(join(root, "catalog.json"), "utf8")).toContain(
      '"agent-tool-server-azure"',
    );
  });
});
