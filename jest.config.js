module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        module: 'commonjs',
        moduleResolution: 'node',
        types: ['jest', 'node'],
      },
    }],
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '[/\\\\]\\.claude[/\\\\]',
    '[/\\\\]\\.agents[/\\\\]',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/utils/**/*.{ts,tsx}',
    'src/data/**/*.{ts,tsx}',
    'src/systems/**/*.{ts,tsx}',
    'src/context/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 65,
      functions: 55,
      lines: 60,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@expo/vector-icons$': '<rootDir>/__tests__/mocks/ExpoVectorIcons.mock.ts',
  },
};
