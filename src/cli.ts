#!/usr/bin/env node

import { checkCatalog, writeCatalog } from "./catalog.js";
import { verifyOnline } from "./online.js";
import { projectRoot } from "./paths.js";
import { validateRegistry } from "./validation.js";

function printIssues(issues: Array<{ source: string; message: string }>): void {
  for (const issue of issues) {
    console.error(`${issue.source}: ${issue.message}`);
  }
}

async function main(): Promise<void> {
  const command = process.argv[2];
  if (command === "generate") {
    await writeCatalog(projectRoot);
    console.log("catalog.json generated");
    return;
  }
  if (command === "catalog-check") {
    const issues = await checkCatalog(projectRoot);
    printIssues(issues);
    process.exitCode = issues.length === 0 ? 0 : 1;
    return;
  }
  if (command === "validate") {
    const issues = await validateRegistry(projectRoot);
    printIssues(issues);
    process.exitCode = issues.length === 0 ? 0 : 1;
    if (issues.length === 0) console.log("registry is valid");
    return;
  }
  if (command === "verify-online") {
    const results = await verifyOnline(projectRoot);
    for (const result of results) {
      console.log(`${result.id}: ${result.status}`);
      for (const message of result.messages) console.log(`  - ${message}`);
    }
    process.exitCode = results.some((result) => result.status !== "ok") ? 1 : 0;
    return;
  }
  console.error(
    "usage: cli.ts <generate|catalog-check|validate|verify-online>",
  );
  process.exitCode = 2;
}

await main();
