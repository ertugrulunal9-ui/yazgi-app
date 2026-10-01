import { spawnSync } from 'node:child_process';
import path from 'node:path';

const runnerPath = path.resolve(__dirname, '../../scripts/run-simulate-game.cjs');

const runSimulation = (
  overrides: Record<string, string> = {},
  useDefaultCiSeed = false,
) => {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    SIMULATION_RUNS: '30',
    SIMULATION_SEED: '12345',
    ...overrides,
  };
  if (useDefaultCiSeed) delete env.SIMULATION_SEED;

  return spawnSync(process.execPath, [runnerPath, '--ci'], {
    encoding: 'utf8',
    env,
    timeout: 30000,
  });
};

describe('simulation runner CI guardrail', () => {
  it('produces identical reports for the same seed', () => {
    const first = runSimulation({}, true);
    const second = runSimulation({}, true);

    expect(first.error).toBeUndefined();
    expect(second.error).toBeUndefined();
    expect(first.status).toBe(second.status);
    expect(first.stdout).toContain('[simulate:ci] Seed: 12345');
    expect(first.stdout).toBe(second.stdout);
  });

  it('continues to fail when a configured threshold is impossible', () => {
    const result = runSimulation({
      SIMULATION_SEED: '67890',
      SIM_RISKTAKER_MIN_SUCCESS: '101',
    });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stdout).toContain('[simulate:ci] Seed: 67890');
    expect(result.stderr).toContain('Risktaker success too low');
  });
});
