# Economy Tuning Implementation Plan

Goal: Make billionaire progression less guaranteed and move pacing into a target window using repeatable simulation.

## Plan

1. Reduce growth acceleration levers.
- Lower effective compounding pressure by tuning `growth_rate`, `ad_boost_chance`, `ad_boost_multiplier`.

2. Add explicit money sink.
- Introduce per-step `upkeep_rate` in the simulation equation:
  - `cash = cash + daily_income - max(0, cash * upkeep_rate)`

3. Automate parameter search.
- Sweep parameter grid and rank candidates by:
  - target median day range
  - p90 day cap
  - minimum success rate

4. Lock candidate and verify robustness.
- Export best config.
- Re-run with 1000 simulations and multiple seeds.

## Applied

- Added sink-enabled template: `billionaire-template-with-sink.json`
- Added grid search script: `scripts/sweep_billionaire_tuning.py`
- Generated tuned config: `billionaire-balanced.json`
- Verified tuned config with seeds `7`, `42`, `99` (1000 runs each)
- Added risky deadline profile with lower success target:
  - `billionaire-risky-deadline-balanced.json`
  - `billionaire-risky-deadline-sweep-output.json`
