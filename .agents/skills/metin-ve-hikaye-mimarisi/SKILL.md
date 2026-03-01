---
name: metin-ve-hikaye-mimarisi
description: Design and structure narrative content for text-based games with consistent world logic. Use when users ask for dynamic dialogue that changes by character mood, relationship, or skill level; persona-aware prompt templates; branching scenes; or procedural/random event templates that must stay coherent with lore, timeline, and game rules.
---

# Metin ve Hikaye Mimarisi

Create reusable writing patterns for dialogue and event generation so outputs stay expressive and logically stable across many runs.

## Workflow

1. Capture narrative constraints before writing.
- Collect world rules, timeline state, forbidden outcomes, language, POV, and tense.
- Collect character state: goal, mood, relation, skill level, and current pressure.
- Refuse to improvise critical missing constraints; list what is missing first.

2. Generate mood/skill-aware dialogue variants.
- Use [dynamic-dialogue-prompts.md](references/dynamic-dialogue-prompts.md).
- Produce at least three tone variants when the user asks for alternatives.
- Encode mood and skill in word choice, sentence length, confidence, and risk appetite.
- Keep subtext active: each line should carry surface meaning and hidden intent.

3. Build procedural random events with guardrails.
- Use [pcg-event-templates.md](references/pcg-event-templates.md).
- Define trigger, preconditions, immediate effect, delayed effect, and cooldown.
- Add a failure branch and a recovery branch to avoid dead-end states.
- Preserve causality with prior events and resource economy.

4. Run coherence and continuity checks.
- Use [continuity-checklist.md](references/continuity-checklist.md).
- Validate chronology, character knowledge limits, and tone consistency.
- If contradictions remain, return a corrected version plus a one-line fix note.

5. Return implementation-ready output.
- For dialogue tasks, return structured rows with speaker, tone, and intent tags.
- For PCG tasks, return event objects that game logic can evaluate deterministically.

## Output Contracts

### Dialogue Contract (default)

Use this shape unless user asks for plain prose:

```json
[
  {
    "speaker": "string",
    "mood": -2,
    "skill_tier": "novice|trained|expert|master",
    "tone": "soft|neutral|hard|sarcastic|formal",
    "surface_text": "string",
    "subtext_intent": "string",
    "risk_level": "low|medium|high"
  }
]
```

### PCG Event Contract (default)

```json
{
  "id": "event_slug",
  "title": "string",
  "category": "social|economy|mystery|danger|opportunity",
  "trigger": "state expression",
  "preconditions": ["state rule"],
  "choices": [
    {
      "label": "string",
      "check": "state expression",
      "success_effect": "state mutation",
      "fail_effect": "state mutation"
    }
  ],
  "delayed_effect": {
    "after_steps": 0,
    "effect": "state mutation"
  },
  "cooldown_steps": 0,
  "lore_anchor": "which world rule this event relies on"
}
```

## Quality Bar

- Keep character voice distinct across speakers.
- Keep event outcomes meaningful but reversible.
- Keep random content surprising without violating lore.
- Prefer short, concrete text over abstract exposition.

## References

- [dynamic-dialogue-prompts.md](references/dynamic-dialogue-prompts.md): Persona prompting templates and tone matrix.
- [pcg-event-templates.md](references/pcg-event-templates.md): Event schema, constraints, and reusable templates.
- [continuity-checklist.md](references/continuity-checklist.md): Fast validation checklist before final output.
