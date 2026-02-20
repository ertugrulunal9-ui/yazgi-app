"""Optimize music files for mobile - reduce to 22050 Hz mono."""

import subprocess
import os
import tempfile

FFMPEG = r"C:\Program Files\SOLIDWORKS Corp\SOLIDWORKS\FloXpress\bin\ffmpeg.exe"
MUSIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'sounds', 'music')

def optimize(filename):
    src = os.path.join(MUSIC_DIR, filename)
    tmp = src + '.tmp.wav'
    # Convert to 22050 Hz mono 16-bit
    result = subprocess.run(
        [FFMPEG, '-y', '-i', src, '-ar', '22050', '-ac', '1', '-sample_fmt', 's16', tmp],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        os.replace(tmp, src)
        size_mb = os.path.getsize(src) / (1024 * 1024)
        print(f"  {filename}: {size_mb:.1f} MB")
    else:
        print(f"  ERROR: {filename}")
        if os.path.exists(tmp):
            os.remove(tmp)

def main():
    files = ['menu.wav', 'childhood.wav', 'school.wav', 'teen.wav', 'gameover.wav']
    print("Optimizing music files (22050 Hz mono)...")
    for f in files:
        optimize(f)
    print("Done!")

if __name__ == '__main__':
    main()
