#!/usr/bin/env python3
"""Run repeatable Monte Carlo simulations for formula-based game balancing."""

from __future__ import annotations

import argparse
import ast
import copy
import json
import math
import random
import statistics
import sys
from pathlib import Path
from typing import Any, Dict, List, Mapping

Number = int | float

ALLOWED_NODE_TYPES = (
    ast.Expression,
    ast.BoolOp,
    ast.BinOp,
    ast.UnaryOp,
    ast.Compare,
    ast.Call,
    ast.Name,
    ast.Load,
    ast.Constant,
    ast.IfExp,
    ast.And,
    ast.Or,
    ast.Not,
    ast.Eq,
    ast.NotEq,
    ast.Lt,
    ast.LtE,
    ast.Gt,
    ast.GtE,
    ast.Add,
    ast.Sub,
    ast.Mult,
    ast.Div,
    ast.FloorDiv,
    ast.Mod,
    ast.Pow,
    ast.USub,
    ast.UAdd,
)

SAFE_CALL_NAMES = {
    "abs",
    "min",
    "max",
    "round",
    "int",
    "float",
    "pow",
    "sqrt",
    "log",
    "exp",
    "ceil",
    "floor",
    "clamp",
    "random",
    "uniform",
    "randint",
}


def positive_int(value: Any, field_name: str) -> int:
    if not isinstance(value, int) or isinstance(value, bool) or value <= 0:
        raise ValueError(f"'{field_name}' must be a positive integer.")
    return value


def is_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def percentile(values: List[Number], pct: float) -> float | None:
    if not values:
        return None
    ordered = sorted(float(v) for v in values)
    if len(ordered) == 1:
        return ordered[0]
    rank = (len(ordered) - 1) * (pct / 100.0)
    lower = int(math.floor(rank))
    upper = int(math.ceil(rank))
    if lower == upper:
        return ordered[lower]
    fraction = rank - lower
    return ordered[lower] + (ordered[upper] - ordered[lower]) * fraction


def format_number(value: Any) -> str:
    if value is None:
        return "n/a"
    if isinstance(value, bool):
        return str(value)
    if isinstance(value, int):
        return f"{value:,}"
    if isinstance(value, float):
        if abs(value) >= 1000:
            return f"{value:,.2f}"
        return f"{value:.4f}"
    return str(value)


def build_helpers(rng: random.Random) -> Dict[str, Any]:
    def safe_log(value: Number, base: Number = math.e) -> float:
        return math.log(value, base)

    def clamp(value: Number, low: Number, high: Number) -> Number:
        return max(low, min(high, value))

    return {
        "abs": abs,
        "min": min,
        "max": max,
        "round": round,
        "int": int,
        "float": float,
        "pow": pow,
        "sqrt": math.sqrt,
        "log": safe_log,
        "exp": math.exp,
        "ceil": math.ceil,
        "floor": math.floor,
        "clamp": clamp,
        "random": rng.random,
        "uniform": rng.uniform,
        "randint": rng.randint,
        "pi": math.pi,
        "e": math.e,
    }


def compile_expression(expression: str, field_path: str) -> Any:
    if not isinstance(expression, str) or not expression.strip():
        raise ValueError(f"'{field_path}' must be a non-empty string expression.")
    try:
        tree = ast.parse(expression, mode="eval")
    except SyntaxError as exc:
        raise ValueError(f"Invalid expression in '{field_path}': {exc.msg}") from exc

    for node in ast.walk(tree):
        if not isinstance(node, ALLOWED_NODE_TYPES):
            raise ValueError(
                f"Expression in '{field_path}' uses unsupported syntax: {type(node).__name__}"
            )
        if isinstance(node, ast.Call):
            if not isinstance(node.func, ast.Name):
                raise ValueError(
                    f"Expression in '{field_path}' can only call named helper functions."
                )
            if node.func.id not in SAFE_CALL_NAMES:
                raise ValueError(
                    f"Expression in '{field_path}' calls unsupported function '{node.func.id}'."
                )
        if isinstance(node, ast.Name) and node.id.startswith("__"):
            raise ValueError(f"Expression in '{field_path}' uses blocked name '{node.id}'.")

    return compile(tree, filename=field_path, mode="eval")


def eval_expression(code: Any, context: Mapping[str, Any], helpers: Mapping[str, Any]) -> Any:
    local_vars = dict(helpers)
    local_vars.update(context)
    return eval(code, {"__builtins__": {}}, local_vars)


