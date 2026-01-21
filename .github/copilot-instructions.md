# Yazgı - Life Simulation Game

A Turkish-language life simulator built with React Native (Expo), TypeScript, and Tailwind CSS. Players progress from age 0-18, making choices that shape their character's stats, traits, and eventual ending.

## Architecture Overview

**Single-File App Pattern**: Core game logic lives in `App.tsx` (~1200 lines), managing all state, phases, and UI orchestration. Components in `components/` are presentational (Dashboard, EventLog, ReportCard, etc.).

**State Management**: No Redux/Context. All state in `App.tsx` via `useState`:
- `stats: Stats` - 7 core attributes (health, intelligence, charisma, discipline, money, energy, familyRelation)
- `gameState: GameState` - age, phase, events, traits, skills, inventory, NPCs, school grades, logs
- Auto-saves to localStorage via `saveGame()` in `useEffect` after every state change

**Game Phases**: Controlled by `gameState.phase`:
- `SETUP` → name entry
- `HUB` → main action menu (study, sports, work, shop, social)
- `EVENT` → narrative event with choices
- `RESULT` → choice feedback
- `REPORT_CARD` → school grades (shown every 5 turns for ages 7-18)
- `GAME_OVER` → ending screen with career calculation

## Critical Systems

### Event System
**Event files**: `events/earlyYears.ts`, `schoolYears.ts`, `teenYears.ts`, `dynamicEvents.ts`  
Events are selected in `selectEvent()` based on:
- Age range (`minAge`, `maxAge`)
- Rarity (COMMON/UNCOMMON/RARE) - 70%/25%/5% weighted
- Requirements: `reqStats`, `reqFamily`, `reqTraits`, `reqNPCRole`, `reqNoItem`
- Dynamic text/choices via functions: `text: (context) => string` or static strings

**Choice Processing**: Each choice modifies:
- `effect: Partial<Stats>` - direct stat changes
- `gradeUpdates: Partial<SchoolGrades>` - math/science/language
- `skillUpdates: Partial<Skills>` - coding/music/sports/design
- `inventoryAdd: string[]` - items to add
- `feedback: string` - shown in RESULT phase

### Trait System
**Two categories**:
- `GENETIC` - assigned at birth (e.g., GENIUS, ATHLETIC, SICKLY)
- `ACQUIRED` - earned through gameplay patterns

**Formation Logic** (`checkTraitFormation()` in `utils/gameUtils.ts`):
- Tracks `actionCounts` and `eventChoiceHistory` against `TraitDefinition.formation.triggers`
- Triggers types: `ACTION`, `EVENT`, `STAT_THRESHOLD`, `EVENT_CHOICE`
- Example: EMPATHETIC requires 4 points from specific actions/choices between ages 3-14

**Effects Applied**:
- `statMultipliers` - e.g., GENIUS gives 1.3x intelligence gains
- `energyCostMultiplier` - ATHLETIC reduces energy costs by 10%
- Applied in `calculateStatGain()` and `getEnergyCostMultiplier()` helpers

### School System
**Grade Calculation** (`calculateSchoolReport()` in `utils/schoolLogic.ts`):
```
baseScore = (intelligence * 1.2) - (stress * 0.15) + luck(0-10)
stress = 100 - energy
```
- Math/Science: pure intelligence-based
- Language: intelligence + health bonus (if health > 70, +5)
- Traits modify: GENIUS +10, BOOKWORM +10 to language

**Report Cards**: Shown every 5 turns for ages 7-18 in `REPORT_CARD` phase. Family reaction based on average grade and `family.dynamic` (SUPPORTIVE/STRICT/CHAOTIC).

### Hub Actions
**Energy-based Activities** (all cost energy):
- Study subjects (math/science/language) → intelligence + grade gains
- Sports → health + sports skill
- Computer → intelligence + coding skill
- Art → charisma + design skill
- Work → money gain (requires age ≥ 14)
- Social → interact with NPCs, improve relationships

**Action Processing**: Each action increments `actionCounts[actionId]` for trait formation tracking.

## Data Flow

1. **Turn Loop**: HUB → action/event → RESULT → HUB (repeat until energy depleted or age maxed)
2. **Age Progression**: Every 5 turns (2 for age < 7), call `progressAge()`
3. **Event Selection**: `selectEvent()` filters EVENTS array, checks requirements, picks by rarity
4. **Choice Handling**: `handleChoice()` applies effects, updates logs, checks trait formation
5. **Save**: Auto-saves after every state update via `useEffect`

## Key Conventions

**Stat Clamping**: All stats clamped 0-100 (except money=Infinity) via `clamp()`. Energy resets to `maxEnergy` each new age.

**Floating UI Feedback**: `addFloatingText()` displays temporary stat changes (e.g., "+10 INT", "-20 Energy") at click coordinates.

**Turkish Language**: All text, UI, event narratives in Turkish. No i18n system.

**Item System**: Items defined in `data/items.ts`. Types: PERMANENT (passive effects) or CONSUMABLE. Check ownership via `hasItem()` before gating event access.

**NPC System**: NPCs generated at start via `generateNPCs()`. Have roles (ACQUAINTANCE/FRIEND/PARTNER/RIVAL), relationship scores, and appear in conditional events.

## Development Workflow

**Start dev server**: `npm start` (Expo CLI) or `npm run web` for web-only  
**No tests configured** - test manually via Expo Go app or web browser  
**Linting**: `npm run lint` (ESLint with expo config)

**Adding Events**:
1. Add to appropriate file in `events/` (organize by age range: `earlyYears.ts`, `schoolYears.ts`, `teenYears.ts`)
2. Export from `data/events.ts` via spread operator into `EVENTS` array
3. Use type `GameEvent` from `types.ts`
4. Test requirements with `reqStats` thresholds to ensure event fires

**Adding Traits**:
1. Define in `data/traits.ts` as `TraitDefinition`
2. Set `formation.triggers` array specifying action/event patterns
3. Add effects (`statMultipliers`, `energyCostMultiplier`, etc.)
4. Ensure no conflicts with existing traits via `conflicts` array

**Modifying Stats**: Always use `updateStats()` helper to apply trait multipliers. Never modify `stats` directly.

## Critical Files Reference

- `App.tsx` - main game loop, phase management, UI orchestration
- `types.ts` - TypeScript interfaces for entire game state
- `utils/gameUtils.ts` - stat calculations, save/load, trait formation, NPC generation
- `utils/schoolLogic.ts` - grade calculation, family reactions
- `data/traits.ts` - all trait definitions with formation rules
- `data/events.ts` - event aggregation, fallback event, hospital event
- `components/Dashboard.tsx` - mood, inner thoughts, stat display
