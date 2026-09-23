# Dynamic Dialogue Prompts

## Purpose

Use this file to generate dialogue that changes tone by mood, relationship, and skill level while preserving character identity.

## Required Inputs

- `scene_goal`: What must happen in this scene.
- `speaker_sheet`: Name, role, fear, desire, and taboo.
- `listener_sheet`: Name, relation, leverage, and trust level.
- `mood_score`: Integer from -2 to +2.
- `skill_tier`: `novice|trained|expert|master`.
- `stakes`: What is gained or lost in this exchange.
- `style_constraints`: Length cap, profanity policy, formality.

## Tone Mapping Matrix

| mood_score | default tone | lexical style | cadence |
| --- | --- | --- | --- |
| -2 | hostile | sharp verbs, blame, threat hints | short, clipped |
| -1 | tense | guarded words, doubt markers | short-medium |
| 0 | neutral | plain, factual language | medium |
| +1 | warm | supportive words, softeners | medium-long |
| +2 | intimate | metaphor, vulnerability, trust words | longer |

Skill impact:
- `novice`: hedges, uncertainty, reactive language.
- `trained`: balanced confidence, tactical wording.
- `expert`: precise language, controlled framing.
- `master`: minimal words, high implication density.

## Prompt Template

Use this system prompt block:

```text
Write in-character dialogue for a text-based game.
Respect lore, timeline, and character knowledge boundaries.
Make each line carry both surface meaning and hidden intent.
Do not repeat sentence rhythm across consecutive lines.
Return JSON only.
```

Use this user prompt block:

```text
Scene goal: {scene_goal}
Speaker: {speaker_sheet}
Listener: {listener_sheet}
Mood score: {mood_score}
Skill tier: {skill_tier}
Stakes: {stakes}
Style constraints: {style_constraints}

Create 3 variants with different tones.
Output schema:
[
  {
    "variant": 1,
    "tone": "",
    "surface_text": "",
    "subtext_intent": "",
    "risk_level": "low|medium|high"
  }
]
```

## Validation Heuristics

- Reject lines that any character should not know at this point in the story.
- Reject lines that do not change strategy with `skill_tier`.
- Reject variants that differ only by synonyms.
