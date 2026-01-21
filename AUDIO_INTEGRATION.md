# Audio System Integration Guide

## 🎵 Quick Start

### 1. Install Dependencies

```bash
npx expo install expo-av
```

### 2. Add Audio Assets

Place audio files in `assets/sounds/`:

```
assets/sounds/
├── music/
│   ├── menu.mp3
│   ├── childhood.mp3
│   ├── school.mp3
│   ├── teen.mp3
│   └── gameover.mp3
└── sfx/
    ├── button_click.mp3
    ├── button_hover.mp3
    ├── stat_gain.mp3
    ├── stat_loss.mp3
    ├── achievement_unlock.mp3
    ├── level_up.mp3
    ├── event_start.mp3
    ├── turn_advance.mp3
    ├── money_gain.mp3
    ├── money_loss.mp3
    ├── money_broke.mp3
    ├── health_critical.mp3
    ├── notification.mp3
    ├── grade_good.mp3
    └── grade_bad.mp3
```

**Note**: Until you add real audio files, create silent placeholder MP3s (see Asset Generation below).

---

## 📦 Integration Steps

### 1. Initialize Audio in App.tsx

```typescript
import { useAudio, useGameSounds } from './hooks/useAudio';
import { AudioSettings } from './components/AudioSettings';

const App: React.FC = () => {
  const { playMusicForAge, stopMusic } = useAudio();
  const sounds = useGameSounds();
  const [showAudioSettings, setShowAudioSettings] = useState(false);

  // Play age-appropriate music when age changes
  useEffect(() => {
    if (gameState.phase !== 'SETUP' && gameState.phase !== 'GAME_OVER') {
      playMusicForAge(gameState.age);
    }
  }, [gameState.age, gameState.phase, playMusicForAge]);

  // Play game over music
  useEffect(() => {
    if (gameState.phase === 'GAME_OVER') {
      playMusicForAge(gameState.age, true);
    }
  }, [gameState.phase, playMusicForAge, gameState.age]);

  // Stop music on unmount
  useEffect(() => {
    return () => {
      stopMusic(false);
    };
  }, [stopMusic]);

  return (
    <>
      {/* Your existing UI */}
      
      {/* Audio Settings Modal */}
      {showAudioSettings && (
        <AudioSettings
          isOpen={showAudioSettings}
          onClose={() => setShowAudioSettings(false)}
        />
      )}
    </>
  );
};
```

### 2. Add Audio Button to UI

```typescript
import { Volume2 } from 'lucide-react';

// In your settings/menu UI
<button
  onClick={() => setShowAudioSettings(true)}
  className="pressable surface-raised border border-default rounded-lg p-2"
>
  <Volume2 className="icon-density" />
</button>
```

### 3. Hook into Game Events

```typescript
import { useGameSounds } from './hooks/useAudio';

const App: React.FC = () => {
  const sounds = useGameSounds();

  // On button clicks
  const handleButtonClick = () => {
    sounds.playClick();
    // ... your logic
  };

  // On stat changes
  const updateStat = (change: number) => {
    if (change > 0) {
      sounds.playStatGain();
    } else if (change < 0) {
      sounds.playStatLoss();
    }
    // ... update stats
  };

  // On money changes
  const updateMoney = (change: number, newTotal: number) => {
    if (newTotal === 0) {
      sounds.playMoneyBroke();
    } else if (change > 0) {
      sounds.playMoneyGain();
    } else if (change < 0) {
      sounds.playMoneyLoss();
    }
    // ... update money
  };

  // On achievement unlock
  const onAchievementUnlock = () => {
    sounds.playAchievement();
  };

  // On age progression
  const progressAge = () => {
    sounds.playLevelUp();
    // ... age logic
  };

  // On event start
  const startEvent = () => {
    sounds.playEvent();
    // ... event logic
  };

  // On turn advance
  const advanceTurn = () => {
    sounds.playTurnAdvance();
    // ... turn logic
  };

  // On health critical
  useEffect(() => {
    if (stats.health < 20 && stats.health > 0) {
      sounds.playHealthCritical();
    }
  }, [stats.health]);

  // On school grades
  const showReportCard = (averageGrade: number) => {
    if (averageGrade >= 80) {
      sounds.playGradeGood();
    } else if (averageGrade < 50) {
      sounds.playGradeBad();
    }
  };
};
```

---

## 🎨 Asset Generation

### Option 1: Free Sound Libraries

