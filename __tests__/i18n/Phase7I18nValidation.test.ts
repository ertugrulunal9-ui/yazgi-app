import fs from 'fs';
import path from 'path';
import ts from 'typescript';

type FlatEntry = {
  key: string;
  value: string;
};

type TranslationUsage = {
  filePath: string;
  line: number;
  key: string;
};

const PROJECT_ROOT = path.join(__dirname, '..', '..');
const SRC_ROOT = path.join(PROJECT_ROOT, 'src');
const KEY_REFERENCE_TARGETS = [
  path.join(SRC_ROOT, 'appShell'),
  path.join(SRC_ROOT, 'screens', 'MainMenuScreen.tsx'),
  path.join(SRC_ROOT, 'screens', 'GameScreen.tsx'),
  path.join(SRC_ROOT, 'screens', 'GameOverScreen.tsx'),
];

const walkFiles = (rootDir: string): string[] => {
  if (!fs.existsSync(rootDir)) return [];

  return fs.readdirSync(rootDir, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(fullPath);
    }

    return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : [];
  });
};

const isStringsModuleSpecifier = (specifier: string): boolean => (
  /(?:^|\/)i18n\/strings$/.test(specifier.replace(/\\/g, '/'))
);

const getReturnedCallExpression = (
  fn: ts.ArrowFunction | ts.FunctionExpression
): ts.CallExpression | null => {
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
};

const unwrapTranslatorWrapper = (
  node: ts.Expression | undefined
): ts.ArrowFunction | ts.FunctionExpression | null => {
  if (!node) return null;
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    return node;
  }
  if (!ts.isCallExpression(node) || node.arguments.length === 0) {
    return null;
  }

  const [firstArg] = node.arguments;
  return ts.isArrowFunction(firstArg) || ts.isFunctionExpression(firstArg)
    ? firstArg
    : null;
};

const getTranslatorBindings = (sourceFile: ts.SourceFile): Map<string, number> => {
  const bindings = new Map<string, number>();

  const register = (name: string, keyArgIndex: number): void => {
    bindings.set(name, keyArgIndex);
  };

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier.getText(sourceFile).slice(1, -1);
      if (!isStringsModuleSpecifier(moduleSpecifier)) {
        ts.forEachChild(node, visit);
        return;
      }

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
          const nestedKeyArgIndex = bindings.get(returnedCall.expression.text) ?? -1;
          const nestedKeyArg = returnedCall.arguments[nestedKeyArgIndex];

          if (nestedKeyArg && ts.isIdentifier(nestedKeyArg) && nestedKeyArg.text === keyParamName) {
            register(node.name.text, 0);
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return bindings;
};

const getLiteralText = (node: ts.Expression): string | null => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  return null;
};

