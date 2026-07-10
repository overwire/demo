#!/usr/bin/env node
// Parse every tracked .yml/.yaml in the repo EXCEPT workflow files. Workflow
// YAML legitimately contains plain scalars a raw parser rejects (e.g.
// `run: echo "a: b"`) that Overwire's own parser shields before parsing —
// `overwire validate` covers those authoritatively in the same CI job, so
// this check owns everything else (.overwire docs, action.yml, chains).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { parseAllDocuments } from 'yaml';

const files = execFileSync('git', ['ls-files', '-z', '*.yml', '*.yaml'], { encoding: 'utf8' })
  .split('\0')
  .filter((f) => f && !/\.github\/workflows\//.test(f));

let failed = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const doc of parseAllDocuments(text)) {
    const errors = doc.errors ?? [];
    for (const err of errors) {
      console.error(`✗ ${file}: ${err.message.split('\n')[0]}`);
      failed++;
    }
  }
}
if (failed > 0) {
  console.error(`${failed} YAML error(s)`);
  process.exit(1);
}
console.log(`✓ ${files.length} YAML files parse`);
