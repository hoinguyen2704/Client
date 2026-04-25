import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(__dirname, '..');
const srcRoot = path.resolve(clientRoot, 'src');

const SOURCE_FILE_REGEX = /\.(ts|tsx)$/;
const OBJECT_ALIAS_SCOPE_REGEX =
  /^src\/(?:components|views|stores|apis|types|hooks)(?:\/|$)/;
const SERVICE_FILE_REGEX = /^src\/apis\/services\/.+\.ts$/;

/*
 * Audit rules for React/TypeScript typing conventions:
 * - shared/domain types must be imported via '@/types' outside src/types
 * - src/types modules must use relative sibling imports instead of '@/types'
 * - no React.FC or generic Props/State aliases
 * - no object-literal type aliases in audited layers; use interface instead
 * - no type imports from service modules
 * - no anonymous request/response contracts inside services
 */

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

function getLineNumber(source, index) {
  return source.slice(0, index).split('\n').length;
}

function normalizeRelative(file) {
  return path.relative(clientRoot, file).split(path.sep).join('/');
}

function recordMatches(violations, file, source, regex, rule) {
  const globalRegex = regex.global ? regex : new RegExp(regex.source, `${regex.flags}g`);

  for (const match of source.matchAll(globalRegex)) {
    const [excerpt] = match;
    violations.push({
      file,
      line: getLineNumber(source, match.index ?? 0),
      rule,
      excerpt: excerpt.trim(),
    });
  }
}

const files = (await walk(srcRoot)).filter((file) => SOURCE_FILE_REGEX.test(file));
const violations = [];

for (const file of files) {
  const relativeFile = normalizeRelative(file);
  const source = await readFile(file, 'utf8');

  recordMatches(
    violations,
    relativeFile,
    source,
    /\bReact\.FC\b|\bFC\s*</g,
    'Do not use React.FC/FC; type props directly on the component signature.',
  );

  recordMatches(
    violations,
    relativeFile,
    source,
    /\b(?:export\s+)?interface\s+(?:Props|State)\b/g,
    'Rename generic interface Props/State to a contextual name.',
  );

  recordMatches(
    violations,
    relativeFile,
    source,
    /\b(?:export\s+)?type\s+(?:Props|State)\b/g,
    'Rename generic type Props/State to a contextual name.',
  );

  if (OBJECT_ALIAS_SCOPE_REGEX.test(relativeFile)) {
    recordMatches(
      violations,
      relativeFile,
      source,
      /^\s*(?:export\s+)?type\s+[A-Z][A-Za-z0-9_]*\s*=\s*\{/gm,
      'Use interface for pure object contracts in components/views/stores/apis/types/hooks.',
    );
  }

  recordMatches(
    violations,
    relativeFile,
    source,
    /^\s*import\s+type\s+[^;]+from\s+['"]@\/apis\/services\/[^'"]+['"];?/gm,
    'Do not import types from service modules; move the contract into src/types.',
  );

  if (relativeFile.startsWith('src/types/')) {
    recordMatches(
      violations,
      relativeFile,
      source,
      /from\s+['"]@\/types(?:\/[^'"]+)?['"]/g,
      'Files inside src/types must use relative sibling imports, not @/types.',
    );
  } else {
    recordMatches(
      violations,
      relativeFile,
      source,
      /from\s+['"]@\/types\/[^'"]+['"]/g,
      'Consumers outside src/types must import shared/domain types through @/types.',
    );
  }

  if (SERVICE_FILE_REGEX.test(relativeFile)) {
    recordMatches(
      violations,
      relativeFile,
      source,
      /Promise<\s*\{/g,
      'Do not use inline object response contracts in services; extract them into src/types.',
    );

    recordMatches(
      violations,
      relativeFile,
      source,
      /^\s*(?:export\s+)?(?:const\s+\w+\s*=\s*|function\s+\w+\s*|async\s+function\s+\w+\s*)\([^)\n]*:\s*\{/gm,
      'Do not use inline object parameter contracts in services; extract them into src/types.',
    );

    recordMatches(
      violations,
      relativeFile,
      source,
      /^\s*\w+\s*:\s*\([^)\n]*:\s*\{/gm,
      'Do not use inline object parameter contracts in services; extract them into src/types.',
    );
  }
}

if (violations.length > 0) {
  console.error(`Found ${violations.length} react type audit violation(s).\n`);
  for (const violation of violations) {
    console.error(
      `${violation.file}:${violation.line} [${violation.rule}] ${violation.excerpt}`,
    );
  }
  process.exitCode = 1;
} else {
  console.log('react-type-audit=pass');
}
