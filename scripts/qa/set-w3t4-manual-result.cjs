#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const inputPath = path.join(repoRoot, 'reports', 'qa', 'w3-t4-manual-results-input.json');

const VALID_STATUSES = new Set(['PASS', 'FAIL', 'BLOCKED', 'PENDING']);
const VALID_PLATFORMS = new Set(['ios', 'android']);

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    id: '',
    platform: '',
    status: '',
    evidence: [],
    notes: '',
    defectId: '',
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--id' && next) {
      parsed.id = next.trim().toUpperCase();
      i += 1;
      continue;
    }
    if (arg === '--platform' && next) {
      parsed.platform = next.trim().toLowerCase();
      i += 1;
      continue;
    }
    if (arg === '--status' && next) {
      parsed.status = next.trim().toUpperCase();
      i += 1;
      continue;
    }
    if (arg === '--evidence' && next) {
      parsed.evidence.push(next.trim());
      i += 1;
      continue;
    }
    if (arg === '--notes' && next) {
      parsed.notes = next;
      i += 1;
      continue;
    }
    if (arg === '--defect' && next) {
      parsed.defectId = next.trim();
      i += 1;
      continue;
    }
  }

  return parsed;
}

function validateInput(input) {
  if (!input.id) throw new Error('Missing --id (e.g. TC-P0-01)');
  if (!VALID_PLATFORMS.has(input.platform)) {
    throw new Error('Invalid --platform (ios|android)');
  }
  if (!VALID_STATUSES.has(input.status)) {
    throw new Error('Invalid --status (PASS|FAIL|BLOCKED|PENDING)');
  }
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function normalizeResult(input) {
  return {
    id: input.id,
    platform: input.platform,
    status: input.status,
    evidence: input.evidence,
    defectId: input.defectId,
    notes: input.notes,
  };
}

function main() {
  const parsed = parseArgs();
  validateInput(parsed);

  const json = readJson(inputPath);
  if (!Array.isArray(json.results)) {
    json.results = [];
  }

  const nextResult = normalizeResult(parsed);

  const index = json.results.findIndex(
    (item) => item && item.id === parsed.id && item.platform === parsed.platform
  );

  if (index >= 0) {
    const prev = json.results[index] || {};
    const mergedEvidence = [
      ...((Array.isArray(prev.evidence) ? prev.evidence : []).filter((entry) => typeof entry === 'string' && entry.length > 0)),
      ...nextResult.evidence,
    ];

    json.results[index] = {
      ...prev,
      ...nextResult,
      evidence: mergedEvidence,
    };
  } else {
    json.results.push(nextResult);
  }

  writeJson(inputPath, json);

  console.log(`[qa] Updated ${parsed.id} (${parsed.platform}) => ${parsed.status}`);
  console.log(`[qa] Input file: ${inputPath}`);
  console.log('[qa] Next: npm run qa:w3t4:manual:report');
}

main();
