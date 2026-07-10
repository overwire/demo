#!/usr/bin/env node
// Validate every tracked .overwire/ YAML/JSON doc against the JSON Schema its
// own `# yaml-language-server: $schema=<url>` header (or JSON "$schema" key)
// declares. Fails on violations and on .overwire YAML files that declare no
// schema (every format has one).
//
// Resolution: canonical docs.overwire.io URLs are resolved OFFLINE through
// the installed CLI (`overwire schema <id>` prints the same documents) —
// datacenter IPs can get 403'd by the site's bot protection, and CI already
// has the CLI. Anything else falls back to a fetch with a descriptive UA.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ strict: false, allowUnionTypes: true });
addFormats(ajv);

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter((f) => f && /\.overwire\//.test(f) && /\.(ya?ml|json)$/.test(f));

const CANONICAL = /^https:\/\/docs\.overwire\.io\/schemas\/([a-z0-9-]+)\.schema\.json$/;
let cliAvailable = null;
function hasCli() {
  if (cliAvailable === null) {
    try {
      execFileSync('overwire', ['--version'], { stdio: 'ignore' });
      cliAvailable = true;
    } catch {
      cliAvailable = false;
    }
  }
  return cliAvailable;
}

const cache = new Map();
async function schemaFor(url) {
  if (!cache.has(url)) {
    const id = url.match(CANONICAL)?.[1];
    let doc;
    if (id && hasCli()) {
      doc = JSON.parse(execFileSync('overwire', ['schema', id], { encoding: 'utf8' }));
    } else {
      const res = await fetch(url, {
        headers: { 'user-agent': 'overwire-demo-checks (+https://github.com/overwire/demo)' },
      });
      if (!res.ok) throw new Error(`fetch ${url} -> HTTP ${res.status}`);
      doc = await res.json();
    }
    cache.set(url, ajv.compile(doc));
  }
  return cache.get(url);
}

// Ruleset exports use GitHub's native format; Overwire publishes no schema id
// for them (the config map marks them "—").
const NO_SCHEMA_OK = [/rulesets\.json$/, /\.gitignore$/];

let failed = 0;
let checked = 0;
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  let url;
  if (file.endsWith('.json')) {
    url = JSON.parse(text).$schema;
  } else {
    url = text.match(/^#\s*yaml-language-server:\s*\$schema=(\S+)/)?.[1];
  }
  if (!url) {
    if (NO_SCHEMA_OK.some((re) => re.test(file)) || file.endsWith('.json')) continue;
    console.error(`✗ ${file}: no $schema header`);
    failed++;
    continue;
  }
  const validate = await schemaFor(url);
  const doc = file.endsWith('.json') ? JSON.parse(text) : parse(text);
  if (!validate(doc)) {
    for (const err of validate.errors) {
      console.error(`✗ ${file}: ${err.instancePath || '/'} ${err.message}`);
    }
    failed++;
    continue;
  }
  checked++;
}
if (failed > 0) {
  console.error(`${failed} schema failure(s)`);
  process.exit(1);
}
console.log(`✓ ${checked} .overwire docs validate against their declared schemas (${cache.size} schemas)`);
