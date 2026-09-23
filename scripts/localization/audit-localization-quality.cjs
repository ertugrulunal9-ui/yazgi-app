#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const PROJECT_ROOT = process.cwd();
const SRC_ROOT = path.join(PROJECT_ROOT, 'src');
const I18N_ROOT = path.join(SRC_ROOT, 'i18n');
const RUNTIME_SCAN_DIRS = [
  path.join(SRC_ROOT, 'appShell'),
  path.join(SRC_ROOT, 'commands'),
  path.join(SRC_ROOT, 'components'),
  path.join(SRC_ROOT, 'context'),
  path.join(SRC_ROOT, 'data'),
  path.join(SRC_ROOT, 'hooks'),
  path.join(SRC_ROOT, 'screens'),
  path.join(SRC_ROOT, 'systems'),
  path.join(SRC_ROOT, 'utils'),
];
const MAX_PRINTED_FINDINGS = 120;
const NON_USER_FACING_RUNTIME_FILES = new Set([
  'src/data/eventRegistry.ts',
  'src/utils/crashTest.ts',
]);
const TRANSLATION_BACKED_FALLBACK_VARS = new Set([
  'COHORT_DISPLAY_FALLBACK',
  'LIFE_GOAL_META',
  'STAT_LABELS',
  'EMOTION_LABELS_TR',
  'EMOTION_LABELS_EN',
  'GRADE_LABELS_TR',
  'GRADE_LABELS_EN',
  'TRADEOFF_TEMPLATES_TR',
  'TRADEOFF_TEMPLATES_EN',
  'PERSONALITY_TRADEOFF_PREFIX_TR',
  'PERSONALITY_TRADEOFF_PREFIX_EN',
  'TRAIT_SHARE_TEMPLATES',
  'ACHIEVEMENT_SHARE_TEMPLATES',
  'ROMANCE_SHARE_TEMPLATES',
  'FATE_SHARE_TEMPLATES',
]);
const NON_LOCALIZABLE_RUNTIME_VARS = new Set([
  'turkishLastNames',
  'turkishCities',
  'turkishMonths',
  'englishMonths',
  'zodiacInfo',
  'zodiacInfoEn',
]);

const ALLOWED_SHORT_TOKENS = new Set([
  'TL',
  'TR',
  'EN',
  'NPC',
  'JSON',
  'QR',
  'Yazgi',
]);

const MOJIBAKE_REGEX = /[ÃÂÄÅ�]|â[\u0080-\u00bf]|ï¸|ðŸ/u;
const TURKISH_CHAR_REGEX = /[\u00c7\u00e7\u011e\u011f\u0130\u0131\u00d6\u00f6\u015e\u015f\u00dc\u00fc]/u;
const ENGLISH_UI_LEAK_REGEX = /\b(event|tutorial|item|legacy|momentum|hub|badge|panel|screen|slot|watch|continue|start|save|load|perk|summary)\b/i;
const TURKISH_WORD_IN_EN_REGEX = /\b(yasinda|yasini|yasina|miras|puan|puani|secim|secenek|arkadas|devam|kapat|rehber|oyun|hayat|ritmi|gucleniyor|kirildi|lutfen|yukleniyor)\b/i;
const ENGLISH_HARDCODED_UI_REGEX = /\b(loading|continue|start|summary|legacy|level|best|previous|next|watch|reward|relationship|warning|status|close|save|load|reset|settings)\b/i;

const SUSPICIOUS_TR_ASCII_TOKENS = new Set([
  'acik',
  'acilir',
  'agir',
  'arkadas',
  'asagi',
  'basla',
  'baslangic',
  'basliyor',
  'bircok',
  'buyuk',
  'cagi',
  'calis',
  'cek',
  'cevir',
  'cik',
  'cikis',
  'cok',
  'degis',
  'deger',
  'dogru',
  'dogum',
  'dondu',
  'dus',
  'duz',
  'etkilesim',
  'gecis',
  'gelistir',
  'gercek',
  'giris',
  'goster',
  'goruntule',
  'gucleniyor',
  'guclen',
  'guncelle',
  'gun',
  'gunu',
  'hic',
  'hos',
  'hosgeldin',
  'iliski',
  'ingilizce',
  'iptal',
  'kapali',
  'kardes',
  'kisi',
  'kotu',
  'kucuk',
  'lutfen',
  'muzik',
  'mukemmel',
  'notr',
  'olcu',
  'ozel',
  'ozellik',
  'ozeti',
  'ozet',
  'ogrenci',
  'ogren',
  'ogret',
  'puani',
  'saglik',
  'sans',
  'sec',
  'secenek',
  'secim',
  'sehir',
  'sifir',
  'simdi',
  'surum',
  'tanis',
  'tuken',
  'turkce',
  'yas',
  'yasam',
  'yasinda',
  'yasini',
  'yasina',
  'yavas',
  'yukle',
  'yukleniyor',
]);

