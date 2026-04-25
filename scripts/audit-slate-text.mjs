import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");
const tokenSource = path.join(srcRoot, "styles", "text-tokens.css");

const DIRECT_SLATE_REGEX = /\b(?:[\w-]+:)*text-slate-\d{2,3}(?:\/\d{1,3})?\b/g;
const LEGACY_TOKEN_REGEX =
  /\b(?:[\w-]+:)*(?:text-ink-max|text-strong-soft|text-strong|text-body-soft|text-muted-strong|text-disabled)\b/g;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      return entry.isDirectory() ? walk(fullPath) : fullPath;
    }),
  );

  return files.flat();
}

function top(entries, limit = 10) {
  return [...entries].sort((a, b) => b[1] - a[1]).slice(0, limit);
}

function collectMatches(regex, source) {
  return source.match(regex) ?? [];
}

const files = (await walk(srcRoot)).filter((file) => /\.(tsx?|jsx?|css)$/.test(file));

let directSlateOccurrences = 0;
let legacyTokenOccurrences = 0;

const directSlateTokens = new Map();
const legacyTokens = new Map();
const directSlateFiles = [];
const legacyTokenFiles = [];

for (const file of files) {
  const contents = await readFile(file, "utf8");

  if (file !== tokenSource) {
    const directMatches = collectMatches(DIRECT_SLATE_REGEX, contents);
    if (directMatches.length > 0) {
      directSlateOccurrences += directMatches.length;
      directSlateFiles.push([path.relative(projectRoot, file), directMatches.length]);

      for (const match of directMatches) {
        directSlateTokens.set(match, (directSlateTokens.get(match) ?? 0) + 1);
      }
    }
  }

  const legacyMatches = collectMatches(LEGACY_TOKEN_REGEX, contents);
  if (legacyMatches.length > 0) {
    legacyTokenOccurrences += legacyMatches.length;
    legacyTokenFiles.push([path.relative(projectRoot, file), legacyMatches.length]);

    for (const match of legacyMatches) {
      legacyTokens.set(match, (legacyTokens.get(match) ?? 0) + 1);
    }
  }
}

console.log(`direct_slate_files=${directSlateFiles.length}`);
console.log(`direct_slate_occurrences=${directSlateOccurrences}`);
console.log(`legacy_token_files=${legacyTokenFiles.length}`);
console.log(`legacy_token_occurrences=${legacyTokenOccurrences}`);

if (directSlateOccurrences > 0) {
  console.log("\nTop direct slate tokens");
  for (const [token, count] of top(directSlateTokens)) {
    console.log(`${count}\t${token}`);
  }

  console.log("\nTop files with direct slate tokens");
  for (const [file, count] of top(directSlateFiles)) {
    console.log(`${count}\t${file}`);
  }
}

if (legacyTokenOccurrences > 0) {
  console.log("\nLegacy text tokens");
  for (const [token, count] of top(legacyTokens)) {
    console.log(`${count}\t${token}`);
  }

  console.log("\nTop files with legacy text tokens");
  for (const [file, count] of top(legacyTokenFiles)) {
    console.log(`${count}\t${file}`);
  }
}

if (directSlateOccurrences === 0 && legacyTokenOccurrences === 0) {
  console.log("\nAudit passed: only canonical grayscale text tokens remain.");
} else {
  process.exitCode = 1;
}
