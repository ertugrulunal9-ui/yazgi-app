# Yazgı - Test Suite Documentation

## 📋 Overview

Comprehensive test suite for Yazgı life simulation game with 80%+ code coverage target.

**Tech Stack:**
- Jest 29.7.0 - Test runner
- React Native Testing Library 12.4.3 - Component testing
- TypeScript 5.9.2 - Type safety

## 🚀 Quick Start

### Installation

```bash
npm install
```

All test dependencies are included in `package.json` devDependencies.

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (for development)
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode (strict)
npm run test:ci

# Verbose output
npm run test:verbose

# Debug mode
npm run test:debug
```

## 📁 Test Structure

```
__tests__/
├── setup.ts                        # Global test configuration
├── mocks/
│   ├── AsyncStorage.mock.ts        # Storage mock (in-memory)
│   ├── Firebase.mock.ts            # Analytics mock
│   ├── Audio.mock.ts               # Audio system mock
│   └── ExpoVectorIcons.mock.ts     # Icon mock
├── utils/                          # HIGH PRIORITY
│   ├── gameLogic.test.ts           # Core game utils (80+ assertions)
│   ├── statCalculations.test.ts    # Stat math (70+ assertions)
│   └── eventSelector.test.ts       # Event selection (60+ assertions)
├── systems/
│   ├── saveManager.test.ts         # Save/load (90+ assertions)
│   └── achievementSystem.test.ts   # Achievements (70+ assertions)
├── hooks/
│   ├── useStats.test.ts            # Stats hook
│   └── useEvents.test.ts           # Events hook
├── components/
│   ├── StatBar.test.tsx            # UI component
│   └── ActionButton.test.tsx       # Interactive component
└── integration/
    └── gameFlow.test.ts            # Full game flow (100+ assertions)
```

## ✅ Test Coverage

**Current Target:** 80%+ across all metrics

### Coverage Areas

| Category | Target | Priority |
|----------|--------|----------|
| Statements | 80% | HIGH |
| Branches | 75% | HIGH |
| Functions | 80% | HIGH |
| Lines | 80% | HIGH |

### Priority Breakdown

**HIGH PRIORITY** (Core Logic):
- ✅ Stat calculations (gain, diminishing returns, caps)
- ✅ Event selection (probability, age-based filtering)
- ✅ Save/load system (data integrity, migration)
- ✅ Achievement unlock conditions
- ✅ Game state transitions

**MEDIUM PRIORITY**:
- ✅ Component rendering
- ✅ Hook behavior
- ✅ UI interactions
- Error handling

**LOW PRIORITY**:
- Styling
- Analytics calls
- Audio playback

## 🧪 Test Examples

### Stat Calculations

```typescript
describe('statCalculations', () => {
  it('should apply diminishing returns', () => {
    const gain = calculateStatGain(90, 10); // High stat, small gain
    expect(gain).toBeLessThan(5);
  });

  it('should respect stat caps', () => {
    const newStat = clamp(120, 0, 100);
    expect(newStat).toBe(100);
  });
});
```

### Save System

```typescript
describe('SaveManager', () => {
  it('should save and load game state', async () => {
    const state = { age: 10, stats: {...} };
    await SaveManager.save('slot1', state);
    const loaded = await SaveManager.load('slot1');
    expect(loaded).toEqual(state);
  });

  it('should handle corrupted save', async () => {
    const result = await SaveManager.load('corrupted');
    expect(result).toBeNull();
  });
});
```

### Achievement System

```typescript
describe('AchievementSystem', () => {
  it('should unlock when condition met', () => {
    const state = { stats: { intelligence: 95 } };
    const unlocked = checkAchievement('GENIUS', state);
    expect(unlocked).toBe(true);
  });
});
```

## 🎯 Mocking Strategy

### AsyncStorage
- **Implementation**: In-memory object
- **Location**: `__tests__/mocks/AsyncStorage.mock.ts`
- **Usage**: Automatic via `setup.ts`

```typescript
// Test helper methods
AsyncStorage.__CLEAR__()          // Clear all data
AsyncStorage.__GET_STORAGE__()    // Inspect current state
```

### Firebase Analytics
- **Implementation**: Jest spy functions
- **Location**: `__tests__/mocks/Firebase.mock.ts`
- **Methods**: `logEvent`, `setUserId`, `setUserProperties`

### Audio (expo-av)
- **Implementation**: No-op functions
- **Location**: `__tests__/mocks/Audio.mock.ts`
- **Returns**: Resolved promises with mock sound objects

### Time
- **Control**: `jest.useFakeTimers()`
- **Usage**: For debouncing, auto-save, animations

## 📊 Coverage Reports

### Generate Report

```bash
npm run test:coverage
```

### View HTML Report

```bash
# After running coverage
open coverage/lcov-report/index.html
```

### Coverage Thresholds

Configured in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
  },
}
```