const FINDING_ORDER = [
  'catalog-tr-mojibake',
  'catalog-tr-english-leak',
  'catalog-tr-ascii-turkish',
  'catalog-en-mojibake',
  'catalog-en-turkish-leak',
  'runtime-hardcoded-localizable',
];

function relativePath(filePath) {
  return path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');
}

function walkFiles(rootDir) {
  if (!fs.existsSync(rootDir)) return [];

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkFiles(fullPath));
      continue;
    }

    if (/\.(ts|tsx)$/.test(entry.name)) {
      result.push(fullPath);
    }
  }

  return result;
}

function isEventSourceFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  if (!normalized.startsWith('src/data/')) return false;

  return /(?:^|\/)(?:.+Events|events|storyArcs|npcQuestlineArcs)\.ts$/i.test(normalized);
}

function getPropertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }

  return null;
}

function templateToText(node) {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;

  if (ts.isTemplateExpression(node)) {
    let text = node.head.text;
    for (const span of node.templateSpans) {
      text += `\${${span.expression.getText()}}`;
      text += span.literal.text;
    }
    return text;
  }

  return null;
}

function tokenize(text) {
  return text.match(/[A-Za-z\u00c0-\u017f]+/g) ?? [];
}

function findSuspiciousAsciiTurkishTokens(text) {
  return tokenize(text).filter(token => SUSPICIOUS_TR_ASCII_TOKENS.has(token.toLowerCase()));
}

function hasMojibake(text) {
  return MOJIBAKE_REGEX.test(text);
}

