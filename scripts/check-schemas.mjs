#!/usr/bin/env node
// Validate every tracked .overwire/ YAML/JSON doc against the JSON Schema its
// own `# yaml-language-server: $schema=<url>` header (or JSON "$schema" key)
// declares. Schemas are fetched once per URL. Fails on violations and on
// .overwire YAML files that declare no schema (every format has one).
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

const cache = new Map();
async function schemaFor(url) {
  if (!cache.has(url)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch ${url} -> HTTP ${res.status}`);
    cache.set(url, ajv.compile(await res.json()));
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
