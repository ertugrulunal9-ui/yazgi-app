const fs = require('fs');
const path = require('path');
const ts = require('typescript');

require.extensions['.ts'] = function registerTs(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    },
    fileName: filename,
  });

  module._compile(compiled.outputText, filename);
};

global.__DEV__ = false;
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

const ROOT_DIR = path.resolve(__dirname, '..');
const ARGS = new Set(process.argv.slice(2));
const CI_MODE = ARGS.has('--ci');
const JSON_MODE = ARGS.has('--json');
const OUT_INDEX = process.argv.indexOf('--out');
const OUT_PATH =
  OUT_INDEX !== -1 && process.argv[OUT_INDEX + 1]
    ? path.resolve(process.cwd(), process.argv[OUT_INDEX + 1])
    : null;

const EVENT_SOURCE_DEFS = [
  { source: 'ageSpecificEvents', file: 'ageSpecificEvents.ts', exportName: 'AGE_SPECIFIC_EVENTS' },
  { source: 'lateTeenEvents', file: 'lateTeenEvents.ts', exportName: 'LATE_TEEN_EVENTS' },
  { source: 'turkishEvents', file: 'turkishEvents.ts', exportName: 'TURKISH_EVENTS' },
  { source: 'moralDilemmaEvents', file: 'moralDilemmaEvents.ts', exportName: 'MORAL_DILEMMA_EVENTS' },
  { source: 'personalityEvents', file: 'personalityEvents.ts', exportName: 'PERSONALITY_EVENTS' },
  { source: 'npcEvents', file: 'npcEvents.ts', exportName: 'NPC_EVENTS' },
  { source: 'npcCheckInEvents', file: 'npcCheckInEvents.ts', exportName: 'NPC_CHECKIN_EVENTS' },
  { source: 'relationshipMilestoneEvents', file: 'relationshipMilestoneEvents.ts', exportName: 'MILESTONE_EVENTS' },
  { source: 'lateTeenFamilyArc', file: 'familyArcEvents.ts', exportName: 'FAMILY_ARC_EVENTS' },
  { source: 'economicRecoveryEvents', file: 'economicRecoveryEvents.ts', exportName: 'ECONOMIC_RECOVERY_EVENTS' },
  { source: 'memoryGatedEvents', file: 'memoryGatedEvents.ts', exportName: 'MEMORY_GATED_EVENTS' },
  { source: 'goalChainEvents', file: 'goalChainEvents.ts', exportName: 'GOAL_CHAIN_EVENTS' },
  { source: 'npcQuestlineEvents', file: 'npcQuestlineEvents.ts', exportName: 'NPC_QUESTLINE_EVENTS' },
  { source: 'cliffhangerEvents', file: 'cliffhangerEvents.ts', exportName: 'CLIFFHANGER_EVENTS' },
];

const readText = (relativePath) => fs.readFileSync(path.resolve(ROOT_DIR, relativePath), 'utf8');

const requireTs = (relativePath) => require(path.resolve(ROOT_DIR, relativePath));

const safeRatio = (numerator, denominator) => (denominator > 0 ? numerator / denominator : 0);

const round = (value, digits = 2) => Number(value.toFixed(digits));

const unique = (items) => Array.from(new Set(items));

const listFilesRecursive = (directoryPath, extensions, collected = []) => {
  const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  entries.forEach(entry => {
    const resolved = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      listFilesRecursive(resolved, extensions, collected);
      return;
    }
    if (extensions.has(path.extname(entry.name).toLowerCase())) {
      collected.push(resolved);
    }
  });
  return collected;
};

const extractConstInitializer = (sourceText, constName) => {
  const regex = new RegExp(`\\b${constName}\\b\\s*=\\s*([^;\\n]+)`);
  const match = sourceText.match(regex);
  return match ? match[1].trim() : null;
};

const extractNumericConstant = (sourceText, constName) => {
  const initializer = extractConstInitializer(sourceText, constName);
  if (!initializer) return null;
  const match = initializer.match(/^-?\d+(?:\.\d+)?$/);
  return match ? Number(match[0]) : null;
};

const evaluateNumericExpression = (expression) => {
  if (!expression) return null;
  const sanitized = expression.replace(/_/g, '').trim();
  if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) return null;

  try {
    const value = Function(`"use strict"; return (${sanitized});`)();
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
};

