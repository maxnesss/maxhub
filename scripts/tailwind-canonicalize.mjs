#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const WRITE_MODE = process.argv.includes("--write");
const CHECK_MODE = process.argv.includes("--check") || !WRITE_MODE;

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx", ".mdx"]);
const IGNORE_DIRS = new Set([".git", ".next", "node_modules", "dist", "build", "out"]);

// Converts e.g. border-[var(--line)] -> border-(--line)
const VAR_CLASS_REGEX = /([a-zA-Z0-9:_\-/]+)-\[var\((--[a-zA-Z0-9-_]+)\)\]/g;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        files.push(...(await walk(absolutePath)));
      }
      continue;
    }

    if (!entry.isFile()) continue;
    if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function canonicalize(content) {
  return content.replace(VAR_CLASS_REGEX, (_full, utilityPrefix, cssVar) => {
    return `${utilityPrefix}-(${cssVar})`;
  });
}

async function main() {
  const files = await walk(ROOT);
  let changedFiles = 0;
  let totalReplacements = 0;

  for (const file of files) {
    const original = await fs.readFile(file, "utf8");
    const matches = [...original.matchAll(VAR_CLASS_REGEX)];
    if (matches.length === 0) continue;

    const updated = canonicalize(original);
    if (updated === original) continue;

    changedFiles += 1;
    totalReplacements += matches.length;

    if (WRITE_MODE) {
      await fs.writeFile(file, updated, "utf8");
    }

    const rel = path.relative(ROOT, file);
    console.log(`${rel}: ${matches.length} replacement(s)`);
  }

  if (changedFiles === 0) {
    console.log("No canonical Tailwind var() class updates needed.");
    return;
  }

  if (CHECK_MODE && !WRITE_MODE) {
    console.error(
      `Found ${totalReplacements} canonical Tailwind class issue(s) across ${changedFiles} file(s). Run: npm run fix:tailwind:canonical`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `Applied ${totalReplacements} canonical Tailwind class update(s) in ${changedFiles} file(s).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