**Music (BGM):**
- [Incompetech (Kevin MacLeod)](https://incompetech.com/music/royalty-free/)
- [Purple Planet](https://www.purple-planet.com/)
- [Bensound](https://www.bensound.com/)

**SFX:**
- [Freesound](https://freesound.org/)
- [Zapsplat](https://www.zapsplat.com/)
- [Mixkit](https://mixkit.co/free-sound-effects/)

### Option 2: AI Generation

Use AI audio tools like:
- [ElevenLabs Music](https://elevenlabs.io/) (music)
- [AIVA](https://www.aiva.ai/) (music)
- Sound effects: describe what you need ("soft UI click", "cash register ding")

### Option 3: Silent Placeholders (Development)

Create 1-second silent MP3 files for testing:

```bash
# Using ffmpeg (install from ffmpeg.org)
cd assets/sounds/music
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame menu.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame childhood.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame school.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame teen.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame gameover.mp3

cd ../sfx
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.1 -q:a 9 -acodec libmp3lame button_click.mp3
# ... repeat for all SFX
```

Or use online tool: [Online Tone Generator](https://www.szynalski.com/tone-generator/)

---

## 🎚️ Volume Controls

Users can adjust volumes in-game via AudioSettings modal:
- Master Volume (0-100%)
- Music Volume (0-100%)
- SFX Volume (0-100%)
- Mute Toggle

Settings persist across sessions via AsyncStorage/localStorage.

---

## 🎭 Advanced Features

### Conditional Sound Playback

```typescript
// Play sound only if stat changed significantly
const prevStats = useRef(stats);

useEffect(() => {
  const healthChange = stats.health - prevStats.current.health;
  
  if (Math.abs(healthChange) >= 10) {
    if (healthChange > 0) sounds.playStatGain();
    if (healthChange < 0) sounds.playStatLoss();
  }

  prevStats.current = stats;
}, [stats]);
```

### Debounced Sounds

```typescript
import { useRef } from 'react';

const lastClickTime = useRef(0);

const handleClick = () => {
  const now = Date.now();
  if (now - lastClickTime.current > 100) { // 100ms debounce
    sounds.playClick();
    lastClickTime.current = now;
  }
};
```

### Dynamic Music on Phase Change

```typescript
useEffect(() => {
  if (gameState.phase === 'SETUP') {
    playMusic('menu');
  } else if (gameState.phase === 'GAME_OVER') {
    playMusic('gameover');
  } else {
    playMusicForAge(gameState.age);
  }
}, [gameState.phase, gameState.age]);
```

---

## ⚡ Performance Tips

1. **Preload Essential Sounds**: Already configured in `soundDefinitions.ts`
2. **Sound Pooling**: Automatically handled (max 3 instances per sound)
3. **Concurrent Limit**: Max 3 simultaneous SFX (prevents audio chaos)
4. **Lazy Loading**: Non-essential sounds load on first play
5. **Memory Cleanup**: Sounds auto-unload on game close

---

## 🐛 Troubleshooting

**"Audio files not found" error:**
- Ensure files exist in `assets/sounds/` with exact names
- Check `soundDefinitions.ts` paths match your structure
- Restart Metro bundler: `r` in terminal

**No sound on web:**
- Browser may block autoplay. User must interact first (click button)
- Check browser console for errors
- Verify audio files are valid MP3 format

**No sound on Android/iOS:**
- Check device volume and silent mode
- Ensure `expo-av` is installed: `npx expo install expo-av`
- Rebuild app: `npx expo run:android` or `eas build`

**Music doesn't crossfade:**
- Verify both tracks exist and are valid
- Check console for MusicPlayer errors
- Increase crossfade duration in code (default 2000ms)

**Volume controls not working:**
- Clear AsyncStorage: `window.localStorage.clear()` (web)
- Check AudioSettings modal is rendering
- Verify slider `onChange` is firing (add console.log)

**Crackling/stuttering:**
- Reduce MAX_CONCURRENT_SOUNDS (default 3)
- Lower audio bitrate (128kbps recommended)
- Check device performance

---

## 📊 Audio File Specs

**Recommended:**
- Format: MP3
- Music: 128-192 kbps, stereo, 44.1kHz
- SFX: 96-128 kbps, mono, 44.1kHz
- Music length: 2-4 minutes (loops seamlessly)
- SFX length: <1 second for UI sounds

**File Sizes:**
- Music: ~2-4MB per track (x5 = 10-20MB total)
- SFX: ~10-50KB per sound (x15 = ~500KB total)
- **Total app size increase: ~10-20MB**

---

## 🎯 Integration Checklist

- [ ] Install `expo-av`
- [ ] Add audio files to `assets/sounds/`
- [ ] Import `useAudio` hook in App.tsx
- [ ] Add `AudioSettings` modal
- [ ] Hook `playMusicForAge` to age changes
- [ ] Hook `sounds.playClick()` to buttons
- [ ] Hook `sounds.playStatGain/Loss()` to stat changes
- [ ] Hook `sounds.playAchievement()` to achievement unlocks
- [ ] Hook `sounds.playLevelUp()` to age progression
- [ ] Hook `sounds.playEvent()` to event starts
- [ ] Hook `sounds.playMoneyGain/Loss()` to money changes
- [ ] Hook `sounds.playHealthCritical()` to low health
- [ ] Test on web
- [ ] Test on Android/iOS device
- [ ] Verify volume controls work
- [ ] Verify settings persist

---

## 🚀 Done!

Audio system is production-ready. Music crossfades smoothly, SFX are pooled for performance, and all settings persist. 🎵

**Next Steps:**
1. Add placeholder audio files (or real ones)
2. Integrate hooks into App.tsx
3. Test thoroughly
4. Adjust volumes to taste

**Optional Enhancements:**
- Spatial audio (3D sound positioning)
- Voice acting for events
- Dynamic music layers (add/remove instruments based on stats)
- Haptic feedback (vibration) on sound events