function looksLikeHumanText(text) {
  if (!text) return false;
  if (ALLOWED_SHORT_TOKENS.has(text)) return false;
  if (/^(?:[A-Za-z]:)?[\\/]/.test(text)) return false;
  if (/^[./@#]/.test(text)) return false;
  if (/^https?:\/\//i.test(text)) return false;
  if (/^[A-Za-z0-9_.-]+$/.test(text) && text.length < 20) return false;

  const hasLetters = /[A-Za-z\u00c0-\u017f]/.test(text);
  const hasSentenceSignals = /\s|[.!?:,()[\]{}%]/.test(text) || text.length >= 12;

  return hasLetters && hasSentenceSignals;
}

function shouldIgnoreRuntimeLiteral(text) {
  if (!looksLikeHumanText(text)) return true;
  const placeholderStripped = text.replace(/\$\{[^}]+\}/g, '').trim();
  if (!/[A-Za-z\u00c0-\u017f]/.test(placeholderStripped)) return true;
  if (/^(android|ios|system|light|dark|compact|standard|comfortable)$/i.test(text)) return true;
  if (/^[A-Z0-9_]+$/.test(text)) return true;
  if (/^[a-z0-9_$]+(?:\.[a-z0-9_${}-]+)+$/i.test(text)) return true;
  if (/^[a-z0-9_.-]+$/.test(text) && !/\s/.test(text)) return true;
  return false;
}

function hasIgnoredJsxAttributeAncestor(node) {
  let current = node.parent;

  while (current) {
    if (ts.isJsxAttribute(current)) {
      const name = getPropertyName(current.name);
      if (name === 'testID') {
        return true;
      }
    }

    current = current.parent;
  }

  return false;
}

function hasLocalePropertyAncestor(node) {
  let current = node.parent;

  while (current) {
    if (ts.isPropertyAssignment(current)) {
      const name = getPropertyName(current.name);
      if (name === 'tr' || name === 'en') {
        return true;
      }
    }

    current = current.parent;
  }

  return false;
}

function hasVariableAncestor(node, variableNames) {
  let current = node.parent;

  while (current) {
    if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name) && variableNames.has(current.name.text)) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

function hasFunctionAncestor(node, functionNames) {
  let current = node.parent;

  while (current) {
    if (
      (ts.isFunctionDeclaration(current) || ts.isMethodDeclaration(current))
      && current.name
      && ts.isIdentifier(current.name)
      && functionNames.has(current.name.text)
    ) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

function isFallbackPropertyLiteral(node) {
  return ts.isPropertyAssignment(node.parent)
    && (getPropertyName(node.parent.name) === 'fallback' || getPropertyName(node.parent.name) === 'fallbackLabel');
}

function hasNonUserFacingAncestor(node) {
  let current = node.parent;

  while (current) {
    if (ts.isCallExpression(current) && ts.isPropertyAccessExpression(current.expression)) {
      const target = current.expression.expression.getText();
      const method = current.expression.name.getText();
      if (target === 'console' && ['log', 'info', 'warn', 'error', 'debug'].includes(method)) {
        return true;
      }
      if (target === 'devLog') {
        return true;
      }
    }

    if (ts.isNewExpression(current) && current.expression.getText() === 'Error') {
      return true;
    }

    if (ts.isThrowStatement(current)) {
      return true;
    }

    current = current.parent;
  }

  if (hasFunctionAncestor(node, new Set(['getDetailedReport', 'getChangeReport', 'getSummaryMessage']))) {
    return true;
  }

  return false;
}

function createFinding(type, filePath, line, column, detail, sample) {
  return {
    type,
    filePath: relativePath(filePath),
    line,
    column,
    detail,
    sample,
  };
}

function isStringsModuleSpecifier(specifier) {
  return /(?:^|\/)i18n\/strings$/.test(specifier.replace(/\\/g, '/'));
}

function getReturnedCallExpression(fn) {
  if (ts.isCallExpression(fn.body)) {
    return fn.body;
  }

  if (!ts.isBlock(fn.body)) {
    return null;
  }

  for (const statement of fn.body.statements) {
    if (ts.isReturnStatement(statement) && statement.expression && ts.isCallExpression(statement.expression)) {
      return statement.expression;
    }
  }

  return null;
}

function unwrapTranslatorWrapper(node) {
  if (!node) return null;
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    return node;
  }
  if (!ts.isCallExpression(node) || node.arguments.length === 0) {
    return null;
  }

  const firstArg = node.arguments[0];
  return ts.isArrowFunction(firstArg) || ts.isFunctionExpression(firstArg)
    ? firstArg
    : null;
}

function getTranslatorBindings(sourceFile) {
  const bindings = new Map();

  const register = (name, keyArgIndex) => {
    bindings.set(name, keyArgIndex);
  };

  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier.getText(sourceFile).slice(1, -1);
      if (isStringsModuleSpecifier(moduleSpecifier)) {
        const namedBindings = node.importClause?.namedBindings;
        if (namedBindings && ts.isNamedImports(namedBindings)) {
          namedBindings.elements.forEach(element => {
            const importedName = element.propertyName?.text ?? element.name.text;
            const localName = element.name.text;

            if (importedName === 'tRuntime') {
              register(localName, 0);
            }

            if (importedName === 't') {
              register(localName, 1);
            }
          });
        }
      }
    }

    if (ts.isVariableDeclaration(node)) {
      if (
        ts.isObjectBindingPattern(node.name)
        && node.initializer
        && ts.isCallExpression(node.initializer)
        && ts.isIdentifier(node.initializer.expression)
        && node.initializer.expression.text === 'useUI'
      ) {
        node.name.elements.forEach(element => {
          const bindingName = element.name;
          const propertyName = element.propertyName ?? bindingName;

          if (ts.isIdentifier(bindingName) && ts.isIdentifier(propertyName) && propertyName.text === 't') {
            register(bindingName.text, 0);
          }
        });
      }

      const wrapperFn = unwrapTranslatorWrapper(node.initializer);
      if (
        wrapperFn
        && ts.isIdentifier(node.name)
        && wrapperFn.parameters.length > 0
        && ts.isIdentifier(wrapperFn.parameters[0].name)
      ) {
        const returnedCall = getReturnedCallExpression(wrapperFn);
        const keyParamName = wrapperFn.parameters[0].name.text;

        if (
          returnedCall
          && ts.isIdentifier(returnedCall.expression)
          && bindings.has(returnedCall.expression.text)
        ) {
          const nestedKeyArgIndex = bindings.get(returnedCall.expression.text);
          const nestedKeyArg = returnedCall.arguments[nestedKeyArgIndex];

          if (nestedKeyArg && ts.isIdentifier(nestedKeyArg) && nestedKeyArg.text === keyParamName) {
            register(node.name.text, 0);
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return bindings;
}

function hasTranslatorCallAncestor(node, translatorBindings) {
  let current = node.parent;

  while (current) {
    if (ts.isCallExpression(current) && ts.isIdentifier(current.expression) && translatorBindings.has(current.expression.text)) {
      return true;
    }

    current = current.parent;
  }

  return false;
}

function extractLocaleEntries(filePath) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const entries = [];

  function pushEntry(locale, keyPath, node, value) {
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    entries.push({
      locale,
      keyPath,
      value,
      filePath,
      line: start.line + 1,
      column: start.character + 1,
    });
  }

  function collectValue(locale, keyPath, node) {
    const text = templateToText(node);
    if (text !== null) {
      pushEntry(locale, keyPath.join('.'), node, text);
      return;
    }

    if (ts.isArrayLiteralExpression(node)) {
      node.elements.forEach((element, index) => {
        collectValue(locale, [...keyPath, String(index)], element);
      });
      return;
    }

    if (ts.isObjectLiteralExpression(node)) {
      node.properties.forEach(property => {
        if (!ts.isPropertyAssignment(property)) return;
        const name = getPropertyName(property.name);
        if (!name) return;
        collectValue(locale, [...keyPath, name], property.initializer);
      });
    }
  }

  function visit(node) {
    if (ts.isPropertyAssignment(node)) {
      const name = getPropertyName(node.name);
      if ((name === 'tr' || name === 'en') && ts.isObjectLiteralExpression(node.initializer)) {
        collectValue(name, [], node.initializer);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return entries;
}

function auditCatalogEntry(entry) {
  const findings = [];
  const trimmed = entry.value.trim();
  if (!trimmed) return findings;

  if (hasMojibake(trimmed)) {
    findings.push(
      createFinding(
        `catalog-${entry.locale}-mojibake`,
        entry.filePath,
        entry.line,
        entry.column,
        'Encoding corruption or mojibake in localized string',
        trimmed
      )
    );
  }

  if (entry.locale === 'tr') {
    const englishLeak = ENGLISH_UI_LEAK_REGEX.exec(trimmed);
    if (englishLeak) {
      findings.push(
        createFinding(
          'catalog-tr-english-leak',
          entry.filePath,
          entry.line,
          entry.column,
          `English term in Turkish locale: "${englishLeak[0]}"`,
          trimmed
        )
      );
    }

    const suspiciousTokens = findSuspiciousAsciiTurkishTokens(trimmed);
    if (suspiciousTokens.length > 0) {
      findings.push(
        createFinding(
          'catalog-tr-ascii-turkish',
          entry.filePath,
          entry.line,
          entry.column,
          `Suspicious ASCII-Turkish tokens: ${[...new Set(suspiciousTokens)].slice(0, 6).join(', ')}`,
          trimmed
        )
      );
    }
  }

  if (entry.locale === 'en') {
    if (TURKISH_CHAR_REGEX.test(trimmed) || TURKISH_WORD_IN_EN_REGEX.test(trimmed)) {
      findings.push(
        createFinding(
          'catalog-en-turkish-leak',
          entry.filePath,
          entry.line,
          entry.column,
          'Turkish residue detected in English locale string',
          trimmed
        )
      );
    }
  }

  return findings;
}

function extractRuntimeLiterals(filePath) {
  if (NON_USER_FACING_RUNTIME_FILES.has(relativePath(filePath))) {
    return [];
  }

  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const findings = [];
  const translatorBindings = getTranslatorBindings(sourceFile);

  function pushFinding(node, detail, sample) {
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    findings.push(
      createFinding(
        'runtime-hardcoded-localizable',
        filePath,
        start.line + 1,
        start.character + 1,
        detail,
        sample
      )
    );
  }

  function inspectLiteral(node, rawText) {
    const text = rawText.trim();
    if (shouldIgnoreRuntimeLiteral(text)) return;
    if (hasNonUserFacingAncestor(node)) return;
    if (hasIgnoredJsxAttributeAncestor(node)) return;
    if (hasLocalePropertyAncestor(node)) return;
    if (isFallbackPropertyLiteral(node)) return;
    if (hasVariableAncestor(node, TRANSLATION_BACKED_FALLBACK_VARS)) return;
    if (hasVariableAncestor(node, NON_LOCALIZABLE_RUNTIME_VARS)) return;
    if (relativePath(filePath) === 'src/components/SkillTree.tsx' && hasVariableAncestor(node, new Set(['MAIN_SKILLS', 'OTHER_SKILLS']))) {
      return;
    }
    if (hasTranslatorCallAncestor(node, translatorBindings)) return;

    const looksTurkish = TURKISH_CHAR_REGEX.test(text) || findSuspiciousAsciiTurkishTokens(text).length > 0;
    const looksEnglishUi = ENGLISH_HARDCODED_UI_REGEX.test(text);
    const hasMojibakeText = hasMojibake(text);

    if (!looksTurkish && !looksEnglishUi && !hasMojibakeText) return;

    pushFinding(node, 'User-facing hardcoded text outside i18n catalog', text);
  }

  function visit(node) {
    if (
      ts.isImportDeclaration(node)
      || ts.isExportDeclaration(node)
      || ts.isLiteralTypeNode(node)
      || ts.isPropertySignature(node)
      || ts.isTypeAliasDeclaration(node)
    ) {
      return;
    }

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      inspectLiteral(node, node.text);
    } else if (ts.isTemplateExpression(node)) {
      inspectLiteral(node, templateToText(node) ?? '');
    } else if (ts.isJsxText(node)) {
      inspectLiteral(node, node.getText(sourceFile));
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return findings;
}

function printGroup(title, findings) {
  console.log(`\n${title} (${findings.length})`);
  findings.slice(0, MAX_PRINTED_FINDINGS).forEach(finding => {
    console.log(`- ${finding.filePath}:${finding.line}:${finding.column}`);
    console.log(`  ${finding.detail}`);
    console.log(`  ${JSON.stringify(finding.sample)}`);
  });

  if (findings.length > MAX_PRINTED_FINDINGS) {
    console.log(`- ... ${findings.length - MAX_PRINTED_FINDINGS} more`);
  }
}

function printHotspots(findings) {
  const counts = new Map();

  findings.forEach(finding => {
    counts.set(finding.filePath, (counts.get(finding.filePath) ?? 0) + 1);
  });

  const hotspots = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 20);

  if (hotspots.length === 0) return;

  console.log('\nTop hotspots');
  hotspots.forEach(([filePath, count]) => {
    console.log(`- ${filePath}: ${count}`);
  });
}

function main() {
  const i18nFiles = walkFiles(I18N_ROOT).filter(filePath => !filePath.endsWith('strings.ts'));
  const runtimeFiles = RUNTIME_SCAN_DIRS.flatMap(walkFiles);

  const catalogFindings = i18nFiles
    .flatMap(extractLocaleEntries)
    .flatMap(auditCatalogEntry);
  const runtimeFindings = runtimeFiles
    .filter(filePath => !isEventSourceFile(relativePath(filePath)))
    .flatMap(extractRuntimeLiterals);
  const allFindings = [...catalogFindings, ...runtimeFindings];

  if (allFindings.length === 0) {
    console.log('Localization audit passed: no suspicious findings.');
    return;
  }

  const grouped = new Map();
  allFindings.forEach(finding => {
    if (!grouped.has(finding.type)) {
      grouped.set(finding.type, []);
    }
    grouped.get(finding.type).push(finding);
  });

  console.error(`Localization audit found ${allFindings.length} suspicious strings.`);

  FINDING_ORDER.forEach(type => {
    const group = grouped.get(type);
    if (!group || group.length === 0) return;
    printGroup(type, group);
  });

  const remainingTypes = [...grouped.keys()].filter(type => !FINDING_ORDER.includes(type)).sort();
  remainingTypes.forEach(type => {
    printGroup(type, grouped.get(type));
  });

  printHotspots(allFindings);

  process.exitCode = 1;
}

main();
