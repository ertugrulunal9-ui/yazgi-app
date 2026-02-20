"""
Convert downloaded CC0 music tracks to WAV format for Yazgı game.
All tracks are CC0 licensed from OpenGameArt.org.
"""

import subprocess
import os
import tempfile

FFMPEG = r"C:\Program Files\SOLIDWORKS Corp\SOLIDWORKS\FloXpress\bin\ffmpeg.exe"
MUSIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'sounds', 'music')
TMP = tempfile.gettempdir()
JRPG_DIR = os.path.join(TMP, 'jrpg_calm')

# Music mapping: game_slot -> (source_file, description)
MUSIC_MAP = {
    'menu': (
        os.path.join(TMP, 'menu_music.ogg'),
        'Chill Main Menu Music by Augmentality (CC0)'
    ),
    'childhood': (
        os.path.join(JRPG_DIR, 'Calm2 - Childhood Friends.ogg'),
        'Childhood Friends by Juhani Junkala (CC0)'
    ),
    'school': (
        os.path.join(JRPG_DIR, 'Calm3 - Peaceful Days.ogg'),
        'Peaceful Days by Juhani Junkala (CC0)'
    ),
    'teen': (
        os.path.join(TMP, 'teen_music.wav'),
        'Emotional Piano Loop by extenz (CC0)'
    ),
    'gameover': (
        os.path.join(TMP, 'gameover_music.wav'),
        'Sad Game Over by Emma_MA (CC0)'
    ),
}


def convert_to_wav(src, dst):
    """Convert any audio format to WAV using ffmpeg."""
    result = subprocess.run(
        [FFMPEG, '-y', '-i', src, '-ar', '44100', '-ac', '1', '-sample_fmt', 's16', dst],
        capture_output=True, text=True
    )
    return result.returncode == 0


def main():
    os.makedirs(MUSIC_DIR, exist_ok=True)

    for slot, (src_path, description) in MUSIC_MAP.items():
        dst_path = os.path.join(MUSIC_DIR, f"{slot}.wav")

        if not os.path.exists(src_path):
            print(f"  MISSING: {src_path}")
            continue

        print(f"Converting {slot}...")
        print(f"  Source: {description}")

        if convert_to_wav(src_path, dst_path):
            size_mb = os.path.getsize(dst_path) / (1024 * 1024)
            print(f"  -> {dst_path} ({size_mb:.1f} MB)")
        else:
            print(f"  ERROR: Conversion failed for {slot}")

    print("\nDone!")


if __name__ == '__main__':
    main()
