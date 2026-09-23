# Script to generate silent placeholder MP3 files for audio system
# Requires ffmpeg to be installed

Write-Host "Generating silent placeholder audio files..." -ForegroundColor Cyan

# Create music directory placeholders (1 second each)
Set-Location assets\sounds\music
Write-Host "Creating music placeholders..." -ForegroundColor Yellow
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame menu.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame childhood.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame school.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame teen.mp3 -y
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame gameover.mp3 -y

# Create SFX directory placeholders (<1 second each)
Set-Location ..\sfx
Write-Host "Creating SFX placeholders..." -ForegroundColor Yellow
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

Set-Location ..\..\..
Write-Host "✅ Done! Silent placeholder audio files created." -ForegroundColor Green
Write-Host "These files won't produce sound but prevent errors." -ForegroundColor Gray
Write-Host "Replace with real audio files for production." -ForegroundColor Gray
