#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const reportDir = path.join(repoRoot, 'reports', 'qa');

const commands = [
  {
    id: 'typecheck',
    command: 'npm run typecheck',
  },
  {
    id: 'premium-targeted-tests',
    command:
      'npm test -- --watch=false __tests__/services/subscriptionManager.test.ts __tests__/services/monetization.test.ts __tests__/config/featureFlags.test.ts',
  },
];

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function runCommand(step) {
  const startedAt = new Date();
  const startedMs = Date.now();

  try {
    execSync(step.command, {
      cwd: repoRoot,
      stdio: 'inherit',
      env: process.env,
      shell: true,
    });

    return {
      id: step.id,
      command: step.command,
      status: 'PASS',
      startedAt,
      endedAt: new Date(),
      durationSec: ((Date.now() - startedMs) / 1000).toFixed(2),
    };
  } catch (error) {
    const exitCode = typeof error?.status === 'number' ? error.status : 1;

    return {
      id: step.id,
      command: step.command,
      status: 'FAIL',
      exitCode,
      startedAt,
      endedAt: new Date(),
      durationSec: ((Date.now() - startedMs) / 1000).toFixed(2),
    };
  }
}

function toIso(value) {
  return value.toISOString();
}

function getTodayStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildMarkdown(results) {
  const hasFail = results.some((step) => step.status === 'FAIL');
  const statusLine = hasFail ? 'FAIL' : 'PASS';
  const generatedAt = new Date();

  const rows = results
    .map((step) => {
      const details = step.status === 'FAIL' ? `exit=${step.exitCode}` : '-';
      return `| ${step.id} | \`${step.command}\` | ${step.status} | ${step.durationSec}s | ${details} |`;
    })
    .join('\n');

  return [
    '# W3-T4 Premium Preflight Report',
    '',
    `Generated at: ${toIso(generatedAt)}`,
    `Overall status: **${statusLine}**`,
    '',
    '## Steps',
    '',
    '| Step | Command | Status | Duration | Details |',
    '| --- | --- | --- | ---: | --- |',
    rows,
    '',
    '## Next Action',
    '',
    hasFail
      ? 'Fix failing step(s) before manual sandbox QA execution.'
      : 'Proceed with manual sandbox QA cases from `W3-T4_PREMIUM_QA_RUNBOOK_2026-03-03.md`.',
    '',
  ].join('\n');
}

function main() {
  ensureDirectory(reportDir);

  const results = commands.map(runCommand);
  const markdown = buildMarkdown(results);

  const dateStamp = getTodayStamp();
  const datedReportPath = path.join(reportDir, `w3-t4-preflight-${dateStamp}.md`);
  const latestReportPath = path.join(reportDir, 'w3-t4-preflight-latest.md');

  fs.writeFileSync(datedReportPath, markdown, 'utf8');
  fs.writeFileSync(latestReportPath, markdown, 'utf8');

  console.log(`\n[qa] W3-T4 preflight report written:`);
  console.log(`[qa] - ${datedReportPath}`);
  console.log(`[qa] - ${latestReportPath}`);

  const hasFail = results.some((step) => step.status === 'FAIL');
  process.exit(hasFail ? 1 : 0);
}

main();
