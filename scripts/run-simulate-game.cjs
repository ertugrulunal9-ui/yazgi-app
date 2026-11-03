const fs = require('fs');
const path = require('path');
const ts = require('typescript');

require.extensions['.ts'] = function registerTs(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    },
    fileName: filename,
  });

  module._compile(compiled.outputText, filename);
};

global.__DEV__ = false;

const ciMode = process.argv.includes('--ci');

// CI'da simülasyon sabit tohumla koşar: aynı kod her seferinde aynı sonucu verir. Tohumsuzken
// Riskçi bot %15 sınırında koddan bağımsız kırılıyordu. SIMULATION_SEED=<sayı> başka tohum,
// SIMULATION_SEED=random tohumsuz koşu. Simülatör ve oyun kodu rastgeleliği Math.random'dan alır.
const DEFAULT_CI_SEED = 20261104;
const resolveSeed = () => {
  const raw = process.env.SIMULATION_SEED;
  if (raw === 'random') return null;
  if (raw) {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return ciMode ? DEFAULT_CI_SEED : null;
};
const seed = resolveSeed();
if (seed !== null) {
  // mulberry32
  let state = seed >>> 0;
  Math.random = () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
console.log(`[simulate] seed: ${seed === null ? 'random' : seed}`);

const simulationModule = require(path.resolve(__dirname, '../src/tests/simulateGame.ts'));
const runCount = Number(process.env.SIMULATION_RUNS || 50);
const runCountSafe = Number.isFinite(runCount) && runCount > 0 ? Math.floor(runCount) : 50;
const DEFAULT_CI_THRESHOLDS = {
  // Tuned after Phase 5 balance updates: BALANCED profile now lands around 62-84.
  balancedMinSuccess: 60,
  balancedMaxSuccess: 90,
  balancedMaxBreakdown: 12,
  // RISKTAKER profile is intentionally less stable and averages around 16-34 success.
  risktakerMinSuccess: 15,
  risktakerMaxBreakdown: 15, // debt threshold 95 + stat floor fix sonrasi: 35% -> ~9-13%
};

const readNumberEnv = (name, fallback) => {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

if (simulationModule && typeof simulationModule.runSideBySideSimulation === 'function') {
  const report = simulationModule.runSideBySideSimulation(runCountSafe);

  if (ciMode) {
    const balancedMinSuccess = readNumberEnv(
      'SIM_BALANCED_MIN_SUCCESS',
      DEFAULT_CI_THRESHOLDS.balancedMinSuccess
    );
    const balancedMaxSuccess = readNumberEnv(
      'SIM_BALANCED_MAX_SUCCESS',
      DEFAULT_CI_THRESHOLDS.balancedMaxSuccess
    );
    const balancedMaxBreakdown = readNumberEnv(
      'SIM_BALANCED_MAX_BREAKDOWN',
      DEFAULT_CI_THRESHOLDS.balancedMaxBreakdown
    );
    const risktakerMinSuccess = readNumberEnv(
      'SIM_RISKTAKER_MIN_SUCCESS',
      DEFAULT_CI_THRESHOLDS.risktakerMinSuccess
    );
    const risktakerMaxBreakdown = readNumberEnv(
      'SIM_RISKTAKER_MAX_BREAKDOWN',
      DEFAULT_CI_THRESHOLDS.risktakerMaxBreakdown
    );

    const balancedSuccess = report?.balanced?.targetSuccessRate ?? 0;
    const balancedBreakdown = report?.balanced?.breakdownRate ?? 100;
    const risktakerSuccess = report?.risktaker?.targetSuccessRate ?? 0;
    const risktakerBreakdown = report?.risktaker?.breakdownRate ?? 100;

    const failures = [];

    console.log(
      `[simulate:ci] Active thresholds -> Balanced success: ${balancedMinSuccess}-${balancedMaxSuccess}, Balanced breakdown <= ${balancedMaxBreakdown}, Risktaker success >= ${risktakerMinSuccess}, Risktaker breakdown <= ${risktakerMaxBreakdown}`
    );

    if (balancedSuccess < balancedMinSuccess || balancedSuccess > balancedMaxSuccess) {
      failures.push(
        `Balanced success out of range: ${balancedSuccess} (expected ${balancedMinSuccess}-${balancedMaxSuccess})`
      );
    }

    if (balancedBreakdown > balancedMaxBreakdown) {
      failures.push(
        `Balanced breakdown too high: ${balancedBreakdown} (max ${balancedMaxBreakdown})`
      );
    }

    if (risktakerSuccess < risktakerMinSuccess) {
      failures.push(
        `Risktaker success too low: ${risktakerSuccess} (min ${risktakerMinSuccess})`
      );
    }

    if (risktakerBreakdown > risktakerMaxBreakdown) {
      failures.push(
        `Risktaker breakdown too high: ${risktakerBreakdown} (max ${risktakerMaxBreakdown})`
      );
    }

    if (failures.length > 0) {
      failures.forEach(msg => console.error(`[simulate:ci] ${msg}`));
      process.exitCode = 1;
    } else {
      console.log('[simulate:ci] Simulation thresholds passed.');
    }
  }
} else if (simulationModule && typeof simulationModule.runAutoPlayerSimulation === 'function') {
  simulationModule.runAutoPlayerSimulation(runCountSafe);
}
