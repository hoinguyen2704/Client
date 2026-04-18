import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = path.resolve('src');
const LOCALES_DIR = path.resolve('src/locales');
const FILE_EXTENSIONS = new Set(['.ts', '.tsx']);
const VIETNAMESE_REGEX = /[À-ỹ]/u;

const fileStats = [];

function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

function walk(currentDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    if (fullPath.startsWith(LOCALES_DIR)) continue;

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!FILE_EXTENSIONS.has(path.extname(entry.name))) continue;

    const content = stripComments(fs.readFileSync(fullPath, 'utf8'));
    const matches = content
      .split('\n')
      .filter((line) => VIETNAMESE_REGEX.test(line))
      .length;

    if (matches > 0) {
      fileStats.push({
        file: path.relative(process.cwd(), fullPath),
        matches,
      });
    }
  }
}

walk(ROOT_DIR);

const totalFiles = fileStats.length;
const totalLines = fileStats.reduce((sum, item) => sum + item.matches, 0);
const topFiles = [...fileStats]
  .sort((a, b) => b.matches - a.matches)
  .slice(0, 20);

console.log(`files=${totalFiles}`);
console.log(`lines=${totalLines}`);
console.log('');
console.log('Top files');
for (const item of topFiles) {
  console.log(`${item.matches}\t${item.file}`);
}
