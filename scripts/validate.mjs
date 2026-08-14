#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const repositoryRoot = new URL("../", import.meta.url);
const catalogPath = new URL("catalog.json", repositoryRoot);
const schemaPath = new URL("schema/catalog.schema.json", repositoryRoot);
const repositoryPrefix = "https://github.com/ashergarland/";

async function readJson(url) {
  const text = await readFile(url, "utf8");
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      `${fileURLToPath(url)} is not valid JSON: ${error.message}`,
    );
  }
}

function checkUnique(values, label) {
  const errors = [];
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) {
      errors.push(`duplicate ${label}: ${value}`);
    }
    seen.add(value);
  }
  return errors;
}

function checkCatalogRules(catalog) {
  const servers = catalog.servers ?? [];
  const ids = servers.map((server) => server.id);
  const errors = [
    ...checkUnique(ids, "server id"),
    ...checkUnique(
      servers.map((server) => server.repository),
      "repository URL",
    ),
  ];

  const sorted = [...ids].sort();
  if (ids.join("\u0000") !== sorted.join("\u0000")) {
    errors.push(
      `servers must be sorted by id; expected order: ${sorted.join(", ")}`,
    );
  }

  for (const server of servers) {
    const expected = `${repositoryPrefix}${server.id}`;
    if (server.repository !== expected) {
      errors.push(`${server.id}: repository must be exactly ${expected}`);
    }
  }

  return errors;
}

async function main() {
  const [catalog, schema] = await Promise.all([
    readJson(catalogPath),
    readJson(schemaPath),
  ]);

  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const validate = ajv.compile(schema);

  if (!validate(catalog)) {
    for (const error of validate.errors ?? []) {
      const location = error.instancePath || "/";
      console.error(`catalog.json${location}: ${error.message}`);
    }
    console.error("catalog.json failed schema validation.");
    process.exitCode = 1;
    return;
  }

  const errors = checkCatalogRules(catalog);
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`catalog.json: ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`catalog.json is valid (${catalog.servers.length} servers).`);
}

await main();
