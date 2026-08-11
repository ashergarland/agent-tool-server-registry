import { readFile } from "node:fs/promises";
import { join } from "node:path";

import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import semver from "semver";

import { checkCatalog, generateCatalog, loadEntries } from "./catalog.js";
import type { Catalog, ServerEntry, ValidationIssue } from "./types.js";

interface Validators {
  entry: ValidateFunction<ServerEntry>;
  catalog: ValidateFunction<Catalog>;
}

function formatErrors(errors: ErrorObject[] | null | undefined): string {
  return (errors ?? [])
    .map((error) => `${error.instancePath || "/"} ${error.message ?? "is invalid"}`)
    .join("; ");
}

async function createValidators(root: string): Promise<Validators> {
  const entrySchema = JSON.parse(
    await readFile(join(root, "schema/server-entry.schema.json"), "utf8"),
  ) as object;
  const catalogSchema = JSON.parse(
    await readFile(join(root, "schema/catalog.schema.json"), "utf8"),
  ) as object;
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  ajv.addSchema(entrySchema);

  return {
    entry: ajv.getSchema<ServerEntry>(
      "https://raw.githubusercontent.com/ashergarland/agent-tool-server-registry/main/schema/server-entry.schema.json",
    )!,
    catalog: ajv.compile<Catalog>(catalogSchema),
  };
}

export async function validateEntryDocument(
  root: string,
  entry: unknown,
): Promise<ValidationIssue[]> {
  const validator = (await createValidators(root)).entry;
  return validator(entry)
    ? []
    : [{ source: "entry", message: formatErrors(validator.errors) }];
}

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  return [...new Set(values.filter((value) => seen.size === seen.add(value).size))];
}

export function validateConsistency(
  loaded: Array<{ filename: string; entry: ServerEntry }>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ids = loaded.map(({ entry }) => entry.id);
  const repositories = loaded.map(({ entry }) => entry.repository);

  for (const id of duplicates(ids)) {
    issues.push({ source: "entries", message: `duplicate server ID: ${id}` });
  }
  for (const repository of duplicates(repositories)) {
    issues.push({ source: "entries", message: `duplicate repository URL: ${repository}` });
  }

  for (const { filename, entry } of loaded) {
    if (filename !== `${entry.id}.json`) {
      issues.push({
        source: filename,
        message: `filename must be ${entry.id}.json`,
      });
    }
    if (entry.version !== undefined && semver.valid(entry.version) === null) {
      issues.push({ source: filename, message: `invalid semantic version: ${entry.version}` });
    }
    for (const name of duplicates(entry.capabilities.tools.map((tool) => tool.name))) {
      issues.push({ source: filename, message: `duplicate tool name: ${name}` });
    }
    for (const name of duplicates(entry.tags)) {
      issues.push({ source: filename, message: `duplicate tag: ${name}` });
    }
    for (const method of duplicates(entry.interfaces.authentication)) {
      issues.push({
        source: filename,
        message: `duplicate authentication method: ${method}`,
      });
    }
    for (const tool of entry.capabilities.tools) {
      if (
        tool.behavior === "mutation" &&
        (!tool.consequential ||
          !entry.operations.mutationsDisabledByDefault ||
          !entry.operations.explicitMutationConfirmation)
      ) {
        issues.push({
          source: filename,
          message: `mutation tool ${tool.name} requires consequential=true, mutations disabled by default, and explicit confirmation`,
        });
      }
    }
    if (entry.interfaces.hosting === "hosted" && entry.interfaces.endpoints === undefined) {
      issues.push({
        source: filename,
        message: "hosted entries must declare stable endpoints",
      });
    }
    if (entry.lifecycle === "deprecated" && entry.deprecation === undefined) {
      issues.push({
        source: filename,
        message: "deprecated entries must include a deprecation reason",
      });
    }
    if (
      entry.distribution?.npm !== undefined &&
      entry.distribution.npm.version !== entry.version
    ) {
      issues.push({
        source: filename,
        message: "npm distribution version must match the server version",
      });
    }
  }

  return issues;
}

export async function validateRegistry(
  root: string,
  includeCatalogCheck = true,
): Promise<ValidationIssue[]> {
  const loaded = await loadEntries(root);
  const validators = await createValidators(root);
  const issues = validateConsistency(loaded);

  for (const { filename, entry } of loaded) {
    if (!validators.entry(entry)) {
      issues.push({ source: filename, message: formatErrors(validators.entry.errors) });
    }
  }

  const catalog = await generateCatalog(root);
  if (!validators.catalog(catalog)) {
    issues.push({ source: "catalog.json", message: formatErrors(validators.catalog.errors) });
  }

  if (includeCatalogCheck) {
    issues.push(...(await checkCatalog(root)));
  }
  return issues;
}
