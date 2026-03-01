# Simulation Config Schema

Use this schema with `scripts/run_simulation.py`.

## Required Fields

```json
{
  "initial_state": {
    "cash": 1000,
    "daily_income": 50
  },
  "step_updates": [
    { "var": "cash", "expr": "cash + daily_income" }
  ]
}
```

- `initial_state` (object): Initial variables used by expressions.
- `step_updates` (array): Ordered updates executed every step.
  - `var` (string): State variable to write.
  - `expr` (string): Formula evaluated with current state.

## Optional Fields

- `runs` (int, default `1000`): Number of simulation runs.
- `seed` (int, default `42`): Base seed for reproducible batches.
- `max_steps` (int, default `3650`): Max step count per run.
- `events` (array): Conditional random or deterministic events.
  - `label` (string, optional): Event name.
  - `when` (string): Condition expression.
  - `updates` (array): Same format as `step_updates`.
- `milestones` (object): Map of milestone name to condition expression.
- `stop_condition` (string): End a run early when condition is true.
- `collect` (object): Extra metrics to calculate at run end.

## Expression Context

Every expression can read:

- State variables from `initial_state` and updates.
- `step`: Current step index (1-based).
- `run`: Current run index (1-based).

Available functions:

- `abs`, `min`, `max`, `round`, `int`, `float`, `pow`
- `sqrt`, `log`, `exp`, `ceil`, `floor`, `clamp`
- `random`, `uniform`, `randint`

Constants:

- `pi`, `e`

## Command Examples

```bash
python .agents/skills/simulasyon-testleri/scripts/run_simulation.py --config .agents/skills/simulasyon-testleri/references/billionaire-example.json --runs 1000 --seed 42 --target billionaire
```

```bash
python .agents/skills/simulasyon-testleri/scripts/run_simulation.py --config my-config.json --runs 5000 --output simulation-result.json --include-runs
```

```bash
python .agents/skills/simulasyon-testleri/scripts/sweep_billionaire_tuning.py --config .agents/skills/simulasyon-testleri/references/billionaire-template-with-sink.json --runs 400 --target billionaire --target-median-min 250 --target-median-max 350 --target-p90-max 500 --write-best-config .agents/skills/simulasyon-testleri/references/billionaire-balanced.json
```

```bash
python .agents/skills/simulasyon-testleri/scripts/sweep_billionaire_tuning.py --config .agents/skills/simulasyon-testleri/references/billionaire-template-with-sink.json --runs 220 --seed 42 --max-steps 600 --target billionaire --growth-grid 0.0024,0.0030,0.0036 --boost-chance-grid 0.04,0.07 --boost-multiplier-grid 1.25,1.45 --upkeep-grid 0.0008,0.0012,0.0018 --crash-chance-grid 0.03,0.05 --crash-multiplier-grid 0.55,0.7 --target-median-min 380 --target-median-max 560 --target-p90-max 600 --target-success-min 0.65 --target-success-max 0.95 --write-best-config .agents/skills/simulasyon-testleri/references/billionaire-risky-deadline-balanced.json
```

## Output Interpretation

- `success_rate`: Fraction of runs that reached milestone.
- `median_step`: Typical step to reach milestone.
- `p90_step`: Conservative estimate (90% of successful runs are at or below this step).
- `final_state` summary: End-state distribution across all runs.
