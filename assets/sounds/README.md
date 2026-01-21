# Audio Assets

This folder contains all audio files for the game.

## 📁 Directory Structure

```
assets/sounds/
├── music/              # Background music tracks
│   ├── menu.mp3       # Menu/setup screen music
│   ├── childhood.mp3  # Ages 0-7 (early childhood)
│   ├── school.mp3     # Ages 7-14 (school years)
│   ├── teen.mp3       # Ages 14-18 (teenage years)
│   └── gameover.mp3   # Game over/ending screen
│
└── sfx/               # Sound effects
    ├── button_click.mp3      # UI button clicks
    ├── button_hover.mp3      # Button hover (optional)
    ├── stat_gain.mp3         # Positive stat changes
    ├── stat_loss.mp3         # Negative stat changes
    ├── achievement_unlock.mp3 # Achievement unlocked
    ├── level_up.mp3          # Age progression
    ├── event_start.mp3       # Event begins
    ├── turn_advance.mp3      # Turn progression
    ├── money_gain.mp3        # Money earned
    ├── money_loss.mp3        # Money spent
    ├── money_broke.mp3       # Ran out of money
    ├── health_critical.mp3   # Low health warning
    ├── notification.mp3      # Generic notification
    ├── grade_good.mp3        # Good report card
    └── grade_bad.mp3         # Bad report card
```

## 🎵 Getting Audio Files

### Option 1: Use Free Sound Libraries

**Music (2-4 min looping tracks):**
- [Incompetech](https://incompetech.com/music/royalty-free/) - Royalty-free music by Kevin MacLeod
- [Purple Planet](https://www.purple-planet.com/) - Free music for games
- [Bensound](https://www.bensound.com/) - High-quality royalty-free music

**Sound Effects (<1 sec):**
- [Freesound](https://freesound.org/) - Community sound library
- [Zapsplat](https://www.zapsplat.com/) - Free sound effects
- [Mixkit](https://mixkit.co/free-sound-effects/) - Curated free SFX

### Option 2: Generate Silent Placeholders (for development)

Run these commands in your terminal to create 1-second silent MP3 files:

**Windows (PowerShell):**
```powershell
# Install ffmpeg first: winget install ffmpeg
cd assets\sounds\music
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame menu.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame childhood.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame school.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame teen.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame gameover.mp3

cd ..\sfx
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.1 -q:a 9 -acodec libmp3lame button_click.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.1 -q:a 9 -acodec libmp3lame button_hover.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.2 -q:a 9 -acodec libmp3lame stat_gain.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.2 -q:a 9 -acodec libmp3lame stat_loss.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame achievement_unlock.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame level_up.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame event_start.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.3 -q:a 9 -acodec libmp3lame turn_advance.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.3 -q:a 9 -acodec libmp3lame money_gain.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.3 -q:a 9 -acodec libmp3lame money_loss.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame money_broke.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame health_critical.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.2 -q:a 9 -acodec libmp3lame notification.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame grade_good.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame grade_bad.mp3
```

### Option 3: AI Generation

Use AI tools to generate custom audio:
- **Music**: [AIVA](https://www.aiva.ai/), [Suno](https://suno.ai/)
- **SFX**: Describe what you need (e.g., "soft button click", "cash register ding")

## 📊 Recommended Specs

- **Format**: MP3
- **Music**: 128-192 kbps, stereo, 44.1kHz, 2-4 minutes (loops seamlessly)
- **SFX**: 96-128 kbps, mono, 44.1kHz, <1 second for UI sounds

## 🚀 Quick Start

1. **Generate silent placeholders** (or download real audio files)
2. Place files in correct folders (`music/` and `sfx/`)
3. Restart Metro bundler: Press `r` in terminal
4. Test in-game - sounds should play on actions

## 📝 Notes

- Silent placeholders won't produce sound but prevent errors
- Replace with real audio files for production
- Audio system will work even if files are missing (graceful fallback)
