#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const defaultInput = path.join(repoRoot, 'reports', 'qa', 'w3-t4-manual-results-input.json');
const defaultOutput = path.join(repoRoot, 'reports', 'qa', 'w3-t4-manual-results-latest.md');
const validationReportPath = path.join(repoRoot, 'W3-T4_PREMIUM_QA_VALIDATION_REPORT_2026-03-03.md');

const P0_CASES = [
  'TC-P0-01',
  'TC-P0-02',
  'TC-P0-03',
  'TC-P0-04',
  'TC-P0-05',
  'TC-P0-06',
  'TC-P0-07',
  'TC-P0-08',
];

const P1_CASES = [
  'TC-P1-01',
  'TC-P1-02',
  'TC-P1-03',
];

const ALL_CASES = [...P0_CASES, ...P1_CASES];
const PLATFORMS = ['ios', 'android'];
const VALID_STATUSES = new Set(['PASS', 'FAIL', 'BLOCKED', 'PENDING']);

function getLocalDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    input: defaultInput,
    output: defaultOutput,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--input' && args[i + 1]) {
      parsed.input = path.resolve(args[i + 1]);
      i += 1;
      continue;
    }
    if (arg === '--output' && args[i + 1]) {
      parsed.output = path.resolve(args[i + 1]);
      i += 1;
      continue;
    }
  }

  return parsed;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function normalizeStatus(value) {
  if (typeof value !== 'string') return 'PENDING';
  const normalized = value.trim().toUpperCase();
  return VALID_STATUSES.has(normalized) ? normalized : 'PENDING';
}

function loadInput(inputPath) {
  const raw = fs.readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, '');
  const parsed = JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Manual results input must be a JSON object.');
  }

  const meta = parsed.meta && typeof parsed.meta === 'object' ? parsed.meta : {};
  const results = Array.isArray(parsed.results) ? parsed.results : [];

  const index = new Map();
  for (const item of results) {
    if (!item || typeof item !== 'object') continue;

    const id = typeof item.id === 'string' ? item.id.trim().toUpperCase() : '';
    const platform = typeof item.platform === 'string' ? item.platform.trim().toLowerCase() : '';
    if (!id || !platform) continue;

    index.set(`${id}:${platform}`, {
      id,
      platform,
      status: normalizeStatus(item.status),
      evidence: Array.isArray(item.evidence)
        ? item.evidence.filter((entry) => typeof entry === 'string' && entry.trim().length > 0)
        : [],
      notes: typeof item.notes === 'string' ? item.notes.trim() : '',
      defectId: typeof item.defectId === 'string' ? item.defectId.trim() : '',
    });
  }

  return { meta, index };
}

function buildRows(index) {
  const rows = [];

  for (const id of ALL_CASES) {
    for (const platform of PLATFORMS) {
      const key = `${id}:${platform}`;
      const entry = index.get(key) || {
        id,
        platform,
        status: 'PENDING',
        evidence: [],
        notes: '',
        defectId: '',
      };

      rows.push(entry);
    }
  }

  return rows;
}

function summarize(rows) {
  const counts = {
    PASS: 0,
    FAIL: 0,
    BLOCKED: 0,
    PENDING: 0,
  };

  for (const row of rows) {
    counts[row.status] += 1;
  }

  const p0Rows = rows.filter((row) => P0_CASES.includes(row.id));
  const p0AllPass = p0Rows.every((row) => row.status === 'PASS');

  return {
    counts,
    p0AllPass,
  };
}

function formatList(items) {
  if (!items || items.length === 0) return '-';
  return items.join('<br>');
}