**Build will fail** if coverage drops below threshold.

## 🔧 Configuration

### jest.config.js

Key settings:
- **Preset**: `react-native`
- **Setup**: `__tests__/setup.ts`
- **Transform ignore**: Expo/React Native packages
- **Module mapper**: Path aliases (`@/` → `src/`)

### TypeScript

Tests use same `tsconfig.json` as main app. Type checking included in CI.

## 🛠️ Writing New Tests

### File Naming

```
{component_name}.test.ts     # Utils/systems
{component_name}.test.tsx    # Components
```

### Test Template

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('MyFeature', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Arrange
    const input = {...};
    
    // Act
    const result = myFunction(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### Component Test Template

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('should handle press', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <MyComponent title="Button" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

## 🚦 CI/CD Integration

### Pre-commit Hook (Husky)

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test"
    }
  }
}
```

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:ci
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## 📈 Test Metrics

### Current Coverage (Target)

```
--------------------------------|---------|----------|---------|---------|
File                            | % Stmts | % Branch | % Funcs | % Lines |
--------------------------------|---------|----------|---------|---------|
All files                       |   80+   |   75+    |   80+   |   80+   |
 utils/                         |   90+   |   85+    |   90+   |   90+   |
  gameUtils.ts                  |   95    |   90     |   95    |   95    |
  statCalculations.ts           |   100   |   100    |   100   |   100   |
 save/                          |   85+   |   80+    |   85+   |   85+   |
  SaveManager.ts                |   90    |   85     |   90    |   90    |
 hooks/                         |   75+   |   70+    |   75+   |   75+   |
 components/                    |   70+   |   65+    |   70+   |   70+   |
--------------------------------|---------|----------|---------|---------|
```

## 🐛 Debugging Tests

### Watch Single File

```bash
npm run test:watch -- eventSelector.test
```

### Run Single Test

```bash
npm test -- --testNamePattern="should apply diminishing returns"
```

### Debug in VSCode

`.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## 📚 Best Practices

### ✅ DO

- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ Arrange-Act-Assert pattern
- ✅ Mock external dependencies
- ✅ Test edge cases (0, null, max values)
- ✅ Keep tests isolated (no shared state)

### ❌ DON'T

- ❌ Test framework internals
- ❌ Duplicate coverage
- ❌ Use real timers in tests
- ❌ Commit with failing tests
- ❌ Skip flaky tests (fix them!)
- ❌ Test private methods directly

## 🔍 Common Issues

### Mock not working

**Problem**: Mock not applied  
**Solution**: Check `jest.mock()` is before imports

### Async tests timeout

**Problem**: Test hangs  
**Solution**: Add `done` callback or return promise

### Type errors in tests

**Problem**: TypeScript complaints  
**Solution**: Import types from source files

### Coverage not 100%

**Problem**: Unreachable code counted  
**Solution**: Add `/* istanbul ignore */` comments

## 📝 Test Checklist

When adding new features:

- [ ] Write tests BEFORE implementation (TDD)
- [ ] Cover happy path
- [ ] Cover edge cases
- [ ] Cover error cases
- [ ] Update coverage threshold if needed
- [ ] Run `npm run test:coverage` locally
- [ ] Ensure CI passes

## 🎓 Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 📞 Support

For test-related issues:
1. Check this README
2. Review test examples in `__tests__/`
3. Check Jest output for specific errors
4. Review `jest.config.js` for configuration

---

**Last Updated**: 2026-01-20  
**Test Suite Version**: 1.0.0  
**Total Tests**: 50+  
**Total Assertions**: 400+
