import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { compareMetadata } from "../src/online.js";
import { projectRoot } from "../src/paths.js";
import type { ServerEntry } from "../src/types.js";

async function entry(): Promise<ServerEntry> {
  return JSON.parse(
    await readFile(join(projectRoot, "entries/agent-tool-server-azure.json"), "utf8"),
  ) as ServerEntry;
}

describe("cross-repository comparison", () => {
  it("accepts matching identity, repository, version, and transports", async () => {
    const source = await entry();
    expect(
      compareMetadata(source, {
        name: `io.github.ashergarland/${source.id}`,
        repository: { url: source.repository },
        version: source.version,
        packages: [{ transport: { type: "stdio" } }],
      }),
    ).toEqual([]);
  });

  it("reports actionable metadata differences", async () => {
    const source = await entry();
    const messages = compareMetadata(source, {
      name: "io.github.example/wrong",
      repository: { url: "https://github.com/example/wrong" },
      version: "9.9.9",
      remotes: [{ type: "streamable-http" }],
    });
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringContaining("name: expected"),
        expect.stringContaining("repository: expected"),
        expect.stringContaining("version: expected"),
        expect.stringContaining("transport streamable-http"),
      ]),
    );
  });
});
