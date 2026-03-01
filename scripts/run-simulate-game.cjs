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

const simulationModule = require(path.resolve(__dirname, '../src/tests/simulateGame.ts'));
const runCount = Number(process.env.SIMULATION_RUNS || 50);
const runCountSafe = Number.isFinite(runCount) && runCount > 0 ? Math.floor(runCount) : 50;
const ciMode = process.argv.includes('--ci');
const DEFAULT_CI_THRESHOLDS = {
  balancedMinSuccess: 20,
  balancedMaxSuccess: 60,
  balancedMaxBreakdown: 12,
  risktakerMinSuccess: 20,
  risktakerMaxBreakdown: 55,
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
