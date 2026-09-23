#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const PACKAGE_JSON_PATH = path.join(process.cwd(), 'package.json');
const FORBIDDEN_VERSIONS = new Set(['latest']);

function readPackageJson() {
  const raw = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
  return JSON.parse(raw);
}

function collectViolations(map, label) {
  if (!map || typeof map !== 'object') {
    return [];
  }

  const violations = [];
  for (const [name, version] of Object.entries(map)) {
    const normalized = String(version).trim().toLowerCase();
    if (FORBIDDEN_VERSIONS.has(normalized)) {
      violations.push(`${label}.${name} -> "${version}"`);
    }
  }
  return violations;
}

function main() {
  const pkg = readPackageJson();
  const violations = [
    ...collectViolations(pkg.dependencies, 'dependencies'),
    ...collectViolations(pkg.devDependencies, 'devDependencies'),
    ...collectViolations(pkg.optionalDependencies, 'optionalDependencies'),
  ];

  if (violations.length > 0) {
    console.error('Dependency policy failed. Forbidden version tags found:');
    for (const line of violations) {
      console.error(`- ${line}`);
    }
    process.exit(1);
  }

  console.log('Dependency policy passed. No forbidden version tags found.');
}

main();
