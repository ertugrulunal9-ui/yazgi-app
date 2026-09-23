#!/usr/bin/env python3
"""Grid-search economy tuning for billionaire milestone pacing."""

from __future__ import annotations

import argparse
import copy
import json
import math
from itertools import product
from pathlib import Path
from typing import Any, Dict, List

from run_simulation import execute_config, load_config


def parse_float_grid(raw: str, name: str) -> List[float]:
    values: List[float] = []
    for token in raw.split(","):
        token = token.strip()
        if not token:
            continue
        try:
            values.append(float(token))
        except ValueError as exc:
            raise ValueError(f"Invalid numeric value in --{name}: '{token}'") from exc
    if not values:
        raise ValueError(f"--{name} must include at least one numeric value.")
    return values


def evaluate_candidate(
    milestone_stats: Dict[str, Any],
    median_min: float,
    median_max: float,
    p90_max: float,
    min_success: float,
    max_success: float | None,
) -> float:
    success = float(milestone_stats.get("success_rate") or 0.0)
    median = milestone_stats.get("median_step")
    p90 = milestone_stats.get("p90_step")

    if median is None or p90 is None:
        return 1e12

    center = (median_min + median_max) / 2.0
    score = abs(float(median) - center)

    if float(median) < median_min:
        score += (median_min - float(median)) * 15.0
    if float(median) > median_max:
        score += (float(median) - median_max) * 15.0
    if float(p90) > p90_max:
        score += (float(p90) - p90_max) * 6.0
    if success < min_success:
        score += (min_success - success) * 10000.0
    if max_success is not None and success > max_success:
        score += (success - max_success) * 10000.0

    return score


def apply_candidate_values(base_config: Dict[str, Any], values: Dict[str, float]) -> Dict[str, Any]:
    config = copy.deepcopy(base_config)
    initial_state = config.get("initial_state")
    if not isinstance(initial_state, dict):
        raise ValueError("Config must contain object 'initial_state'.")

    for key, value in values.items():
        initial_state[key] = value
    return config


