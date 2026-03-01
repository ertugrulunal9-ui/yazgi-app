---
name: simulasyon-testleri
description: Run repeatable Monte Carlo simulation tests for game economy and progression balancing. Use when a user explains game rules and asks for questions like "simulate 1000 runs", "when does the player reach 1B", "time to milestone", "balance stress test", or "how randomness affects progression speed".
---

# Simulasyon Testleri

Convert game rules into a structured simulation config, run large batches quickly, and report milestone timing with median and percentile outputs.

## Workflow

1. Capture the model inputs.
- Define state variables (`cash`, `daily_income`, `cost`, etc.).
- Define per-step updates and random events.
- Define milestones (`cash >= 1_000_000_000`) and stop condition.

2. Build a JSON scenario.
- Create a config file by following `references/config-schema.md`.
- Start from `references/billionaire-example.json` and adapt formulas.

3. Run batch simulation.
- Execute:
```bash
python .agents/skills/simulasyon-testleri/scripts/run_simulation.py --config <path/to/config.json> --runs 1000 --seed 42
```
- Use fixed seed for reproducible balancing comparisons.

4. Sweep parameters when balancing target is known.
- For targets like "billionaire median day 250-350", run:
```bash
python .agents/skills/simulasyon-testleri/scripts/sweep_billionaire_tuning.py --config .agents/skills/simulasyon-testleri/references/billionaire-template-with-sink.json --runs 400 --seed 42 --target billionaire --target-median-min 250 --target-median-max 350 --target-p90-max 500 --write-best-config .agents/skills/simulasyon-testleri/references/billionaire-balanced.json
```
- Use `--output` to save a full ranking payload.

5. Report findings in balancing terms.
- Always include success rate, median day, and p90 day for each milestone.
- State assumptions explicitly (step length, formulas, random event probabilities).
- If target is missed, recommend one-variable-at-a-time tuning candidates.

6. Iterate quickly.
- Adjust one lever per iteration (income growth, event chance, upgrade cost).
- Re-run with same seed to isolate effect.
- Re-run with different seeds for robustness checks.

## Script

Use `scripts/run_simulation.py` as the default engine for repeated tests.

- Supports formula-based state updates using expressions.
- Supports random events with conditional triggers.
- Tracks first-hit milestone days per run.
- Produces summary statistics suitable for economy balancing decisions.

If rules cannot be represented with expression-based updates, create a custom runner in the task workspace and keep the same output format (success rate, median, p90, assumptions).
