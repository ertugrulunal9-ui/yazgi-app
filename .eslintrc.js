module.exports = {
  root: true,
  extends: ['expo'],
  ignorePatterns: [
    'coverage/',
    'android/',
    'node_modules/',
  ],
  overrides: [
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/consistent-type-imports': 'warn',
        '@typescript-eslint/no-unused-vars': ['warn', {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        }],
      },
    },
    {
      files: ['__tests__/**/*.{ts,tsx}'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
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
