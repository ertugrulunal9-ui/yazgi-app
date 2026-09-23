#!/usr/bin/env python3
"""
Translate event source catalog (TR -> EN) and emit TypeScript catalog module.
"""

from __future__ import annotations

import argparse
import json
import re
import time
from pathlib import Path
from typing import Dict, List, Tuple

from deep_translator import GoogleTranslator


PLACEHOLDER_RE = re.compile(r"\{[a-zA-Z0-9_]+\}")


def protect_placeholders(text: str) -> Tuple[str, Dict[str, str]]:
    replacements: Dict[str, str] = {}
    counter = 0

    def _replace(match: re.Match[str]) -> str:
        nonlocal counter
        token = f"__PH_{counter}__"
        replacements[token] = match.group(0)
        counter += 1
        return token

    protected = PLACEHOLDER_RE.sub(_replace, text)
    return protected, replacements


def restore_placeholders(text: str, replacements: Dict[str, str]) -> str:
    restored = text
    for token, original in replacements.items():
        restored = restored.replace(token, original)
    return restored


def to_ascii_safe(text: str) -> str:
    # Keep common punctuation but normalize whitespace.
    clean = (
        text.replace("\u2019", "'")
        .replace("\u2018", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2013", "-")
        .replace("\u2014", "-")
    )
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def naturalize_english(text: str) -> str:
    result = text
    lower = result.lower()

    # If translation drifted into 3rd person, gently push it back to 2nd person voice.
    if " you " not in f" {lower} " and " your " not in f" {lower} ":
        result = re.sub(r"\bhe\b", "you", result, flags=re.IGNORECASE)
        result = re.sub(r"\bshe\b", "you", result, flags=re.IGNORECASE)
        result = re.sub(r"\bhim\b", "you", result, flags=re.IGNORECASE)
        result = re.sub(r"\bhis\b", "your", result, flags=re.IGNORECASE)
        result = re.sub(r"\bher\b", "your", result, flags=re.IGNORECASE)
        result = re.sub(r"\bhimself\b", "yourself", result, flags=re.IGNORECASE)
        result = re.sub(r"\bherself\b", "yourself", result, flags=re.IGNORECASE)

    # Common machine-translation artifacts in narrative text.
    result = result.replace("you are a little bored", "you feel a little bored")
    result = result.replace("gave you a heavy bill", "took a heavy toll on your body")
    result = result.replace("put in a serum", "put you on an IV drip")
    result = result.replace("look after it", "watching you")
    result = result.replace("look under the bed", "Look under the bed")

    # Capitalize sentence start if needed.
    if result and result[0].islower():
        result = result[0].upper() + result[1:]

    return result


def flatten_catalog(catalog: dict) -> Dict[Tuple[str, ...], str]:
    flat: Dict[Tuple[str, ...], str] = {}

    for event_id, event_data in catalog.items():
        text_value = event_data.get("text")
        if isinstance(text_value, str) and text_value.strip():
            flat[(event_id, "text")] = text_value

        choices = event_data.get("choices")
        if not isinstance(choices, dict):
            continue

        for choice_id, choice_data in choices.items():
            if not isinstance(choice_data, dict):
                continue
            choice_text = choice_data.get("text")
            if isinstance(choice_text, str) and choice_text.strip():
                flat[(event_id, "choices", choice_id, "text")] = choice_text
            choice_feedback = choice_data.get("feedback")
            if isinstance(choice_feedback, str) and choice_feedback.strip():
                flat[(event_id, "choices", choice_id, "feedback")] = choice_feedback

            outcomes = choice_data.get("outcomes")
            if not isinstance(outcomes, dict):
                continue

            for outcome_id, outcome_data in outcomes.items():
                if not isinstance(outcome_data, dict):
                    continue
                outcome_feedback = outcome_data.get("feedback")
                if isinstance(outcome_feedback, str) and outcome_feedback.strip():
                    flat[(event_id, "choices", choice_id, "outcomes", outcome_id, "feedback")] = outcome_feedback

    return flat


def assign_path(root: dict, path: Tuple[str, ...], value: str) -> None:
    cursor = root
    for part in path[:-1]:
        if part not in cursor or not isinstance(cursor[part], dict):
            cursor[part] = {}
        cursor = cursor[part]
    cursor[path[-1]] = value


def load_cache(cache_path: Path) -> Dict[str, str]:
    if not cache_path.exists():
        return {}
    try:
        data = json.loads(cache_path.read_text(encoding="utf-8"))
        if isinstance(data, dict):
            return {str(k): str(v) for k, v in data.items()}
    except Exception:
        return {}
    return {}


def save_cache(cache_path: Path, cache: Dict[str, str]) -> None:
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(
        json.dumps(cache, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def translate_unique_strings(
    unique_values: List[str],
    *,
    cache: Dict[str, str],
    cache_path: Path,
    batch_size: int,
    sleep_seconds: float,
    limit: int | None,
) -> Dict[str, str]:
    translator = GoogleTranslator(source="tr", target="en")
    translated_map: Dict[str, str] = dict(cache)
    to_translate = [text for text in unique_values if text not in translated_map]
    if limit is not None:
        to_translate = to_translate[: max(0, limit)]

    total = len(to_translate)
    if total == 0:
        print("No new strings to translate; using cache.", flush=True)
        return translated_map

    print(f"Translating {total} new strings (batch={batch_size})...", flush=True)

    completed = 0
    for index in range(0, total, batch_size):
        batch = to_translate[index : index + batch_size]
        protected_batch = []
        token_maps: List[Dict[str, str]] = []
        for item in batch:
            protected, tokens = protect_placeholders(item)
            protected_batch.append(protected)
            token_maps.append(tokens)

        translated_batch: List[str] = []
        try:
            translated_batch = translator.translate_batch(protected_batch)
        except Exception:
            translated_batch = []
            for protected_item in protected_batch:
                try:
                    translated_batch.append(translator.translate(protected_item))
                except Exception:
                    translated_batch.append(protected_item)
                time.sleep(0.08)

        for source, translated, token_map in zip(batch, translated_batch, token_maps):
            restored = restore_placeholders(translated, token_map)
            normalized = naturalize_english(to_ascii_safe(restored))
            translated_map[source] = normalized
            cache[source] = normalized

        completed += len(batch)
        print(f"[{completed}/{total}] translated", flush=True)
        save_cache(cache_path, cache)
        time.sleep(sleep_seconds)

    return translated_map


def to_ts_object(value, indent: int = 2) -> str:
    pad = " " * indent
    if isinstance(value, dict):
        if not value:
            return "{}"
        lines = ["{"]
        for key, child in value.items():
            key_repr = key if re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", key) else json.dumps(key)
            lines.append(f"{pad}{key_repr}: {to_ts_object(child, indent + 2)},")
        lines.append(" " * (indent - 2) + "}")
        return "\n".join(lines)
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=True)
    return json.dumps(value)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="Path to source event catalog json")
    parser.add_argument("--output", required=True, help="Path to generated TS file")
    parser.add_argument("--cache", default="scripts/localization/event-translation-cache.json")
    parser.add_argument("--batch-size", type=int, default=30)
    parser.add_argument("--sleep", type=float, default=0.1)
    parser.add_argument("--limit", type=int, default=None)
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    cache_path = Path(args.cache)

    source_catalog = json.loads(input_path.read_text(encoding="utf-8"))
    flat = flatten_catalog(source_catalog)
    unique_values = sorted(set(flat.values()))
    cache = load_cache(cache_path)
    translated_lookup = translate_unique_strings(
        unique_values,
        cache=cache,
        cache_path=cache_path,
        batch_size=max(1, args.batch_size),
        sleep_seconds=max(0.0, args.sleep),
        limit=args.limit,
    )

    translated_catalog: dict = {}
    for path, source_text in flat.items():
        translated = translated_lookup.get(source_text, source_text)
        translated = naturalize_english(to_ascii_safe(translated))
        assign_path(translated_catalog, path, translated)

    ts_body = to_ts_object(translated_catalog, indent=2)
    ts_content = (
        "import type { EventTranslationCatalog } from './types';\n\n"
        "// Auto-generated by scripts/localization/translate-event-catalog.py\n"
        "export const enEventTranslationsGenerated: EventTranslationCatalog = "
        f"{ts_body};\n"
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(ts_content, encoding="utf-8")
    save_cache(cache_path, cache)
    covered = sum(1 for value in unique_values if value in translated_lookup)
    print(f"Catalog coverage: {covered}/{len(unique_values)} -> {output_path}")


if __name__ == "__main__":
    main()
