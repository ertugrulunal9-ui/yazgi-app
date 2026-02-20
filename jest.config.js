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
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/utils/**/*.{ts,tsx}',
    'src/data/**/*.{ts,tsx}',
    'src/systems/**/*.{ts,tsx}',
    'src/save/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/types.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 25,
      branches: 15,
      functions: 20,
      lines: 25,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@expo/vector-icons$': '<rootDir>/__tests__/mocks/ExpoVectorIcons.mock.ts',
    // Stub missing source modules that are imported but not yet created
    'balanceContract$': '<rootDir>/__tests__/mocks/balanceContract.mock.ts',
    'familyNarrative$': '<rootDir>/__tests__/mocks/familyNarrative.mock.ts',
    'onboardingGuidance$': '<rootDir>/__tests__/mocks/onboardingGuidance.mock.ts',
  },
};
