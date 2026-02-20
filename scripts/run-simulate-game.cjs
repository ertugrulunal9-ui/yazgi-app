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

if (simulationModule && typeof simulationModule.runSideBySideSimulation === 'function') {
  const report = simulationModule.runSideBySideSimulation(runCountSafe);

  if (ciMode) {
    const balancedMinSuccess = Number(process.env.SIM_BALANCED_MIN_SUCCESS || 55);
    const balancedMaxSuccess = Number(process.env.SIM_BALANCED_MAX_SUCCESS || 95);
    const balancedMaxBreakdown = Number(process.env.SIM_BALANCED_MAX_BREAKDOWN || 30);
    const risktakerMinSuccess = Number(process.env.SIM_RISKTAKER_MIN_SUCCESS || 45);
    const risktakerMaxBreakdown = Number(process.env.SIM_RISKTAKER_MAX_BREAKDOWN || 70);

    const balancedSuccess = report?.balanced?.targetSuccessRate ?? 0;
    const balancedBreakdown = report?.balanced?.breakdownRate ?? 100;
    const risktakerSuccess = report?.risktaker?.targetSuccessRate ?? 0;
    const risktakerBreakdown = report?.risktaker?.breakdownRate ?? 100;

    const failures = [];

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
