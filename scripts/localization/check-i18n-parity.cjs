#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');

const ROOT = process.cwd();
const MODULE_CACHE = new Map();

const resolveLocalModule = (fromFile, request) => {
  const basePath = path.resolve(path.dirname(fromFile), request);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    path.join(basePath, 'index.ts'),
    path.join(basePath, 'index.tsx'),
    path.join(basePath, 'index.js'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  throw new Error(`Cannot resolve local module "${request}" from "${fromFile}"`);
};

const transpileTs = (source, filename) => (
  ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      jsx: ts.JsxEmit.ReactJSX,
    },
    fileName: filename,
  }).outputText
);

const loadModule = (entryFile) => {
  const resolvedFile = path.resolve(entryFile);
  if (MODULE_CACHE.has(resolvedFile)) {
    return MODULE_CACHE.get(resolvedFile).exports;
  }

  const source = fs.readFileSync(resolvedFile, 'utf8');
  const transformed = transpileTs(source, resolvedFile);
  const moduleObject = { exports: {} };
  MODULE_CACHE.set(resolvedFile, moduleObject);

  const localRequire = (request) => {
    if (request.startsWith('.')) {
      const dependencyPath = resolveLocalModule(resolvedFile, request);
      return loadModule(dependencyPath);
    }
    return require(request);
  };

  const script = new vm.Script(transformed, { filename: resolvedFile });
  const context = vm.createContext({
    module: moduleObject,
    exports: moduleObject.exports,
    require: localRequire,
    __dirname: path.dirname(resolvedFile),
    __filename: resolvedFile,
    process,
    console,
    globalThis,
    Buffer,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  });

  script.runInContext(context);
  return moduleObject.exports;
};

const isRecord = (value) => value && typeof value === 'object' && !Array.isArray(value);

const collectLeafKeys = (record, prefix = '', sink = new Set()) => {
  Object.entries(record).forEach(([key, value]) => {
    const nextPath = prefix ? `${prefix}.${key}` : key;
    if (isRecord(value)) {
      collectLeafKeys(value, nextPath, sink);
      return;
    }
    sink.add(nextPath);
  });

  return sink;
};

const formatKeyPreview = (keys) => keys.slice(0, 20).map((key) => `  - ${key}`).join('\n');

const run = () => {
  const modulePath = path.join(ROOT, 'src', 'i18n', 'strings.ts');
  const loaded = loadModule(modulePath);
  const strings = loaded.strings;

  if (!strings || !isRecord(strings.tr) || !isRecord(strings.en)) {
    throw new Error('Unable to read locale dictionaries from src/i18n/strings.ts');
  }

  const trKeys = [...collectLeafKeys(strings.tr)];
  const enKeys = [...collectLeafKeys(strings.en)];

  const trKeySet = new Set(trKeys);
  const enKeySet = new Set(enKeys);

  const missingInEnglish = trKeys.filter((key) => !enKeySet.has(key)).sort();
  const missingInTurkish = enKeys.filter((key) => !trKeySet.has(key)).sort();

  if (missingInEnglish.length === 0 && missingInTurkish.length === 0) {
    console.log('[i18n:check] OK - locale key parity is valid.');
    console.log(`[i18n:check] leaf key count: tr=${trKeys.length} en=${enKeys.length}`);
    return;
  }

  console.error('[i18n:check] FAILED - locale key mismatch detected.');
  console.error(`[i18n:check] missing in en: ${missingInEnglish.length}`);
  if (missingInEnglish.length > 0) {
    console.error(formatKeyPreview(missingInEnglish));
  }
  console.error(`[i18n:check] missing in tr: ${missingInTurkish.length}`);
  if (missingInTurkish.length > 0) {
    console.error(formatKeyPreview(missingInTurkish));
  }

  process.exit(1);
};

run();
