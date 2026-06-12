#!/usr/bin/env node
const { readdirSync, readFileSync, statSync } = require('node:fs');
const { extname, join } = require('node:path');

const ROOTS = ['src', 'lib'];
let issues = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full);
    else if (extname(full) === '.js') check(full);
  }
}

function check(file) {
  const text = readFileSync(file, 'utf8');
  if (text.includes('\t')) report(file, 'tabs found — prefer 2-space indentation');
  if (text.trimEnd() !== text.replace(/\s+$/, '')) report(file, 'trailing whitespace');
}

function report(file, message) {
  process.stdout.write(`${file}: ${message}\n`);
  issues += 1;
}

for (const root of ROOTS) walk(root);

if (issues > 0) {
  process.stdout.write(`\nlint failed with ${issues} issue(s)\n`);
  process.exit(1);
}
process.stdout.write('lint OK — no issues\n');
