#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SOURCE_ROOTS = [
  path.join(ROOT, 'src', 'data'),
  path.join(ROOT, 'src', 'components', 'exams'),
];
const OUTPUT_FILE = path.join(ROOT, 'scripts', 'localization', 'localization-catalog.json');

const listFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  entries.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
      return;
    }
    if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  });
  return files;
};

const countIndent = (line) => {
  const match = /^(\s*)/.exec(line);
  return match ? match[1].length : 0;
};

const asCatalogEntry = ({ key, fallback, file, line, context }) => ({
  key,
  fallback,
  file: path.relative(ROOT, file).replace(/\\/g, '/'),
  line,
  context,
});

const extractFromActions = (file, content) => {
  const entries = [];
  const lines = content.split('\n');
  let currentActionId = null;

  lines.forEach((lineText, index) => {
    const actionIdMatch = lineText.match(/\bid:\s*['"`]([^'"`]+)['"`]/);
    if (actionIdMatch) currentActionId = actionIdMatch[1];

    const textMatch = lineText.match(/\btext:\s*['"`]([^'"`]+)['"`]/);
    if (textMatch && currentActionId) {
      entries.push(asCatalogEntry({
        key: `content.actions.subActions.${currentActionId}.text`,
        fallback: textMatch[1],
        file,
        line: index + 1,
        context: 'action_text',
      }));
    }

    const feedbackMatch = lineText.match(/\bfeedback:\s*['"`]([^'"`]+)['"`]/);
    if (feedbackMatch && currentActionId) {
      entries.push(asCatalogEntry({
        key: `content.actions.subActions.${currentActionId}.feedback`,
        fallback: feedbackMatch[1],
        file,
        line: index + 1,
        context: 'action_feedback',
      }));
    }
  });

  return entries;
};

const extractFromTraits = (file, content) => {
  const entries = [];
  const lines = content.split('\n');
  let currentTraitId = null;

  lines.forEach((lineText, index) => {
    const traitIdMatch = lineText.match(/\bid:\s*['"`]([^'"`]+)['"`]/);
    if (traitIdMatch) currentTraitId = traitIdMatch[1];

    const nameMatch = lineText.match(/\bname:\s*['"`]([^'"`]+)['"`]/);
    if (nameMatch && currentTraitId) {
      entries.push(asCatalogEntry({
        key: `content.traits.${currentTraitId}.name`,
        fallback: nameMatch[1],
        file,
        line: index + 1,
        context: 'trait_name',
      }));
    }

    const descriptionMatch = lineText.match(/\bdescription:\s*['"`]([^'"`]+)['"`]/);
    if (descriptionMatch && currentTraitId) {
      entries.push(asCatalogEntry({
        key: `content.traits.${currentTraitId}.description`,
        fallback: descriptionMatch[1],
        file,
        line: index + 1,
        context: 'trait_description',
      }));
    }
  });

  return entries;
};

const extractFromExamFile = (file, content) => {
  const entries = [];
  const lines = content.split('\n');
  const examType = path.basename(file).replace('ExamGame.tsx', '').toUpperCase();
  let currentQuestionId = null;
  let currentQuestionIndent = null;

  lines.forEach((lineText, index) => {
    const idMatch = lineText.match(/\bid:\s*['"`]([^'"`]+)['"`]/);
    if (idMatch) {
      currentQuestionId = idMatch[1];
      currentQuestionIndent = countIndent(lineText);
    }

    const questionMatch = lineText.match(/\bquestion:\s*['"`]([^'"`]+)['"`]/);
    if (questionMatch && currentQuestionId) {
      entries.push(asCatalogEntry({
        key: `content.exams.${examType}.questions.${currentQuestionId}.question`,
        fallback: questionMatch[1],
        file,
        line: index + 1,
        context: 'exam_question',
      }));
    }

    const optionsMatch = lineText.match(/\boptions:\s*\[([^\]]+)\]/);
    if (optionsMatch && currentQuestionId) {
      const options = optionsMatch[1]
        .split(',')
        .map(part => part.trim())
        .map(part => part.replace(/^['"`]|['"`]$/g, ''))
        .filter(Boolean);

      options.forEach((option, optionIndex) => {
        entries.push(asCatalogEntry({
          key: `content.exams.${examType}.questions.${currentQuestionId}.options.${optionIndex}`,
          fallback: option,
          file,
          line: index + 1,
          context: 'exam_option',
        }));
      });
    }

    if (currentQuestionId && currentQuestionIndent !== null) {
      const currentIndent = countIndent(lineText);
      if (lineText.trim().startsWith('},') && currentIndent <= currentQuestionIndent) {
        currentQuestionId = null;
        currentQuestionIndent = null;
      }
    }
  });

  return entries;
};

const extractGenericEvents = (file, content) => {
  const entries = [];
  const lines = content.split('\n');
  let currentEventId = null;
  let inChoices = false;
  let choiceBlockDepth = 0;
  let currentChoiceId = null;

  lines.forEach((lineText, index) => {
    if (/\bchoices:\s*\[/.test(lineText)) {
      inChoices = true;
      choiceBlockDepth = countIndent(lineText);
      currentChoiceId = null;
    }
    if (inChoices && lineText.trim().startsWith('],') && countIndent(lineText) <= choiceBlockDepth) {
      inChoices = false;
      currentChoiceId = null;
    }

    const idMatch = lineText.match(/\bid:\s*['"`]([^'"`]+)['"`]/);
    if (idMatch) {
      if (inChoices) {
        currentChoiceId = idMatch[1];
      } else {
        currentEventId = idMatch[1];
      }
    }

    const eventTextMatch = lineText.match(/\btext:\s*['"`]([^'"`]+)['"`]/);
    if (eventTextMatch && currentEventId && !inChoices) {
      entries.push(asCatalogEntry({
        key: `content.events.${currentEventId}.text`,
        fallback: eventTextMatch[1],
        file,
        line: index + 1,
        context: 'event_text',
      }));
    }

    if (eventTextMatch && currentEventId && inChoices) {
      const choicePart = currentChoiceId || `idx_${index + 1}`;
      entries.push(asCatalogEntry({
        key: `content.events.${currentEventId}.choices.${choicePart}.text`,
        fallback: eventTextMatch[1],
        file,
        line: index + 1,
        context: 'choice_text',
      }));
    }

    const feedbackMatch = lineText.match(/\bfeedback:\s*['"`]([^'"`]+)['"`]/);
    if (feedbackMatch && currentEventId && inChoices) {
      const choicePart = currentChoiceId || `idx_${index + 1}`;
      entries.push(asCatalogEntry({
        key: `content.events.${currentEventId}.choices.${choicePart}.feedback`,
        fallback: feedbackMatch[1],
        file,
        line: index + 1,
        context: 'choice_feedback',
      }));
    }
  });

  return entries;
};

const uniqueByKeyAndFallback = (entries) => {
  const seen = new Set();
  return entries.filter((entry) => {
    const hash = `${entry.key}::${entry.fallback}`;
    if (seen.has(hash)) return false;
    seen.add(hash);
    return true;
  });
};

const run = () => {
  const files = SOURCE_ROOTS.flatMap(listFiles);
  const entries = [];

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(ROOT, file).replace(/\\/g, '/');

    if (relativePath.endsWith('src/data/actions.ts')) {
      entries.push(...extractFromActions(file, content));
      return;
    }

    if (relativePath.endsWith('src/data/traits.ts')) {
      entries.push(...extractFromTraits(file, content));
      return;
    }

    if (relativePath.includes('src/components/exams/')) {
      entries.push(...extractFromExamFile(file, content));
      return;
    }

    if (relativePath.startsWith('src/data/')) {
      entries.push(...extractGenericEvents(file, content));
    }
  });

  const uniqueEntries = uniqueByKeyAndFallback(entries).sort((a, b) => (
    a.key.localeCompare(b.key) || a.file.localeCompare(b.file) || a.line - b.line
  ));

  const payload = {
    generatedAt: new Date().toISOString(),
    total: uniqueEntries.length,
    entries: uniqueEntries,
  };

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`[i18n:extract] wrote ${uniqueEntries.length} entries to ${path.relative(ROOT, OUTPUT_FILE)}`);
};

run();
