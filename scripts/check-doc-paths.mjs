#!/usr/bin/env node
// Every repo path a markdown file mentions must exist on disk. This is the
// check that would have caught the hello-app -> starter-app rename breaking
// CLI-TEST-COMMANDS.md.
//
// Extraction is conservative: tree-diagram lines are skipped (box-drawing
// fragments), templates/globs/URLs are skipped, and a token only counts as a
// path claim when its first segment exists as a real directory from one of
// the resolution bases. Resolution tries: the md file's dir, the repo root,
// each app dir under the md's dir, and each app's .overwire/ (tour commands
// reference repo-relative paths like src/index.js and mocks/upload-sbom.yml).
// Genuine false positives go in IGNORE with a comment.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const IGNORE = new Set([
  // run-store / local-state layouts that exist only after runs, not in a clone
  '.overwire/state/', '.overwire/state', '.overwire/cache/', '.overwire/cache',
  '.overwire/secrets.enc.json', '.seeded-mocks/', './.seeded-mocks',
  // generic per-workflow templates written without <> in prose
  '.overwire/modes/ci.yml',
]);

const mdFiles = execFileSync('git', ['ls-files', '-z', '*.md'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const TOKEN = /[\w~.][\w.~-]*(?:\/[\w.<>*{}$-]+)+\/?/g;

function basesFor(mdDir) {
  const bases = [mdDir, '.'];
  for (const entry of readdirSync(mdDir)) {
    const p = join(mdDir, entry);
    try {
      if (statSync(p).isDirectory()) {
        bases.push(p, join(p, '.overwire'));
      }
    } catch { /* ignore */ }
  }
  return bases;
}

let failed = 0;
let checked = 0;
for (const md of mdFiles) {
  const bases = basesFor(dirname(md));
  for (const line of readFileSync(md, 'utf8').split('\n')) {
    if (/[│├└─┌]/.test(line)) continue; // tree diagram; verified by hand
    for (const raw of line.match(TOKEN) ?? []) {
      const token = raw.replace(/[).,:;'"`]+$/, '');
      if (/[<>*{}$]/.test(token)) continue; // template, glob, or expression
      if (/^(https?|www\.|github\.com|docs\.overwire|overwire\.io|keepachangelog)/.test(token)) continue;
      if (token.startsWith('~')) continue; // home-relative, machine-specific
      if (IGNORE.has(token)) continue;
      if (/^(node|npm|npx|git|actions\/|overwireio\/|postgres|redis|node:|acme-corp\/|wire-corp\/)/.test(token)) continue; // tools, images, action/org refs
      if (bases.some((b) => existsSync(join(b, token)))) { checked++; continue; }
      // Unresolved. Only fail when the token is shaped like a path claim —
      // a file extension, a trailing slash, or a dotted config dir segment —
      // so prose alternates ("create/delete", "parsing/config") stay quiet
      // while a renamed directory in a real reference still trips the check.
      const pathShaped =
        /\.(ya?ml|json|md|js|mjs|sh|txt|lock)$/.test(token) ||
        token.endsWith('/') ||
        /(^|\/)\.(github|overwire)(\/|$)/.test(token);
      if (!pathShaped) continue;
      console.error(`✗ ${md}: references missing path "${token}"`);
      failed++;
    }
  }
}
if (failed > 0) {
  console.error(`${failed} missing path reference(s)`);
  process.exit(1);
}
console.log(`✓ ${checked} doc path references resolve`);
