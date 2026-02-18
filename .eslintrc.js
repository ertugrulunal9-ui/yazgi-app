module.exports = {
  root: true,
  extends: ['expo'],
  ignorePatterns: [
    'coverage/',
    'android/',
    'backend/',
    'node_modules/',
    '__tests__/',
    'ACHIEVEMENT_SYSTEM_EXAMPLE.tsx',
    'app/index.tsx',
    'src/config/USAGE_EXAMPLES.ts',
    'vite.config.ts',
  ],
  overrides: [
    {
      files: [
        'src/components/exams/**/*.tsx',
        'src/components/ReportCard.tsx',
        'src/utils/performanceMonitor.ts',
      ],
      rules: {
        'react-hooks/rules-of-hooks': 'off',
      },
    },
  ],
};
