#!/bin/bash
# Script to generate silent placeholder MP3 files for audio system
# Requires ffmpeg to be installed

echo "Generating silent placeholder audio files..."

# Create music directory placeholders (1 second each)
cd assets/sounds/music
echo "Creating music placeholders..."
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame menu.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame childhood.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame school.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame teen.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame gameover.mp3 -y

# Create SFX directory placeholders (<1 second each)
cd ../sfx
echo "Creating SFX placeholders..."
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.1 -q:a 9 -acodec libmp3lame button_click.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.1 -q:a 9 -acodec libmp3lame button_hover.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.2 -q:a 9 -acodec libmp3lame stat_gain.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.2 -q:a 9 -acodec libmp3lame stat_loss.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame achievement_unlock.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame level_up.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame event_start.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.3 -q:a 9 -acodec libmp3lame turn_advance.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.3 -q:a 9 -acodec libmp3lame money_gain.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.3 -q:a 9 -acodec libmp3lame money_loss.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame money_broke.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame health_critical.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.2 -q:a 9 -acodec libmp3lame notification.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame grade_good.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 0.5 -q:a 9 -acodec libmp3lame grade_bad.mp3 -y

cd ../../..
echo "✅ Done! Silent placeholder audio files created."
echo "These files won't produce sound but prevent errors."
echo "Replace with real audio files for production."