def format_step(value: Any) -> str:
    if value is None:
        return "n/a"
    if isinstance(value, (int, float)):
        if math.isclose(value, round(value), abs_tol=1e-9):
            return str(int(round(value)))
        return f"{value:.2f}"
    return str(value)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Sweep growth/sink parameters and find configs near target billionaire pacing."
    )
    parser.add_argument("--config", required=True, help="Path to base scenario config JSON.")
    parser.add_argument("--target", default="billionaire", help="Milestone name to optimize.")
    parser.add_argument("--runs", type=int, default=400, help="Run count per candidate.")
    parser.add_argument("--seed", type=int, default=42, help="Base seed per candidate.")
    parser.add_argument("--max-steps", type=int, help="Override max steps from config.")
    parser.add_argument("--top", type=int, default=8, help="How many best candidates to print.")
    parser.add_argument(
        "--growth-grid",
        default="0.0024,0.0028,0.0032,0.0036",
        help="Comma-separated growth_rate values.",
    )
    parser.add_argument(
        "--boost-chance-grid",
        default="0.03,0.05,0.07",
        help="Comma-separated ad_boost_chance values.",
    )
    parser.add_argument(
        "--boost-multiplier-grid",
        default="1.2,1.35,1.5",
        help="Comma-separated ad_boost_multiplier values.",
    )
    parser.add_argument(
        "--upkeep-grid",
        default="0.0008,0.0012,0.0016",
        help="Comma-separated upkeep_rate values.",
    )
    parser.add_argument(
        "--crash-chance-grid",
        default="0.02",
        help="Comma-separated crash_chance values.",
    )
    parser.add_argument(
        "--crash-multiplier-grid",
        default="0.7",
        help="Comma-separated crash_multiplier values.",
    )
    parser.add_argument("--target-median-min", type=float, default=250.0)
    parser.add_argument("--target-median-max", type=float, default=350.0)
    parser.add_argument("--target-p90-max", type=float, default=500.0)
    parser.add_argument("--target-success-min", type=float, default=0.9)
    parser.add_argument(
        "--target-success-max",
        type=float,
        default=None,
        help="Optional upper bound for success_rate (e.g. 0.95 to avoid too-safe economy).",
    )
    parser.add_argument(
        "--min-success-rate",
        type=float,
        dest="target_success_min",
        help=argparse.SUPPRESS,
    )
    parser.add_argument(
        "--output",
        help="Optional path to write JSON result payload (ranking + best config).",
    )
    parser.add_argument(
        "--write-best-config",
        help="Optional path to write the best found config JSON.",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    base_config = load_config(Path(args.config))

    growth_grid = parse_float_grid(args.growth_grid, "growth-grid")
    boost_chance_grid = parse_float_grid(args.boost_chance_grid, "boost-chance-grid")
    boost_multiplier_grid = parse_float_grid(args.boost_multiplier_grid, "boost-multiplier-grid")
    upkeep_grid = parse_float_grid(args.upkeep_grid, "upkeep-grid")
    crash_chance_grid = parse_float_grid(args.crash_chance_grid, "crash-chance-grid")
    crash_multiplier_grid = parse_float_grid(args.crash_multiplier_grid, "crash-multiplier-grid")

    candidates = list(
        product(
            growth_grid,
            boost_chance_grid,
            boost_multiplier_grid,
            upkeep_grid,
            crash_chance_grid,
            crash_multiplier_grid,
        )
    )
    ranked: List[Dict[str, Any]] = []

    for idx, (
        growth_rate,
        boost_chance,
        boost_multiplier,
        upkeep_rate,
        crash_chance,
        crash_multiplier,
    ) in enumerate(candidates, start=1):
        values = {
            "growth_rate": growth_rate,
            "ad_boost_chance": boost_chance,
            "ad_boost_multiplier": boost_multiplier,
            "upkeep_rate": upkeep_rate,
            "crash_chance": crash_chance,
            "crash_multiplier": crash_multiplier,
        }
        config = apply_candidate_values(base_config, values)
        _prepared, _runs, summary = execute_config(
            config,
            runs_override=args.runs,
            seed_override=args.seed,
            max_steps_override=args.max_steps,
        )
        milestone_stats = summary["milestones"].get(args.target)
        if milestone_stats is None:
            raise ValueError(f"Target milestone '{args.target}' is not present in config.")

        score = evaluate_candidate(
            milestone_stats,
            median_min=args.target_median_min,
            median_max=args.target_median_max,
            p90_max=args.target_p90_max,
            min_success=args.target_success_min,
            max_success=args.target_success_max,
        )

        ranked.append(
            {
                "score": score,
                "params": values,
                "milestone": {
                    "success_rate": milestone_stats.get("success_rate"),
                    "median_step": milestone_stats.get("median_step"),
                    "p90_step": milestone_stats.get("p90_step"),
                    "mean_step": milestone_stats.get("mean_step"),
                },
            }
        )

        if idx % 12 == 0 or idx == len(candidates):
            print(f"[sweep] completed {idx}/{len(candidates)} candidates", flush=True)

    ranked.sort(key=lambda item: item["score"])
    top = ranked[: max(1, args.top)]

    print("=== Sweep Ranking ===", flush=True)
    for rank, item in enumerate(top, start=1):
        params = item["params"]
        milestone = item["milestone"]
        print(
            f"{rank}. score={item['score']:.2f} | "
            f"median={format_step(milestone['median_step'])} | "
            f"p90={format_step(milestone['p90_step'])} | "
            f"success={float(milestone['success_rate'] or 0):.1%} | "
            f"growth={params['growth_rate']} boost_chance={params['ad_boost_chance']} "
            f"boost_mult={params['ad_boost_multiplier']} upkeep={params['upkeep_rate']} "
            f"crash_chance={params['crash_chance']} crash_mult={params['crash_multiplier']}",
            flush=True,
        )

    best_params = top[0]["params"]
    best_config = apply_candidate_values(base_config, best_params)
    if args.max_steps is not None:
        best_config["max_steps"] = args.max_steps

    if args.write_best_config:
        best_path = Path(args.write_best_config)
        best_path.write_text(
            json.dumps(best_config, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        print(f"Saved best config to: {best_path}", flush=True)

    if args.output:
        payload = {
            "meta": {
                "target": args.target,
                "runs_per_candidate": args.runs,
                "seed": args.seed,
                "candidate_count": len(candidates),
                "max_steps_override": args.max_steps,
                "targets": {
                    "median_min": args.target_median_min,
                    "median_max": args.target_median_max,
                    "p90_max": args.target_p90_max,
                    "target_success_min": args.target_success_min,
                    "target_success_max": args.target_success_max,
                },
            },
            "top": top,
            "best_config": best_config,
        }
        out_path = Path(args.output)
        out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Saved sweep output to: {out_path}", flush=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
