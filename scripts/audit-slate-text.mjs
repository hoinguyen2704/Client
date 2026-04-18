import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.resolve(__dirname, "../src");

const BASE_REGEX = /\btext-slate-\d{2,3}(?:\/\d{1,3})?\b/g;
const TOKEN_REGEX =
  /\b(?:dark:|hover:|focus:|group-hover:|dark:hover:)?text-slate-\d{2,3}(?:\/\d{1,3})?\b/g;
const PAIR_REGEX =
  /\btext-slate-\d{2,3}(?:\/\d{1,3})?\s+dark:text-slate-\d{2,3}(?:\/\d{1,3})?\b/g;

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

function countMatches(regex, source) {
  return source.match(regex) ?? [];
}

const files = (await walk(srcRoot)).filter((file) =>
  /\.(tsx?|jsx?|css)$/.test(file),
);

let totalOccurrences = 0;
const baseTokens = new Map();
const fullTokens = new Map();
const pairs = new Map();
const fileTotals = [];

for (const file of files) {
  const contents = await readFile(file, "utf8");
  const baseMatches = countMatches(BASE_REGEX, contents);
  const tokenMatches = countMatches(TOKEN_REGEX, contents);
  const pairMatches = countMatches(PAIR_REGEX, contents);

  if (baseMatches.length === 0) {
    continue;
  }

  totalOccurrences += baseMatches.length;
  fileTotals.push([path.relative(path.resolve(__dirname, ".."), file), tokenMatches.length]);

  for (const match of baseMatches) {
    baseTokens.set(match, (baseTokens.get(match) ?? 0) + 1);
  }

  for (const match of tokenMatches) {
    fullTokens.set(match, (fullTokens.get(match) ?? 0) + 1);
  }

  for (const match of pairMatches) {
    pairs.set(match, (pairs.get(match) ?? 0) + 1);
  }
}

const top = (entries, limit = 10) =>
  [...entries].sort((a, b) => b[1] - a[1]).slice(0, limit);

console.log(`files=${fileTotals.length}`);
console.log(`occurrences=${totalOccurrences}`);
console.log(`base_unique=${baseTokens.size}`);
console.log(`token_unique=${fullTokens.size}`);
console.log(`pair_unique=${pairs.size}`);

console.log("\nTop base tokens");
for (const [token, count] of top(baseTokens)) {
  console.log(`${count}\t${token}`);
}

console.log("\nTop light/dark pairs");
for (const [token, count] of top(pairs)) {
  console.log(`${count}\t${token}`);
}

console.log("\nTop files");
for (const [file, count] of top(fileTotals)) {
  console.log(`${count}\t${file}`);
}
