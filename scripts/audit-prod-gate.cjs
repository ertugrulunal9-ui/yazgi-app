#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ALLOWLIST_PATH = path.join(process.cwd(), 'security', 'audit-allowlist.json');
const DEFAULT_SEVERITIES = new Set(['high', 'critical']);

function loadAllowlist() {
  if (!fs.existsSync(ALLOWLIST_PATH)) {
    throw new Error(`Allowlist file not found: ${ALLOWLIST_PATH}`);
  }

  const raw = fs.readFileSync(ALLOWLIST_PATH, 'utf8').replace(/^\uFEFF/, '');
  const parsed = JSON.parse(raw);
  const policy = parsed.policy || {};
  const severities = new Set(policy.failOnSeverity || DEFAULT_SEVERITIES);
  const allowedAdvisories = new Set(
    (parsed.allowedAdvisories || [])
      .map((item) => item && item.url)
      .filter(Boolean)
  );

  return { severities, allowedAdvisories };
}

function runAudit() {
  try {
    const output = execSync('npm audit --omit=dev --json', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return JSON.parse(output || '{}');
  } catch (error) {
    const output = error.stdout ? String(error.stdout) : '';
    if (!output.trim()) {
      throw error;
    }
    return JSON.parse(output);
  }
}

function collectAdvisoryUrls(name, vulnerabilities, cache, trail = new Set()) {
  if (cache.has(name)) {
    return cache.get(name);
  }

  if (trail.has(name)) {
    return new Set();
  }

  trail.add(name);
  const advisoryUrls = new Set();
  const vulnerability = vulnerabilities[name];

  if (vulnerability && Array.isArray(vulnerability.via)) {
    for (const via of vulnerability.via) {
      if (typeof via === 'string') {
        const nested = collectAdvisoryUrls(via, vulnerabilities, cache, new Set(trail));
        for (const url of nested) {
          advisoryUrls.add(url);
        }
        continue;
      }

      if (!via || typeof via !== 'object') {
        continue;
      }

      if (typeof via.url === 'string' && via.url.length > 0) {
        advisoryUrls.add(via.url);
        continue;
      }

      if (typeof via.name === 'string' && vulnerabilities[via.name]) {
        const nested = collectAdvisoryUrls(via.name, vulnerabilities, cache, new Set(trail));
        for (const url of nested) {
          advisoryUrls.add(url);
        }
      }
    }
  }

  cache.set(name, advisoryUrls);
  return advisoryUrls;
}

function main() {
  const { severities, allowedAdvisories } = loadAllowlist();
  const report = runAudit();
  const vulnerabilities = report.vulnerabilities || {};
  const cache = new Map();
  const failures = [];
  const matchedAllowlistedAdvisories = new Set();

  for (const [name, vulnerability] of Object.entries(vulnerabilities)) {
    const severity = vulnerability && vulnerability.severity;
    if (!severities.has(severity)) {
      continue;
    }

    const advisoryUrls = collectAdvisoryUrls(name, vulnerabilities, cache);
    const unknownAdvisories = [...advisoryUrls].filter((url) => !allowedAdvisories.has(url));
    const isUnclassified = advisoryUrls.size === 0;

    for (const url of advisoryUrls) {
      if (allowedAdvisories.has(url)) {
        matchedAllowlistedAdvisories.add(url);
      }
    }

    if (isUnclassified || unknownAdvisories.length > 0) {
      failures.push({
        name,
        severity,
        advisoryUrls: [...advisoryUrls],
        unknownAdvisories,
        isUnclassified,
      });
    }
  }

  if (failures.length > 0) {
    console.error('Audit gate failed. Non-allowlisted production vulnerabilities detected.');
    for (const failure of failures) {
      console.error(`- ${failure.name} (${failure.severity})`);
      if (failure.isUnclassified) {
        console.error('  advisory: unknown (could not resolve root advisory URL)');
      } else {
        for (const url of failure.unknownAdvisories) {
          console.error(`  advisory: ${url}`);
        }
      }
    }
    process.exit(1);
  }

  console.log('Audit gate passed. High/Critical production vulnerabilities are allowlisted only.');
  if (matchedAllowlistedAdvisories.size > 0) {
    console.log('Active allowlisted advisories:');
    for (const url of [...matchedAllowlistedAdvisories].sort()) {
      console.log(`- ${url}`);
    }
  }
}

main();
