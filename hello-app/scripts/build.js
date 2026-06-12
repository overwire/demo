#!/usr/bin/env node
const { mkdirSync, readFileSync, writeFileSync, cpSync } = require('node:fs');
const { join } = require('node:path');

const distDir = join(__dirname, '..', 'dist');
mkdirSync(distDir, { recursive: true });

const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

cpSync(join(__dirname, '..', 'src'), join(distDir, 'src'), { recursive: true });
writeFileSync(
  join(distDir, 'package.json'),
  JSON.stringify(
    {
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      main: pkg.main,
      type: pkg.type,
      engines: pkg.engines,
      license: pkg.license,
    },
    null,
    2,
  ) + '\n',
);
writeFileSync(
  join(distDir, 'BUILD-INFO.json'),
  JSON.stringify(
    {
      builtAt: new Date().toISOString(),
      node: process.version,
      commit: process.env.GITHUB_SHA ?? 'unknown',
    },
    null,
    2,
  ) + '\n',
);

process.stdout.write(`build OK — wrote ${distDir}\n`);