const extractStringUnionValues = (sourceText, typeName) => {
  const regex = new RegExp(`export\\s+type\\s+${typeName}\\s*=\\s*([\\s\\S]*?);`);
  const match = sourceText.match(regex);
  if (!match) return [];
  return unique(
    [...match[1].matchAll(/'([^']+)'/g)].map(item => item[1])
  );
};

const extractPlacementConfig = (sourceText) => {
  const mapIndex = sourceText.indexOf('const placementMap');
  if (mapIndex < 0) return {};
  const openIndex = sourceText.indexOf('{', mapIndex);
  if (openIndex < 0) return {};

  let depth = 0;
  let closeIndex = -1;
  for (let i = openIndex; i < sourceText.length; i += 1) {
    const char = sourceText[i];
    if (char === '{') depth += 1;
    if (char === '}') depth -= 1;
    if (depth === 0) {
      closeIndex = i;
      break;
    }
  }

  if (closeIndex < 0) return {};
  const mapText = sourceText.slice(openIndex + 1, closeIndex);
  const placements = {};
  const entryRegex = /([a-z_]+)\s*:\s*\{[\s\S]*?rewardType:\s*'([^']+)'[\s\S]*?amount:\s*([0-9_]+)/g;
  let match = entryRegex.exec(mapText);
  while (match) {
    placements[match[1]] = {
      rewardType: match[2],
      amount: Number(match[3].replace(/_/g, '')),
    };
    match = entryRegex.exec(mapText);
  }

  return placements;
};

const extractCallLiterals = (sourceText, regex) => {
  return unique([...sourceText.matchAll(regex)].map(match => match[1]));
};

const normalizePath = (absolutePath) => absolutePath.replace(/\\/g, '/');

const toRepoRelativePath = (absolutePath) => normalizePath(path.relative(ROOT_DIR, absolutePath));

const collectImporters = (pattern) => {
  const srcRoot = path.resolve(ROOT_DIR, 'src');
  const allCodeFiles = listFilesRecursive(srcRoot, new Set(['.ts', '.tsx']));
  const targetPath = normalizePath(path.resolve(srcRoot, 'config/gameBalance.ts'));

  return allCodeFiles
    .filter(filePath => normalizePath(filePath) !== targetPath)
    .filter(filePath => pattern.test(fs.readFileSync(filePath, 'utf8')))
    .map(filePath => toRepoRelativePath(filePath));
};

const summarizeEvents = (events, minBranchingAge) => {
  let totalChoiceSlots = 0;
  let staticChoices = 0;
  let functionalChoices = 0;
  let choicesWithFutureEvents = 0;
  let choicesWithConditionalOutcomes = 0;
  let futureEventEntries = 0;
  let conditionalOutcomeEntries = 0;
  let choicesWithReqEventIds = 0;
  let choicesWithBlockEventIds = 0;
  let eventsWithReqEventIds = 0;
  let eventsWithBlockEventIds = 0;
  let eventsUnderBranchingAge = 0;
  let underBranchingAgeWithGate = 0;
  const eventChoiceDistribution = {
    zero: 0,
    one: 0,
    two: 0,
    threeOrMore: 0,
  };

  events.forEach(event => {
    const choices = Array.isArray(event.choices) ? event.choices : [];
    totalChoiceSlots += choices.length;

    if (choices.length === 0) eventChoiceDistribution.zero += 1;
    else if (choices.length === 1) eventChoiceDistribution.one += 1;
    else if (choices.length === 2) eventChoiceDistribution.two += 1;
    else eventChoiceDistribution.threeOrMore += 1;

    const eventReq = Array.isArray(event.reqEventIds) && event.reqEventIds.length > 0;
    const eventBlock = Array.isArray(event.blockEventIds) && event.blockEventIds.length > 0;
    if (eventReq) eventsWithReqEventIds += 1;
    if (eventBlock) eventsWithBlockEventIds += 1;

    if (typeof event.minAge === 'number' && event.minAge < minBranchingAge) {
      eventsUnderBranchingAge += 1;
      if (eventReq || eventBlock) underBranchingAgeWithGate += 1;
    }

    choices.forEach(choice => {
      if (typeof choice === 'function') {
        functionalChoices += 1;
        return;
      }

      if (!choice || typeof choice !== 'object') return;
      staticChoices += 1;

      if (Array.isArray(choice.futureEvents) && choice.futureEvents.length > 0) {
        choicesWithFutureEvents += 1;
        futureEventEntries += choice.futureEvents.length;
      }

      if (Array.isArray(choice.conditionalOutcomes) && choice.conditionalOutcomes.length > 0) {
        choicesWithConditionalOutcomes += 1;
        conditionalOutcomeEntries += choice.conditionalOutcomes.length;
      }

      if (Array.isArray(choice.reqEventIds) && choice.reqEventIds.length > 0) {
        choicesWithReqEventIds += 1;
      }

      if (Array.isArray(choice.blockEventIds) && choice.blockEventIds.length > 0) {
        choicesWithBlockEventIds += 1;
      }
    });
  });

  return {
    events: events.length,
    totalChoiceSlots,
    avgChoicesPerEvent: round(safeRatio(totalChoiceSlots, events.length), 3),
    staticChoices,
    functionalChoices,
    eventChoiceDistribution,
    choicesWithFutureEvents,
    futureEventEntries,
    futureChoiceRatio: round(safeRatio(choicesWithFutureEvents, staticChoices), 4),
    choicesWithConditionalOutcomes,
    conditionalOutcomeEntries,
    conditionalChoiceRatio: round(safeRatio(choicesWithConditionalOutcomes, staticChoices), 4),
    eventsWithReqEventIds,
    eventsWithBlockEventIds,
    eventGateRatio: round(safeRatio(eventsWithReqEventIds, events.length), 4),
    blockRatio: round(safeRatio(eventsWithBlockEventIds, events.length), 4),
    choicesWithReqEventIds,
    choicesWithBlockEventIds,
    eventsUnderBranchingAge,
    underBranchingAgeWithGate,
  };
};