def load_config(path: Path) -> Dict[str, Any]:
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise ValueError(f"Config file not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise ValueError(f"Config JSON parse error at line {exc.lineno}: {exc.msg}") from exc

    if not isinstance(raw, dict):
        raise ValueError("Top-level config must be a JSON object.")
    return raw


def prepare_updates(updates: Any, field_name: str) -> List[Dict[str, Any]]:
    if not isinstance(updates, list) or not updates:
        raise ValueError(f"'{field_name}' must be a non-empty list.")

    prepared: List[Dict[str, Any]] = []
    for index, item in enumerate(updates):
        if not isinstance(item, dict):
            raise ValueError(f"'{field_name}[{index}]' must be an object.")
        var_name = item.get("var")
        expr = item.get("expr")
        if not isinstance(var_name, str) or not var_name:
            raise ValueError(f"'{field_name}[{index}].var' must be a non-empty string.")
        code = compile_expression(expr, f"{field_name}[{index}].expr")
        prepared.append({"var": var_name, "expr": expr, "code": code})
    return prepared


def prepare_events(events: Any) -> List[Dict[str, Any]]:
    if events is None:
        return []
    if not isinstance(events, list):
        raise ValueError("'events' must be a list when provided.")

    prepared: List[Dict[str, Any]] = []
    for index, event in enumerate(events):
        if not isinstance(event, dict):
            raise ValueError(f"'events[{index}]' must be an object.")
        when_expr = event.get("when")
        updates = event.get("updates")
        label = event.get("label", f"event_{index + 1}")
        if not isinstance(label, str) or not label:
            raise ValueError(f"'events[{index}].label' must be a non-empty string.")
        when_code = compile_expression(when_expr, f"events[{index}].when")
        prepared_updates = prepare_updates(updates, f"events[{index}].updates")
        prepared.append(
            {
                "label": label,
                "when_expr": when_expr,
                "when_code": when_code,
                "updates": prepared_updates,
            }
        )
    return prepared


def prepare_milestones(milestones: Any) -> Dict[str, Any]:
    if milestones is None:
        return {}
    if not isinstance(milestones, dict):
        raise ValueError("'milestones' must be an object when provided.")

    prepared: Dict[str, Any] = {}
    for name, expr in milestones.items():
        if not isinstance(name, str) or not name:
            raise ValueError("Milestone names must be non-empty strings.")
        prepared[name] = compile_expression(expr, f"milestones.{name}")
    return prepared


def prepare_collect(collect: Any) -> Dict[str, Any]:
    if collect is None:
        return {}
    if not isinstance(collect, dict):
        raise ValueError("'collect' must be an object when provided.")

    prepared: Dict[str, Any] = {}
    for name, expr in collect.items():
        if not isinstance(name, str) or not name:
            raise ValueError("Collect metric names must be non-empty strings.")
        prepared[name] = compile_expression(expr, f"collect.{name}")
    return prepared


def prepare_config(
    raw: Dict[str, Any],
    runs_override: int | None,
    seed_override: int | None,
    max_steps_override: int | None,
) -> Dict[str, Any]:
    initial_state = raw.get("initial_state")
    if not isinstance(initial_state, dict):
        raise ValueError("'initial_state' must be an object.")

    runs = runs_override if runs_override is not None else raw.get("runs", 1000)
    max_steps = (
        max_steps_override if max_steps_override is not None else raw.get("max_steps", 3650)
    )
    seed = seed_override if seed_override is not None else raw.get("seed", 42)

    runs = positive_int(runs, "runs")
    max_steps = positive_int(max_steps, "max_steps")
    if not isinstance(seed, int) or isinstance(seed, bool):
        raise ValueError("'seed' must be an integer.")

    step_updates = prepare_updates(raw.get("step_updates"), "step_updates")
    events = prepare_events(raw.get("events"))
    milestones = prepare_milestones(raw.get("milestones"))
    collect = prepare_collect(raw.get("collect"))

    stop_expr = raw.get("stop_condition")
    stop_code = None
    if stop_expr is not None:
        stop_code = compile_expression(stop_expr, "stop_condition")

    return {
        "runs": runs,
        "max_steps": max_steps,
        "seed": seed,
        "initial_state": copy.deepcopy(initial_state),
        "step_updates": step_updates,
        "events": events,
        "milestones": milestones,
        "collect": collect,
        "stop_condition": stop_expr,
        "stop_code": stop_code,
    }


def build_context(state: Mapping[str, Any], step: int, run_index: int) -> Dict[str, Any]:
    context = dict(state)
    context["step"] = step
    context["run"] = run_index
    return context


def apply_updates(
    updates: List[Dict[str, Any]],
    state: Dict[str, Any],
    step: int,
    run_index: int,
    helpers: Mapping[str, Any],
) -> None:
    for update in updates:
        context = build_context(state, step, run_index)
        state[update["var"]] = eval_expression(update["code"], context, helpers)


def simulate_one_run(
    prepared: Dict[str, Any],
    run_index: int,
    run_seed: int,
) -> Dict[str, Any]:
    rng = random.Random(run_seed)
    helpers = build_helpers(rng)
    state = copy.deepcopy(prepared["initial_state"])
    milestone_steps = {name: None for name in prepared["milestones"]}
    steps_taken = prepared["max_steps"]

    for step in range(1, prepared["max_steps"] + 1):
        apply_updates(prepared["step_updates"], state, step, run_index, helpers)

        for event in prepared["events"]:
            event_context = build_context(state, step, run_index)
            if bool(eval_expression(event["when_code"], event_context, helpers)):
                apply_updates(event["updates"], state, step, run_index, helpers)

        checkpoint_context = build_context(state, step, run_index)
        for name, code in prepared["milestones"].items():
            if milestone_steps[name] is None and bool(
                eval_expression(code, checkpoint_context, helpers)
            ):
                milestone_steps[name] = step

        if prepared["stop_code"] is not None and bool(
            eval_expression(prepared["stop_code"], checkpoint_context, helpers)
        ):
            steps_taken = step
            break

    final_context = build_context(state, steps_taken, run_index)
    collect_values: Dict[str, Any] = {}
    for name, code in prepared["collect"].items():
        collect_values[name] = eval_expression(code, final_context, helpers)

    return {
        "run": run_index,
        "seed": run_seed,
        "steps_taken": steps_taken,
        "milestones": milestone_steps,
        "final_state": state,
        "collect": collect_values,
    }


def summarize_milestones(run_results: List[Dict[str, Any]], milestone_names: List[str]) -> Dict[str, Any]:
    summary: Dict[str, Any] = {}
    total_runs = len(run_results)
    for name in milestone_names:
        reached = [
            run["milestones"][name]
            for run in run_results
            if isinstance(run["milestones"].get(name), int)
        ]
        mean_value = statistics.fmean(reached) if reached else None
        median_value = statistics.median(reached) if reached else None
        summary[name] = {
            "reached_runs": len(reached),
            "total_runs": total_runs,
            "success_rate": (len(reached) / total_runs) if total_runs else 0.0,
            "mean_step": mean_value,
            "median_step": median_value,
            "p90_step": percentile(reached, 90),
            "p95_step": percentile(reached, 95),
            "min_step": min(reached) if reached else None,
            "max_step": max(reached) if reached else None,
        }
    return summary


def summarize_numeric_series(values: List[Number]) -> Dict[str, Any]:
    ordered = sorted(float(v) for v in values)
    return {
        "mean": statistics.fmean(ordered),
        "median": statistics.median(ordered),
        "p90": percentile(ordered, 90),
        "min": min(ordered),
        "max": max(ordered),
    }


def summarize_final_state(run_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    keys: Dict[str, List[Number]] = {}
    for run in run_results:
        for key, value in run["final_state"].items():
            if is_number(value):
                keys.setdefault(key, []).append(value)

    summary: Dict[str, Any] = {}
    for key, values in keys.items():
        if len(values) == len(run_results):
            summary[key] = summarize_numeric_series(values)
    return summary


def summarize_collect(run_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    keys: Dict[str, List[Number]] = {}
    for run in run_results:
        for key, value in run["collect"].items():
            if is_number(value):
                keys.setdefault(key, []).append(value)

    summary: Dict[str, Any] = {}
    for key, values in keys.items():
        if len(values) == len(run_results):
            summary[key] = summarize_numeric_series(values)
    return summary


def execute_prepared_runs(prepared: Dict[str, Any]) -> List[Dict[str, Any]]:
    parent_rng = random.Random(prepared["seed"])
    run_results: List[Dict[str, Any]] = []
    for run_index in range(1, prepared["runs"] + 1):
        run_seed = parent_rng.randint(0, 2**31 - 1)
        run_results.append(simulate_one_run(prepared, run_index, run_seed))
    return run_results


def summarize_run_results(prepared: Dict[str, Any], run_results: List[Dict[str, Any]]) -> Dict[str, Any]:
    return {
        "meta": {
            "runs": prepared["runs"],
            "seed": prepared["seed"],
            "max_steps": prepared["max_steps"],
        },
        "milestones": summarize_milestones(run_results, list(prepared["milestones"].keys())),
        "final_state": summarize_final_state(run_results),
        "collect": summarize_collect(run_results),
    }


def execute_config(
    raw_config: Dict[str, Any],
    runs_override: int | None = None,
    seed_override: int | None = None,
    max_steps_override: int | None = None,
) -> tuple[Dict[str, Any], List[Dict[str, Any]], Dict[str, Any]]:
    prepared = prepare_config(raw_config, runs_override, seed_override, max_steps_override)
    run_results = execute_prepared_runs(prepared)
    summary = summarize_run_results(prepared, run_results)
    return prepared, run_results, summary


def print_summary(summary: Dict[str, Any], target_milestone: str | None) -> None:
    meta = summary["meta"]
    print(
        f"Runs: {meta['runs']}, Seed: {meta['seed']}, Max steps: {meta['max_steps']}",
        flush=True,
    )

    if summary["milestones"]:
        print("Milestones:", flush=True)
        for name, stats in summary["milestones"].items():
            if stats["reached_runs"] == 0:
                print(f"  - {name}: never reached", flush=True)
                continue
            print(
                "  - "
                f"{name}: success={stats['success_rate']:.1%}, "
                f"median_step={format_number(stats['median_step'])}, "
                f"p90_step={format_number(stats['p90_step'])}, "
                f"mean_step={format_number(stats['mean_step'])}",
                flush=True,
            )
    else:
        print("Milestones: none configured", flush=True)

    if target_milestone:
        target_stats = summary["milestones"].get(target_milestone)
        if target_stats is None:
            print(f"Target milestone '{target_milestone}' not found in config.", flush=True)
        elif target_stats["reached_runs"] == 0:
            print(f"Target milestone '{target_milestone}' was not reached in any run.", flush=True)
        else:
            print(
                f"Target '{target_milestone}': median_step={format_number(target_stats['median_step'])}, "
                f"p90_step={format_number(target_stats['p90_step'])}, "
                f"success={target_stats['success_rate']:.1%}",
                flush=True,
            )

    if summary["final_state"]:
        print("Final state numeric summary:", flush=True)
        for key, stats in summary["final_state"].items():
            print(
                "  - "
                f"{key}: mean={format_number(stats['mean'])}, "
                f"median={format_number(stats['median'])}, "
                f"p90={format_number(stats['p90'])}",
                flush=True,
            )

    if summary["collect"]:
        print("Collect metrics summary:", flush=True)
        for key, stats in summary["collect"].items():
            print(
                "  - "
                f"{key}: mean={format_number(stats['mean'])}, "
                f"median={format_number(stats['median'])}, "
                f"p90={format_number(stats['p90'])}",
                flush=True,
            )


def run(args: argparse.Namespace) -> int:
    raw_config = load_config(Path(args.config))
    _prepared, run_results, summary = execute_config(
        raw_config,
        runs_override=args.runs,
        seed_override=args.seed,
        max_steps_override=args.max_steps,
    )

    print_summary(summary, args.target)

    output_payload: Dict[str, Any] = {"summary": summary}
    if args.include_runs:
        output_payload["runs"] = run_results

    if args.output:
        output_path = Path(args.output)
        output_path.write_text(
            json.dumps(output_payload, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )
        print(f"Saved JSON output to: {output_path}", flush=True)

    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Run formula-based Monte Carlo simulation for game balancing."
    )
    parser.add_argument("--config", required=True, help="Path to simulation config JSON.")
    parser.add_argument("--runs", type=int, help="Override run count from config.")
    parser.add_argument("--seed", type=int, help="Override base random seed from config.")
    parser.add_argument("--max-steps", type=int, help="Override max steps from config.")
    parser.add_argument("--target", help="Milestone name to highlight in terminal output.")
    parser.add_argument("--output", help="Optional path to write JSON output.")
    parser.add_argument(
        "--include-runs",
        action="store_true",
        help="Include per-run details in --output JSON.",
    )
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return run(args)
    except ValueError as exc:
        print(f"Configuration error: {exc}", file=sys.stderr)
        return 2
    except Exception as exc:  # pragma: no cover
        print(f"Unexpected error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
