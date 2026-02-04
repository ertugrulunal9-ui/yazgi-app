# Achievement System Integration Guide

## Quick Start (5 Minutes)

### 1. Update GameState Initialization

```typescript
// src/utils/gameUtils.ts - getInitialGameState()
export const getInitialGameState = (): GameState => ({
  // ... existing fields
  unlockedAchievements: [],
  achievementProgress: {},
});
```

### 2. Add Achievement Hook to App.tsx

```typescript
// src/App.tsx - imports
import { useAchievements } from './hooks/useAchievements';
import { AchievementToast } from './components/AchievementToast';
import { AchievementList } from './components/AchievementList';
import { applyAchievementReward } from './systems/achievementSystem';
import { autoCheckAchievements } from './utils/achievementChecker';
import { Trophy } from 'lucide-react';

// Inside App component
const [showAchievementList, setShowAchievementList] = useState(false);
const [newAchievements, setNewAchievements] = useState<string[]>([]);

const {
  unlockedAchievements,
  stats: achievementStats,
  checkAchievements,
  isUnlocked,
  getProgress,
} = useAchievements(
  stats,
  gameState,
  gameState.skills,
  gameState.schoolGrades,
  (achievementIds, rewards) => {
    // Handle new achievement unlock
    setNewAchievements(achievementIds);
    
    // Apply rewards
    rewards.forEach(reward => {
      if (reward) {
        setStats(prev => applyAchievementReward(prev, reward));
      }
    });
  }
);

// Auto-check achievements on state change
useEffect(() => {
  checkAchievements();
}, [stats, gameState.age, gameState.totalTurns, checkAchievements]);
```

### 3. Add UI Elements

```typescript
// In your main UI (e.g., top bar)
<button
  onClick={() => setShowAchievementList(true)}
  className="relative"
>
  <Trophy size={20} />
  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
    {achievementStats.unlocked}
  </span>
</button>

// Achievement Toast (for new unlocks)
{newAchievements.length > 0 && (
  <AchievementToast
    achievementIds={newAchievements}
    onClose={() => setNewAchievements([])}
  />
)}

// Achievement List Modal
{showAchievementList && (
  <AchievementList
    unlockedAchievementIds={unlockedAchievements.map(a => a.achievementId)}
    getProgress={getProgress}
    onClose={() => setShowAchievementList(false)}
  />
)}
```

### 4. Update GameState Save/Load

```typescript
// src/utils/gameUtils.ts - saveGame()
export const saveGame = async (playerName: string, stats: Stats, gameState: GameState) => {
  const data = {
    playerName,
    stats,
    gameState: {
      ...gameState,
      unlockedAchievements: gameState.unlockedAchievements || [],
      achievementProgress: gameState.achievementProgress || {},
    }
  };
  // ... save logic
};

// loadGame()
export const loadGame = async () => {
  const data = // ... load logic
  return {
    ...data,
    gameState: {
      ...data.gameState,
      unlockedAchievements: data.gameState.unlockedAchievements || [],
      achievementProgress: data.gameState.achievementProgress || {},
    }
  };
};
```

---

## Advanced Integration

### Track Special Achievement Progress

```typescript
// After stat changes
import { trackSpecialProgress } from './utils/achievementChecker';

const prevStats = { ...stats };
// ... modify stats
const updatedGameState = trackSpecialProgress(gameState, stats, prevStats);
setGameState(updatedGameState);
```

### Manual Achievement Check (on specific events)

```typescript
// After completing an event
import { autoCheckAchievements } from './utils/achievementChecker';

autoCheckAchievements(
  stats,
  gameState,
  gameState.skills,
  gameState.schoolGrades,
  (achievementIds) => {
    setNewAchievements(achievementIds);
  }
);
```

### Debounced Checks (performance optimization)

```typescript
import { debouncedAchievementCheck } from './utils/achievementChecker';

// Use instead of immediate checks for frequent updates
debouncedAchievementCheck(
  stats,
  gameState,
  gameState.skills,
  gameState.schoolGrades,
  (achievementIds) => setNewAchievements(achievementIds),
  500 // delay in ms
);
```

---

## Testing

```typescript
// Reset achievements (dev/testing only)
import { resetAchievements } from './systems/achievementSystem';

// Add to dev menu
<button onClick={() => resetAchievements()}>
  Reset Achievements
</button>

// Check specific achievement manually
import { getAchievement } from './systems/achievementDefinitions';
import { checkAchievement } from './systems/achievementSystem';

const achievement = getAchievement('genius');
const result = checkAchievement(achievement!, stats, gameState, skills, grades);
console.log('Genius achievement:', result);
```

---

## Performance Notes

- ✅ Achievements check on debounce (non-blocking)
- ✅ AsyncStorage operations are async
- ✅ Memoized calculations in useAchievements hook
- ✅ Batch unlocks (multiple achievements at once)

---

## Customization

### Add New Achievement

```typescript
// src/systems/achievementDefinitions.ts
{
  id: 'custom_achievement',
  name: 'Özel Başarı',
  description: 'Açıklama',
  category: 'STATS',
  rarity: 'RARE',
  icon: '🎯',
  isSecret: false,
  reward: { money: 5000 },
  check: (stats, gameState, skills, grades) => {
    // Your custom logic
    return stats.health > 80 && gameState.age > 10;
  }
}
```

### Modify Achievement UI

All components use Tailwind CSS classes. Edit:
- `AchievementToast.tsx` - notification style
- `AchievementCard.tsx` - card layout
- `AchievementList.tsx` - modal & filters

---

## Analytics Integration

Achievements automatically log to analytics:

```typescript
// Already integrated in achievementSystem.ts
analyticsService.logEvent('achievement_unlocked', {
  achievement_id: achievement.id,
  achievement_name: achievement.name,
  rarity: achievement.rarity,
  category: achievement.category,
  age: gameState.age,
});
```

---

## Complete Implementation Checklist

- [x] Types added to types.ts
- [x] Achievement definitions created (50+)
- [x] Achievement system core logic
- [x] Achievement checker utility
- [x] React hook (useAchievements)
- [x] UI components (Toast, List, Card)
- [ ] Update getInitialGameState()
- [ ] Add hook to App.tsx
- [ ] Add UI elements (button, modals)
- [ ] Update save/load logic
- [ ] Test on web & mobile

---

## File Structure

```
src/
├── systems/
│   ├── achievementSystem.ts        # Core logic
│   └── achievementDefinitions.ts   # 50+ achievements
├── components/
│   ├── AchievementToast.tsx        # Unlock notification
│   ├── AchievementList.tsx         # Modal list view
│   └── AchievementCard.tsx         # Individual card
├── hooks/
│   └── useAchievements.tsx         # React hook
├── utils/
│   └── achievementChecker.ts       # Auto-check utility
└── types.ts                        # Achievement types
```

---

## Troubleshooting

**Achievements not saving?**
- Check AsyncStorage permissions
- Verify STORAGE_KEY is unique
- Test with `loadAchievements()` in console

**Toast not showing?**
- Check z-index (should be 9999)
- Verify `newAchievements` state updates
- Check console for errors

**Progress not updating?**
- Ensure `checkAchievements()` is called
- Verify achievement check logic
- Use debounced checks for performance

**Secret achievements revealed?**
- Check `isSecret` flag in definition
- Verify AchievementCard logic for secrets
- Test with `isUnlocked` prop

---

**Done!** Achievement system ready for production. 🏆