function buildMarkdown(meta, rows, summary) {
  const now = new Date().toISOString();
  const tester = typeof meta.tester === 'string' && meta.tester.trim().length > 0
    ? meta.tester.trim()
    : 'TBD';
  const build = typeof meta.build === 'string' && meta.build.trim().length > 0
    ? meta.build.trim()
    : 'TBD';
  const executionDate = typeof meta.executionDate === 'string' && meta.executionDate.trim().length > 0
    ? meta.executionDate.trim()
    : getLocalDateStamp();

  const rowsMarkdown = rows
    .map((row) => `| ${row.id} | ${row.platform} | ${row.status} | ${formatList(row.evidence)} | ${row.defectId || '-'} | ${row.notes || '-'} |`)
    .join('\n');

  return [
    '# W3-T4 Manual Sandbox QA Results',
    '',
    `Generated at: ${now}`,
    `Execution date: ${executionDate}`,
    `Tester: ${tester}`,
    `Build: ${build}`,
    '',
    '## Summary',
    '',
    `- PASS: ${summary.counts.PASS}`,
    `- FAIL: ${summary.counts.FAIL}`,
    `- BLOCKED: ${summary.counts.BLOCKED}`,
    `- PENDING: ${summary.counts.PENDING}`,
    `- P0 all pass on both platforms: ${summary.p0AllPass ? 'YES' : 'NO'}`,
    '',
    '## Case Results',
    '',
    '| Test Case | Platform | Status | Evidence | Defect ID | Notes |',
    '| --- | --- | --- | --- | --- | --- |',
    rowsMarkdown,
    '',
  ].join('\n');
}

function buildValidationBlock(rows, summary) {
  const p0Rows = rows.filter((row) => P0_CASES.includes(row.id));
  const p1Rows = rows.filter((row) => P1_CASES.includes(row.id));

  const toTable = (items) => [
    '| Test Case | iOS | Android | Evidence | Defect |',
    '| --- | --- | --- | --- | --- |',
    ...ALL_CASES.filter((id) => items.some((row) => row.id === id)).map((id) => {
      const ios = items.find((row) => row.id === id && row.platform === 'ios');
      const android = items.find((row) => row.id === id && row.platform === 'android');

      const evidence = [
        ...(ios?.evidence || []),
        ...(android?.evidence || []),
      ];
      const defect = [ios?.defectId, android?.defectId].filter(Boolean);

      return `| ${id} | ${ios?.status || 'PENDING'} | ${android?.status || 'PENDING'} | ${formatList(evidence)} | ${defect.length > 0 ? defect.join(', ') : '-'} |`;
    }),
    '',
  ].join('\n');

  return [
    '## 4. Manual Sandbox Execution Status',
    '',
    `Summary: PASS=${summary.counts.PASS}, FAIL=${summary.counts.FAIL}, BLOCKED=${summary.counts.BLOCKED}, PENDING=${summary.counts.PENDING}`,
    '',
    '### P0 Cases',
    '',
    toTable(p0Rows),
    '### P1 Cases',
    '',
    toTable(p1Rows),
    summary.p0AllPass
      ? 'P0 decision: READY for W3-T4 completion gate.'
      : 'P0 decision: NOT READY (all P0 cases must be PASS on iOS + Android).',
    '',
  ].join('\n');
}

function updateValidationReport(rows, summary) {
  if (!fs.existsSync(validationReportPath)) {
    console.warn(`[qa] Validation report not found: ${validationReportPath}`);
    return;
  }

  const markerStart = '<!-- MANUAL_RESULTS_START -->';
  const markerEnd = '<!-- MANUAL_RESULTS_END -->';

  const original = fs.readFileSync(validationReportPath, 'utf8');
  const startIndex = original.indexOf(markerStart);
  const endIndex = original.indexOf(markerEnd);

  if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
    console.warn('[qa] Manual result markers not found in validation report.');
    return;
  }

  const before = original.slice(0, startIndex + markerStart.length);
  const after = original.slice(endIndex);
  const middle = `\n\n${buildValidationBlock(rows, summary)}`;

  fs.writeFileSync(validationReportPath, `${before}${middle}${after}`, 'utf8');
}

function main() {
  const args = parseArgs();
  const { meta, index } = loadInput(args.input);
  const rows = buildRows(index);
  const summary = summarize(rows);
  const markdown = buildMarkdown(meta, rows, summary);

  ensureDirectory(path.dirname(args.output));
  fs.writeFileSync(args.output, markdown, 'utf8');

  const dateStamp = getLocalDateStamp();
  const datedPath = path.join(path.dirname(args.output), `w3-t4-manual-results-${dateStamp}.md`);
  fs.writeFileSync(datedPath, markdown, 'utf8');

  updateValidationReport(rows, summary);

  console.log('[qa] Manual QA report generated:');
  console.log(`[qa] - ${args.output}`);
  console.log(`[qa] - ${datedPath}`);
  console.log(`[qa] Validation report updated: ${validationReportPath}`);

  process.exit(summary.p0AllPass ? 0 : 1);
}

main();
