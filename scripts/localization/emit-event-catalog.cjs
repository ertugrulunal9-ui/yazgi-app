#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function toTsObject(value, indent = 2) {
  const pad = ' '.repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const lines = ['['];
    value.forEach(entry => {
      lines.push(`${pad}${toTsObject(entry, indent + 2)},`);
    });
    lines.push(`${' '.repeat(indent - 2)}]`);
    return lines.join('\n');
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return '{}';

    const lines = ['{'];
    entries.forEach(([key, child]) => {
      const keyRepr = /^[A-Za-z_][A-Za-z0-9_]*$/.test(key)
        ? key
        : JSON.stringify(key);
      lines.push(`${pad}${keyRepr}: ${toTsObject(child, indent + 2)},`);
    });
    lines.push(`${' '.repeat(indent - 2)}}`);
    return lines.join('\n');
  }

  return JSON.stringify(value, null, 0);
}

function main() {
  const [inputPath, outputPath, exportName] = process.argv.slice(2);

  if (!inputPath || !outputPath || !exportName) {
    console.error('Usage: node scripts/localization/emit-event-catalog.cjs <input.json> <output.ts> <exportName>');
    process.exit(1);
  }

  const absoluteInput = path.resolve(inputPath);
  const absoluteOutput = path.resolve(outputPath);
  const catalog = JSON.parse(fs.readFileSync(absoluteInput, 'utf8'));
  const tsBody = toTsObject(catalog, 2);
  const output = [
    "import type { EventTranslationCatalog } from './types';",
    '',
    '// Auto-generated from scripts/localization/event-source-catalog.json',
    `export const ${exportName}: EventTranslationCatalog = ${tsBody};`,
    '',
  ].join('\n');

  fs.writeFileSync(absoluteOutput, output, 'utf8');
  console.log(`wrote ${path.relative(process.cwd(), absoluteOutput)}`);
}

main();
