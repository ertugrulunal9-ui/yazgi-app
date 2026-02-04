# 🎵 Audio System - Quick Reference

## 🚀 Immediate Next Steps

### 1. Generate Audio Files (Choose One)

**Option A: Silent Placeholders (Quick Start)**
```powershell
# Windows
.\generate-silent-audio.ps1
```
- Takes ~30 seconds
- Creates silent MP3 files
- No sound but prevents errors
- Good for development/testing

**Option B: Download Real Audio**
- See `assets/sounds/README.md` for sources
- Place 5 music tracks in `assets/sounds/music/`
- Place 16 SFX files in `assets/sounds/sfx/`
- Restart Metro bundler after adding files

### 2. Test Integration
```bash
npm start
# Press 'w' for web
```

**Quick Test:**
1. Look for Volume2 icon in top-right header (🔊)
2. Click it → AudioSettings modal opens
3. Move sliders → volumes change
4. Click mute → icon turns red
5. Start game → music plays
6. Perform action → sounds play

### 3. Verify Sounds Work

| Action | Expected Sound |
|--------|----------------|
| Click Volume2 button | `button_click.mp3` |
| Start game | `button_click.mp3` + menu music |
| Turn 1 (age 0) | Childhood music crossfades in |
| Perform action | `stat_gain.mp3` or `stat_loss.mp3` |
| Earn money | `money_gain.mp3` |
| Age increases | `level_up.mp3` + music changes |
| Event appears | `event_start.mp3` |
| Unlock achievement | `achievement_unlock.mp3` |
| Report card (good) | `grade_good.mp3` |
| Health drops to 20 | `health_critical.mp3` |

---

## 🎚️ Using AudioSettings

**Access:** Click Volume2 icon (🔊) in top-right header

**Controls:**
- **Master Volume** - Affects all audio
- **Music Volume** - Background music only
- **SFX Volume** - Sound effects only
- **Mute Toggle** - Instantly mute/unmute all

**Tips:**
- Move SFX slider to hear test sound
- Settings save automatically (AsyncStorage)
- Mute button shows red when muted, green when active

---

## 🔧 Customizing Sounds

### Change Default Volumes
Edit `src/audio/soundDefinitions.ts`:
```typescript
volume: 0.7, // Change to 0.0-1.0
```

### Add New Sound
1. Add MP3 file to `assets/sounds/sfx/`
2. Add definition in `soundDefinitions.ts`:
```typescript
new_sound: {
  id: 'new_sound',
  type: 'SFX',
  file: require('../../assets/sounds/sfx/new_sound.mp3'),
  volume: 0.8,
  preload: false
}
```
3. Use in App.tsx:
```typescript
sounds.playSFX('new_sound');
```

### Change Music Track
Replace file in `assets/sounds/music/` with same name

### Adjust Crossfade Duration
Edit `src/audio/MusicPlayer.ts`:
```typescript
const CROSSFADE_DURATION = 2000; // milliseconds
```

---

## 📁 File Structure

```
assets/sounds/
├── music/              # Background music (5 files)
│   ├── menu.mp3       # Setup screen
│   ├── childhood.mp3  # Ages 0-7
│   ├── school.mp3     # Ages 7-14
│   ├── teen.mp3       # Ages 14-18
│   └── gameover.mp3   # Ending screen
│
└── sfx/               # Sound effects (16 files)
    ├── button_click.mp3
    ├── stat_gain.mp3
    ├── money_gain.mp3
    ├── achievement_unlock.mp3
    ├── level_up.mp3
    └── ... (11 more)

src/audio/
├── AudioManager.ts         # Core manager
├── MusicPlayer.ts          # Music system
└── soundDefinitions.ts     # Sound registry

src/components/
└── AudioSettings.tsx       # Volume UI

src/hooks/
└── useAudio.tsx           # React hooks
```

---

## 🎮 Hook API Reference

### useAudio()
```typescript
const { 
  playSFX,           // (soundId: string) => void
  playMusic,         // (trackId: string) => void
  playMusicForAge,   // (age: number, isGameOver?: boolean) => void
  stopMusic,         // (fade?: boolean) => void
  pauseMusic,        // () => void
  resumeMusic,       // () => void
  setMasterVolume,   // (volume: number) => void
  setMusicVolume,    // (volume: number) => void
  setSFXVolume,      // (volume: number) => void
  setMuted           // (muted: boolean) => void
} = useAudio();
```

### useGameSounds()
```typescript
const sounds = useGameSounds();

sounds.playClick();         // Button clicks
sounds.playStatGain();      // Stat increased
sounds.playStatLoss();      // Stat decreased
sounds.playMoneyGain();     // Money earned
sounds.playMoneyLoss();     // Money spent
sounds.playMoneyBroke();    // No money left
sounds.playAchievement();   // Achievement unlocked
sounds.playLevelUp();       // Age increased
sounds.playEvent();         // Event started
sounds.playTurnAdvance();   // Turn advanced
sounds.playHealthCritical(); // Low health
sounds.playGradeGood();     // Good report card
sounds.playGradeBad();      // Bad report card
sounds.playNotification();  // Generic alert
```

---

## 🐛 Common Issues

### No sound playing
1. Check audio files exist in `assets/sounds/`
2. Run `.\generate-silent-audio.ps1` if missing
3. Check AudioSettings - ensure volumes > 0 and mute off
4. Restart Metro bundler
5. Click any button first (browser autoplay policy)

### Music doesn't change on age
1. Verify music files exist
2. Check console for errors
3. Ensure `playMusicForAge()` is called in useEffect

### Sounds overlap/spam
- Normal - AudioManager limits to 3 concurrent SFX
- Reduce if needed in `AudioManager.ts` → `MAX_CONCURRENT_SOUNDS`

### Settings don't save
- AsyncStorage issue - check browser storage permissions
- Clear cache and try again

---

## 📖 Documentation Links

- **Full Integration Guide**: [AUDIO_INTEGRATION.md](AUDIO_INTEGRATION.md)
- **Complete Summary**: [AUDIO_COMPLETE_SUMMARY.md](AUDIO_COMPLETE_SUMMARY.md)
- **Asset Instructions**: [assets/sounds/README.md](assets/sounds/README.md)

---

## ✅ Checklist for Production

- [ ] Generate or download all 21 audio files
- [ ] Test volume controls work
- [ ] Test mute toggle works
- [ ] Test music changes on age progression
- [ ] Test sound effects play on actions
- [ ] Test settings persist after reload
- [ ] Test on web browser
- [ ] Test on Android device
- [ ] Test on iOS device
- [ ] Replace silent placeholders with real audio (if used)

---

**Audio system is ready to use! Generate files and test.** 🎵
