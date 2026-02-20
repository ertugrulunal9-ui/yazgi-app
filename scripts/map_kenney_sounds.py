"""
Map Kenney.nl CC0 audio assets to Yazgı game sound slots.
Converts OGG to WAV using ffmpeg.
"""

import subprocess
import os
import shutil
import tempfile

FFMPEG = r"C:\Program Files\SOLIDWORKS Corp\SOLIDWORKS\FloXpress\bin\ffmpeg.exe"
SFX_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'sounds', 'sfx')

TMP = tempfile.gettempdir()
INTERFACE = os.path.join(TMP, 'kenney_interface', 'Audio')
RPG = os.path.join(TMP, 'kenney_rpg', 'Audio')
CASINO = os.path.join(TMP, 'kenney_casino', 'Audio')

# Map: game_sound_id -> source OGG file
SOUND_MAP = {
    # UI Sounds - from Interface Sounds pack
    'button_click': os.path.join(INTERFACE, 'click_003.ogg'),
    'button_hover': os.path.join(INTERFACE, 'tick_001.ogg'),

    # Stat Changes - from Interface Sounds pack
    'stat_gain': os.path.join(INTERFACE, 'confirmation_002.ogg'),
    'stat_loss': os.path.join(INTERFACE, 'error_004.ogg'),

    # Achievements - from Interface Sounds pack
    'achievement_unlock': os.path.join(INTERFACE, 'maximize_008.ogg'),
    'level_up': os.path.join(INTERFACE, 'confirmation_004.ogg'),

    # Events - from Interface Sounds pack + RPG
    'event_start': os.path.join(INTERFACE, 'open_001.ogg'),
    'turn_advance': os.path.join(RPG, 'bookFlip1.ogg'),

    # Money - from RPG (coins) and Casino (chips)
    'money_gain': os.path.join(RPG, 'handleCoins.ogg'),
    'money_loss': os.path.join(RPG, 'handleCoins2.ogg'),
    'money_broke': os.path.join(INTERFACE, 'error_008.ogg'),

    # Alerts
    'health_critical': os.path.join(INTERFACE, 'error_006.ogg'),
    'notification': os.path.join(INTERFACE, 'pluck_002.ogg'),

    # School - from RPG (book sounds)
    'grade_good': os.path.join(INTERFACE, 'confirmation_001.ogg'),
    'grade_bad': os.path.join(INTERFACE, 'error_001.ogg'),
}


def convert_ogg_to_wav(src_ogg, dst_wav):
    """Convert OGG to WAV using ffmpeg."""
    result = subprocess.run(
        [FFMPEG, '-y', '-i', src_ogg, dst_wav],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f"  ERROR: {result.stderr[-200:]}")
        return False
    return True


def main():
    os.makedirs(SFX_DIR, exist_ok=True)

    success = 0
    failed = 0

    for sound_id, src_path in SOUND_MAP.items():
        dst_path = os.path.join(SFX_DIR, f"{sound_id}.wav")

        if not os.path.exists(src_path):
            print(f"  MISSING: {src_path}")
            failed += 1
            continue

        print(f"Converting {sound_id}...")
        if convert_ogg_to_wav(src_path, dst_path):
            size_kb = os.path.getsize(dst_path) / 1024
            print(f"  -> {dst_path} ({size_kb:.1f} KB)")
            success += 1
        else:
            failed += 1

    print(f"\nDone: {success} converted, {failed} failed")


if __name__ == '__main__':
    main()
