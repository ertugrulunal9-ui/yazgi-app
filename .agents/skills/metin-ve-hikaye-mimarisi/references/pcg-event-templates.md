# PCG Event Templates

## Purpose

Use these templates to generate random events that stay coherent with narrative logic and gameplay state.

## Event Design Rules

1. Anchor every event to one explicit lore rule.
2. Require at least one state-based precondition.
3. Include player agency with at least two choices.
4. Include both immediate and delayed consequences.
5. Avoid irreversible failure unless explicitly requested.
6. Add cooldown to prevent repetitive loops.

## Canonical Event Schema

```json
{
  "id": "event_slug",
  "title": "string",
  "category": "social|economy|mystery|danger|opportunity",
  "rarity": "common|uncommon|rare|legendary",
  "trigger": "state expression",
  "preconditions": ["state rule"],
  "choices": [
    {
      "label": "string",
      "check": "state expression",
      "success_effect": "state mutation",
      "fail_effect": "state mutation",
      "narrative_note": "short flavor intent"
    }
  ],
  "delayed_effect": {
    "after_steps": 0,
    "effect": "state mutation",
    "story_followup": "optional hook"
  },
  "cooldown_steps": 0,
  "lore_anchor": "world rule reference"
}
```

## Reusable Templates

### 1) Opportunity Event

Use when player can trade risk for growth.

```json
{
  "category": "opportunity",
  "trigger": "day >= 10 && reputation >= 20",
  "preconditions": ["energy >= 15"],
  "choices": [
    {
      "label": "Take the risky deal",
      "check": "charisma + luck >= 14",
      "success_effect": "cash += 1200; reputation += 4",
      "fail_effect": "cash -= 400; stress += 6"
    },
    {
      "label": "Decline politely",
      "check": "true",
      "success_effect": "reputation += 1",
      "fail_effect": "0"
    }
  ],
  "delayed_effect": {
    "after_steps": 3,
    "effect": "if deal_taken then network += 2 else opportunity_score -= 1"
  }
}
```

### 2) Social Friction Event

Use when relationship pressure should alter future dialogue.

```json
{
  "category": "social",
  "trigger": "trust_with_mentor < 40",
  "preconditions": ["recent_argument == true"],
  "choices": [
    {
      "label": "Apologize directly",
      "check": "empathy >= 8",
      "success_effect": "trust_with_mentor += 10",
      "fail_effect": "trust_with_mentor -= 4; pride += 2"
    },
    {
      "label": "Change subject",
      "check": "wit >= 9",
      "success_effect": "tension -= 2",
      "fail_effect": "tension += 4"
    }
  ],
  "delayed_effect": {
    "after_steps": 2,
    "effect": "if trust_with_mentor < 30 then unlock_event('cold_distance')"
  }
}
```

### 3) Mystery Hook Event

Use when pacing needs a clue without full reveal.

```json
{
  "category": "mystery",
  "trigger": "chapter >= 2 && clues_found >= 1",
  "preconditions": ["night_time == true"],
  "choices": [
    {
      "label": "Inspect the signal",
      "check": "investigation >= 7",
      "success_effect": "clues_found += 1; danger += 2",
      "fail_effect": "danger += 4"
    },
    {
      "label": "Mark location and leave",
      "check": "true",
      "success_effect": "safety += 1",
      "fail_effect": "0"
    }
  ],
  "delayed_effect": {
    "after_steps": 1,
    "effect": "unlock_event('echo-message')"
  }
}
```

## Consistency Checks

- Ensure trigger and preconditions can be true in reachable game states.
- Ensure each choice has asymmetric outcomes.
- Ensure delayed effects do not contradict immediate effects.
- Ensure rarity aligns with narrative impact.
