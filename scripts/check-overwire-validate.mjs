#!/usr/bin/env node
// Run `overwire validate` across all five config roots. bad-practices.yml is
// the documented lint-bait workflow, so error findings THERE are required
// (the bait must keep baiting); an error anywhere else fails the check.
import { execFileSync } from 'node:child_process';

const ROOTS = [
  { cwd: '.', root: 'single-repo-demo/.overwire' },
  { cwd: 'multi-repo-demo', root: 'starter-app/.overwire' },
  { cwd: 'multi-repo-demo', root: 'pipeline-app/.overwire' },
  { cwd: 'multi-repo-demo', root: 'compliance-app/.overwire' },
  { cwd: 'multi-repo-demo', root: 'enterprise-actions/.overwire' },
];
const BAIT = /bad-practices\.yml$/;

let failed = 0;
let baitErrors = 0;
for (const { cwd, root } of ROOTS) {
  let out;
  try {
    out = execFileSync('overwire', ['validate', '--config-root', root, '--json'], {
      cwd,
      encoding: 'utf8',
    });
  } catch (err) {
    out = err.stdout ?? '';
    if (!out) {
      console.error(`✗ ${root}: overwire validate produced no output`);
      failed++;
      continue;
    }
  }
  const report = JSON.parse(out);
  for (const f of report.findings ?? []) {
    if (f.severity !== 'error') continue;
    if (BAIT.test(f.file)) {
      baitErrors++;
      continue;
    }
    console.error(`✗ ${root}: ${f.file} [${f.source}] ${f.message}`);
    failed++;
  }
  console.log(`· ${root}: ${report.workflowsChecked} workflows, ${report.summary.errors} error(s)`);
}
if (baitErrors === 0) {
  console.error('✗ bad-practices.yml produced no error findings — the lint bait went stale');
  failed++;
}
if (failed > 0) process.exit(1);
console.log(`✓ all config roots validate (only the documented bad-practices bait errors, ${baitErrors} of them)`);