const buildActionAvailabilityByAge = (actionCategories, getActionEffectiveMinAgeFn) => {
  const byAge = {};
  for (let age = 0; age <= 18; age += 1) {
    let availableCategories = 0;
    let availableActions = 0;
    actionCategories.forEach(category => {
      if (typeof category.minAge === 'number' && age < category.minAge) return;
      if (typeof category.maxAge === 'number' && age > category.maxAge) return;
      availableCategories += 1;
      category.subActions.forEach(subAction => {
        const minAge = getActionEffectiveMinAgeFn(subAction, []);
        if (typeof minAge === 'number' && age < minAge) return;
        availableActions += 1;
      });
    });

    byAge[String(age)] = {
      categories: availableCategories,
      actions: availableActions,
    };
  }
  return byAge;
};

const extractEventIds = (events) => {
  return events
    .map(event => (event && typeof event.id === 'string' ? event.id : null))
    .filter(Boolean);
};

const findDuplicateIds = (ids) => {
  const seen = new Set();
  const duplicates = new Set();
  ids.forEach(id => {
    if (seen.has(id)) duplicates.add(id);
    else seen.add(id);
  });
  return Array.from(duplicates).sort();
};

const getEnvNumber = (name, fallback) => {
  const raw = process.env[name];
  if (raw === undefined || raw === null || raw === '') return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const printSection = (title, rows) => {
  console.log(`\n${title}`);
  rows.forEach(row => console.log(row));
};

const run = () => {
  const { GOAL_EVENT_WEIGHTING, PACING_CONSTANTS } = requireTs('src/constants/gameConstants.ts');
  const { BALANCE_CONTRACT } = requireTs('src/config/balanceContract.ts');
  const { ACTION_CATEGORIES, getActionEffectiveMinAge } = requireTs('src/data/actions.ts');
  const { applyProceduralEventBranching } = requireTs('src/data/eventBranchingEnhancer.ts');
  const { EVENTS } = requireTs('src/data/events.ts');

  const eventSources = EVENT_SOURCE_DEFS.map(def => {
    const modulePath = `src/data/${def.file}`;
    const mod = requireTs(modulePath);
    const events = Array.isArray(mod[def.exportName]) ? mod[def.exportName] : [];
    return {
      source: def.source,
      file: modulePath,
      exportName: def.exportName,
      count: events.length,
      events,
    };
  });

  const baseEvents = eventSources.flatMap(item => item.events);
  const runtimeEvents = Array.isArray(EVENTS) ? EVENTS : [];
  const branchPreview = applyProceduralEventBranching(baseEvents);

  const branchingSource = readText('src/data/eventBranchingEnhancer.ts');
  const monetizationSource = readText('src/services/monetization.ts');
  const gameScreenSource = readText('src/screens/GameScreen.tsx');
  const gameOverSource = readText('src/screens/GameOverScreen.tsx');

  const targetGateRatio = extractNumericConstant(branchingSource, 'TARGET_GATE_RATIO');
  const blockInjectionRatio = extractNumericConstant(branchingSource, 'BLOCK_INJECTION_RATIO');
  const minBranchingAge = extractNumericConstant(branchingSource, 'MIN_BRANCHING_AGE') ?? 8;
  const maxAgeDistanceForLink = extractNumericConstant(branchingSource, 'MAX_AGE_DISTANCE_FOR_LINK');

  const baseSummary = summarizeEvents(baseEvents, minBranchingAge);
  const runtimeSummary = summarizeEvents(runtimeEvents, minBranchingAge);
  const previewSummary = summarizeEvents(branchPreview.events, minBranchingAge);

  const sourceBreakdown = eventSources.map(item => ({
    source: item.source,
    count: item.count,
  }));

  const baseEventIds = extractEventIds(baseEvents);
  const runtimeEventIds = extractEventIds(runtimeEvents);
  const duplicateBaseIds = findDuplicateIds(baseEventIds);
  const duplicateRuntimeIds = findDuplicateIds(runtimeEventIds);

  const actionAvailabilityByAge = buildActionAvailabilityByAge(
    ACTION_CATEGORIES,
    getActionEffectiveMinAge
  );

  const rewardedPlacementsDefined = extractStringUnionValues(monetizationSource, 'RewardedPlacement');
  const placementConfig = extractPlacementConfig(monetizationSource);
  const defaultInterstitialSessionLimit = extractNumericConstant(
    monetizationSource,
    'DEFAULT_INTERSTITIAL_SESSION_LIMIT'
  );
  const interstitialCooldownInitializer = extractConstInitializer(
    monetizationSource,
    'DEFAULT_INTERSTITIAL_COOLDOWN_MS'
  );
  const defaultInterstitialCooldownProdMs = interstitialCooldownInitializer?.includes(':')
    ? evaluateNumericExpression(interstitialCooldownInitializer.split(':').slice(1).join(':'))
    : evaluateNumericExpression(interstitialCooldownInitializer);

  const rewardedPlacementCalls = unique([
    ...extractCallLiterals(gameScreenSource, /showContextualRewardedAd\('([^']+)'\)/g),
    ...extractCallLiterals(gameOverSource, /showContextualRewardedAd\('([^']+)'\)/g),
  ]);

  const interstitialPlacementCalls = unique([
    ...extractCallLiterals(gameScreenSource, /logInterstitialOpportunity\(\{\s*placement:\s*'([^']+)'/g),
    ...extractCallLiterals(gameOverSource, /logInterstitialOpportunity\(\{\s*placement:\s*'([^']+)'/g),
  ]);

  const gameOverRewardedPlacements = extractCallLiterals(
    gameOverSource,
    /showContextualRewardedAd\('([^']+)'\)/g
  );
  const gameOverInterstitialPlacements = extractCallLiterals(
    gameOverSource,
    /logInterstitialOpportunity\(\{\s*placement:\s*'([^']+)'/g
  );

  const gameBalanceImporters = collectImporters(/from\s+['"][^'"]*gameBalance(?:\.ts)?['"]/);
  const balanceContractImporters = collectImporters(/from\s+['"][^'"]*balanceContract(?:\.ts)?['"]/);

  const report = {
    generatedAt: new Date().toISOString(),
    metadata: {
      mode: CI_MODE ? 'ci' : 'report',
      rootDir: ROOT_DIR,
    },
    coreLoop: {
      pacing: {
        minDecisionsPerDay: PACING_CONSTANTS.MIN_DECISIONS_PER_DAY,
        chaosIntervalTurns: GOAL_EVENT_WEIGHTING.CHAOS_INTERVAL,
      },
      actionAvailabilityByAge,
    },
    narrative: {
      eventTotals: {
        sourceTotal: baseEvents.length,
        runtimeTotal: runtimeEvents.length,
      },
      eventSources: sourceBreakdown,
      duplicateEventIds: {
        base: duplicateBaseIds,
        runtime: duplicateRuntimeIds,
      },
      branchingConfig: {
        targetGateRatio,
        blockInjectionRatio,
        minBranchingAge,
        maxAgeDistanceForLink,
      },
      branchingStats: {
        preview: {
          ...branchPreview.stats,
          gateRatio: round(safeRatio(branchPreview.stats.gatedEvents, branchPreview.stats.totalEvents), 4),
          blockGivenGateRatio: round(
            safeRatio(branchPreview.stats.blockedEvents, branchPreview.stats.gatedEvents),
            4
          ),
        },
      },
      baseSummary,
      runtimeSummary,
      previewSummary,
    },
    economyProgression: {
      initialStats: BALANCE_CONTRACT.initialStats,
      initialEnergy: BALANCE_CONTRACT.initialEnergy,
    },
    monetization: {
      adOnlyBuildDetected: monetizationSource.includes('IAP disabled: pure ad-only build'),
      rewardedPlacementsDefined,
      rewardedPlacementCalls,
      rewardedPlacementConfig: placementConfig,
      interstitialPlacementCalls,
      defaultInterstitialSessionLimit,
      defaultInterstitialCooldownProdMs,
      gameOver: {
        rewardedPlacements: gameOverRewardedPlacements,
        interstitialPlacements: gameOverInterstitialPlacements,
        dualAdTriggers:
          gameOverRewardedPlacements.length > 0 && gameOverInterstitialPlacements.length > 0,
      },
    },
    architecture: {
      gameBalanceRuntimeImporters: gameBalanceImporters,
      balanceContractRuntimeImporters: balanceContractImporters,
    },
    warnings: [],
  };

  if (report.narrative.runtimeSummary.choicesWithConditionalOutcomes === 0) {
    report.warnings.push('No conditional outcomes found in runtime choices.');
  }
  if (report.narrative.branchingConfig.minBranchingAge >= 8) {
    report.warnings.push(`Auto-branching starts at age ${report.narrative.branchingConfig.minBranchingAge}.`);
  }
  if (report.architecture.gameBalanceRuntimeImporters.length === 0) {
    report.warnings.push('gameBalance.ts has no runtime importers.');
  }
  if (report.monetization.gameOver.dualAdTriggers) {
    report.warnings.push('Game over flow has both rewarded and interstitial ad triggers.');
  }
  if (report.narrative.runtimeSummary.futureChoiceRatio < 0.1) {
    report.warnings.push(
      `Future event ratio is low (${round(report.narrative.runtimeSummary.futureChoiceRatio * 100, 2)}%).`
    );
  }

  if (OUT_PATH) {
    fs.writeFileSync(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  }

  if (JSON_MODE) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printSection('Design Audit Summary', [
      `Generated at: ${report.generatedAt}`,
      `Events (source/runtime): ${report.narrative.eventTotals.sourceTotal}/${report.narrative.eventTotals.runtimeTotal}`,
      `Avg choices per event (runtime): ${report.narrative.runtimeSummary.avgChoicesPerEvent}`,
      `Future choices (runtime): ${report.narrative.runtimeSummary.choicesWithFutureEvents}/${report.narrative.runtimeSummary.staticChoices}`,
      `Conditional outcomes (runtime): ${report.narrative.runtimeSummary.choicesWithConditionalOutcomes}`,
      `Auto-gate ratio preview: ${round(report.narrative.branchingStats.preview.gateRatio * 100, 2)}%`,
      `Auto-block ratio within gated preview: ${round(report.narrative.branchingStats.preview.blockGivenGateRatio * 100, 2)}%`,
      `Min branching age: ${report.narrative.branchingConfig.minBranchingAge}`,
      `Action count age 0/3/4: ${report.coreLoop.actionAvailabilityByAge['0'].actions}/${report.coreLoop.actionAvailabilityByAge['3'].actions}/${report.coreLoop.actionAvailabilityByAge['4'].actions}`,
      `Interstitial cap/cooldown(ms): ${report.monetization.defaultInterstitialSessionLimit}/${report.monetization.defaultInterstitialCooldownProdMs}`,
      `IAP disabled (ad-only): ${report.monetization.adOnlyBuildDetected}`,
      `Game over dual ad triggers: ${report.monetization.gameOver.dualAdTriggers}`,
    ]);

    if (report.warnings.length > 0) {
      printSection('Warnings', report.warnings.map(item => `- ${item}`));
    }
  }

  if (CI_MODE) {
    const gateRatio = report.narrative.branchingStats.preview.gateRatio;
    const futureChoiceRatio = report.narrative.runtimeSummary.futureChoiceRatio;
    const underBranchingLeakRatio = safeRatio(
      report.narrative.runtimeSummary.underBranchingAgeWithGate,
      report.narrative.runtimeSummary.eventsUnderBranchingAge
    );

    const thresholds = {
      minEventCount: getEnvNumber('DESIGN_AUDIT_MIN_EVENT_COUNT', 300),
      minAverageChoices: getEnvNumber('DESIGN_AUDIT_MIN_AVG_CHOICES', 2.0),
      minFutureChoiceRatio: getEnvNumber('DESIGN_AUDIT_MIN_FUTURE_CHOICE_RATIO', 0.03),
      minGateRatio: getEnvNumber('DESIGN_AUDIT_MIN_GATE_RATIO', 0.12),
      maxGateRatio: getEnvNumber('DESIGN_AUDIT_MAX_GATE_RATIO', 0.3),
      maxUnderBranchingGateLeakRatio: getEnvNumber('DESIGN_AUDIT_MAX_UNDER_BRANCHING_LEAK_RATIO', 0.01),
      minAge3Actions: getEnvNumber('DESIGN_AUDIT_MIN_AGE3_ACTIONS', 8),
      minAge4Actions: getEnvNumber('DESIGN_AUDIT_MIN_AGE4_ACTIONS', 12),
      maxInterstitialSessionCap: getEnvNumber('DESIGN_AUDIT_MAX_INTERSTITIAL_SESSION_CAP', 3),
      maxGameOverAdTriggers: getEnvNumber('DESIGN_AUDIT_MAX_GAME_OVER_AD_TRIGGERS', 2),
    };

    const gameOverAdTriggerCount =
      report.monetization.gameOver.rewardedPlacements.length
      + report.monetization.gameOver.interstitialPlacements.length;

    const failures = [];
    if (report.narrative.eventTotals.runtimeTotal < thresholds.minEventCount) {
      failures.push(
        `Event count too low: ${report.narrative.eventTotals.runtimeTotal} < ${thresholds.minEventCount}`
      );
    }
    if (report.narrative.runtimeSummary.avgChoicesPerEvent < thresholds.minAverageChoices) {
      failures.push(
        `Average choices too low: ${report.narrative.runtimeSummary.avgChoicesPerEvent} < ${thresholds.minAverageChoices}`
      );
    }
    if (futureChoiceRatio < thresholds.minFutureChoiceRatio) {
      failures.push(
        `Future choice ratio too low: ${futureChoiceRatio} < ${thresholds.minFutureChoiceRatio}`
      );
    }
    if (gateRatio < thresholds.minGateRatio || gateRatio > thresholds.maxGateRatio) {
      failures.push(
        `Gate ratio out of range: ${gateRatio} not in [${thresholds.minGateRatio}, ${thresholds.maxGateRatio}]`
      );
    }
    if (underBranchingLeakRatio > thresholds.maxUnderBranchingGateLeakRatio) {
      failures.push(
        `Under-branching-age gate leak too high: ${underBranchingLeakRatio} > ${thresholds.maxUnderBranchingGateLeakRatio}`
      );
    }
    if (report.coreLoop.actionAvailabilityByAge['3'].actions < thresholds.minAge3Actions) {
      failures.push(
        `Age 3 actions too low: ${report.coreLoop.actionAvailabilityByAge['3'].actions} < ${thresholds.minAge3Actions}`
      );
    }
    if (report.coreLoop.actionAvailabilityByAge['4'].actions < thresholds.minAge4Actions) {
      failures.push(
        `Age 4 actions too low: ${report.coreLoop.actionAvailabilityByAge['4'].actions} < ${thresholds.minAge4Actions}`
      );
    }
    if (
      typeof report.monetization.defaultInterstitialSessionLimit === 'number'
      && report.monetization.defaultInterstitialSessionLimit > thresholds.maxInterstitialSessionCap
    ) {
      failures.push(
        `Interstitial session cap too high: ${report.monetization.defaultInterstitialSessionLimit} > ${thresholds.maxInterstitialSessionCap}`
      );
    }
    if (gameOverAdTriggerCount > thresholds.maxGameOverAdTriggers) {
      failures.push(
        `Game over ad trigger count too high: ${gameOverAdTriggerCount} > ${thresholds.maxGameOverAdTriggers}`
      );
    }

    if (failures.length > 0) {
      failures.forEach(message => console.error(`[design:audit:ci] ${message}`));
      process.exitCode = 1;
    } else {
      console.log('[design:audit:ci] Design audit thresholds passed.');
    }
  }
};

run();
