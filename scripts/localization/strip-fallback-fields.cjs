#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const [, , targetFile, ...fieldNames] = process.argv;

if (!targetFile || fieldNames.length === 0) {
  console.error('Usage: node scripts/localization/strip-fallback-fields.cjs <file> <field> [field...]');
  process.exit(1);
}

const resolvedPath = path.resolve(targetFile);
let source = fs.readFileSync(resolvedPath, 'utf8');
const originalSource = source;

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const literalPattern = String.raw`(?:'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\`(?:[^\`\\]|\\.|\\\$\{[^}]*\})*\`)`;

let replacements = 0;

for (const fieldName of fieldNames) {
  const pattern = new RegExp(`(\\b${escapeRegExp(fieldName)}\\s*:\\s*)${literalPattern}`, 'g');
  source = source.replace(pattern, (_, prefix) => {
    replacements += 1;
    return `${prefix}''`;
  });
}

if (source === originalSource) {
  console.log(`No matching string fields found in ${resolvedPath}`);
  process.exit(0);
}

fs.writeFileSync(resolvedPath, source, 'utf8');
console.log(`Updated ${resolvedPath}: stripped ${replacements} field values.`);