const extractTranslationUsages = (filePath: string): TranslationUsage[] => {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
  const bindings = getTranslatorBindings(sourceFile);
  const usages: TranslationUsage[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const keyArgIndex = bindings.get(node.expression.text);
      if (keyArgIndex !== undefined) {
        const keyArg = node.arguments[keyArgIndex];
        const key = keyArg ? getLiteralText(keyArg) : null;

        if (key) {
          const start = sourceFile.getLineAndCharacterOfPosition(node.expression.getStart(sourceFile));
          usages.push({
            filePath: path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/'),
            line: start.line + 1,
            key,
          });
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return usages;
};

const resolveI18nModule = (): {
  strings: Record<string, unknown>;
  t: (
    locale: 'tr' | 'en',
    key: string,
    params?: Record<string, string | number | boolean>,
    fallback?: string
  ) => string;
} => {
  const raw = require('../../src/i18n/strings');
  const mod = raw.default ?? raw;
  return {
    strings: mod.strings,
    t: mod.t,
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const flattenStringEntries = (
  value: unknown,
  prefix = ''
): FlatEntry[] => {
  if (typeof value === 'string') {
    return [{ key: prefix, value }];
  }

  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value).flatMap(([key, child]) => (
    flattenStringEntries(child, prefix ? `${prefix}.${key}` : key)
  ));
};

const setPathValue = (root: Record<string, unknown>, path: string, value: string): void => {
  const segments = path.split('.');
  let cursor: Record<string, unknown> = root;

  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i];
    const next = cursor[segment];
    if (!isRecord(next)) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  }

  cursor[segments[segments.length - 1]] = value;
};

const deletePathValue = (root: Record<string, unknown>, path: string): void => {
  const segments = path.split('.');
  const stack: Array<{ node: Record<string, unknown>; key: string }> = [];
  let cursor: Record<string, unknown> = root;

  for (let i = 0; i < segments.length - 1; i += 1) {
    const key = segments[i];
    const next = cursor[key];
    if (!isRecord(next)) return;
    stack.push({ node: cursor, key });
    cursor = next;
  }

  delete cursor[segments[segments.length - 1]];

  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const { node, key } = stack[i];
    const child = node[key];
    if (isRecord(child) && Object.keys(child).length === 0) {
      delete node[key];
    }
  }
};

describe('Phase 7 i18n validation', () => {
  it('keeps EN leaf-key coverage for all TR leaf keys', () => {
    const { strings } = resolveI18nModule();
    const trEntries = flattenStringEntries(strings.tr);
    const enEntries = flattenStringEntries(strings.en);

    const trLeafKeys = new Set(trEntries.map(entry => entry.key));
    const enLeafKeys = new Set(enEntries.map(entry => entry.key));
    const missingInEn = [...trLeafKeys].filter(key => !enLeafKeys.has(key));

    expect(missingInEn).toEqual([]);
  });

  it('falls back to TR when EN value is missing', () => {
    const { strings, t } = resolveI18nModule();
    const trRoot = strings.tr as Record<string, unknown>;
    const fallbackProbeKey = 'phase7.validationProbe.fallbackText';
    const fallbackProbeValue = 'Phase 7 fallback probe';

    setPathValue(trRoot, fallbackProbeKey, fallbackProbeValue);

    try {
      const resolved = t('en', fallbackProbeKey);
      expect(resolved).toBe(fallbackProbeValue);
    } finally {
      deletePathValue(trRoot, fallbackProbeKey);
    }
  });

  it('emits a single runtime warning when fallback chain is exhausted', () => {
    const previousDev = (global as { __DEV__?: boolean }).__DEV__;
    (global as { __DEV__?: boolean }).__DEV__ = true;
    jest.resetModules();

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    warnSpy.mockClear();

    try {
      const { t } = resolveI18nModule();
      const missingKey = 'phase7.validationProbe.missingKey';

      expect(t('en', missingKey)).toBe(missingKey);
      expect(t('en', missingKey)).toBe(missingKey);

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(String(warnSpy.mock.calls[0][0])).toContain(missingKey);
    } finally {
      warnSpy.mockRestore();
      (global as { __DEV__?: boolean }).__DEV__ = previousDev;
      jest.resetModules();
    }
  });

  it('keeps high-risk UI EN strings under the overflow threshold', () => {
    const { strings } = resolveI18nModule();
    const enEntries = flattenStringEntries(strings.en);
    const scopedPrefixes = [
      'app.',
      'save.',
      'social.',
      'exams.',
      'game.',
      'dashboard.',
      'header.',
      'eventLog.',
      'errorBoundary.',
      'tutorial.',
      'actions.',
      'messages.',
      'dialogs.',
      'buttons.',
      'character.screen.',
      'npc.',
      'achievements.',
    ];

    const scopedEntries = enEntries.filter(entry => (
      scopedPrefixes.some(prefix => entry.key.startsWith(prefix))
    ));
    const maxLength = scopedEntries.reduce(
      (max, entry) => Math.max(max, entry.value.length),
      0
    );

    expect(maxLength).toBeLessThanOrEqual(90);
  });

  it('keeps literal translation call-sites backed by TR catalog keys', () => {
    const { strings } = resolveI18nModule();
    const trLeafKeys = new Set(
      flattenStringEntries(strings.tr).map(entry => entry.key)
    );

    const missingUsages = KEY_REFERENCE_TARGETS
      .flatMap(target => (fs.statSync(target).isDirectory() ? walkFiles(target) : [target]))
      .flatMap(extractTranslationUsages)
      .filter(usage => !trLeafKeys.has(usage.key));

    expect(missingUsages).toEqual([]);
  });
});
