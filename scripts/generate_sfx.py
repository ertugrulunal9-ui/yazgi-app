"""
Generate synthesized sound effects for Yazgı game.
Uses Python's built-in wave module + ffmpeg for MP3 conversion.
All sounds are original - no copyright issues.
"""

import wave
import struct
import math
import os
import subprocess
import random

SAMPLE_RATE = 44100
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'sounds', 'sfx')

def generate_tone(freq, duration, volume=0.5, sample_rate=SAMPLE_RATE):
    """Generate a sine wave tone."""
    samples = []
    num_samples = int(sample_rate * duration)
    for i in range(num_samples):
        t = i / sample_rate
        sample = volume * math.sin(2 * math.pi * freq * t)
        samples.append(sample)
    return samples

def generate_noise(duration, volume=0.3, sample_rate=SAMPLE_RATE):
    """Generate white noise."""
    num_samples = int(sample_rate * duration)
    return [volume * (random.random() * 2 - 1) for _ in range(num_samples)]

def apply_envelope(samples, attack=0.01, decay=0.05, sustain_level=0.7, release=0.1):
    """Apply ADSR envelope to samples."""
    total = len(samples)
    sr = SAMPLE_RATE
    attack_samples = int(attack * sr)
    decay_samples = int(decay * sr)
    release_samples = int(release * sr)
    sustain_samples = total - attack_samples - decay_samples - release_samples

    if sustain_samples < 0:
        sustain_samples = 0
        release_samples = total - attack_samples - decay_samples
        if release_samples < 0:
            release_samples = 0
            decay_samples = total - attack_samples

    result = []
    for i in range(total):
        if i < attack_samples:
            env = i / max(attack_samples, 1)
        elif i < attack_samples + decay_samples:
            progress = (i - attack_samples) / max(decay_samples, 1)
            env = 1.0 - (1.0 - sustain_level) * progress
        elif i < attack_samples + decay_samples + sustain_samples:
            env = sustain_level
        else:
            progress = (i - attack_samples - decay_samples - sustain_samples) / max(release_samples, 1)
            env = sustain_level * (1.0 - progress)
        result.append(samples[i] * env)
    return result

def mix_samples(*sample_lists):
    """Mix multiple sample lists together."""
    max_len = max(len(s) for s in sample_lists)
    result = [0.0] * max_len
    for samples in sample_lists:
        for i in range(len(samples)):
            result[i] += samples[i]
    # Normalize
    peak = max(abs(s) for s in result) if result else 1
    if peak > 1:
        result = [s / peak for s in result]
    return result

def concat_samples(*sample_lists):
    """Concatenate sample lists."""
    result = []
    for samples in sample_lists:
        result.extend(samples)
    return result

def save_wav(samples, filename):
    """Save samples to WAV file."""
    filepath = os.path.join(OUTPUT_DIR, filename)
    with wave.open(filepath, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SAMPLE_RATE)
        for sample in samples:
            clamped = max(-1, min(1, sample))
            packed = struct.pack('h', int(clamped * 32767))
            f.writeframes(packed)
    return filepath

def wav_to_final(wav_path):
    """Keep as WAV - expo-av supports WAV natively."""
    return wav_path

def generate_button_click():
    """Short, crisp click sound."""
    # High frequency short burst
    tone1 = generate_tone(1200, 0.03, 0.6)
    tone2 = generate_tone(800, 0.02, 0.3)
    samples = mix_samples(tone1, tone2)
    samples = apply_envelope(samples, attack=0.001, decay=0.01, sustain_level=0.3, release=0.02)
    return samples

def generate_button_hover():
    """Very subtle hover sound."""
    tone = generate_tone(600, 0.05, 0.2)
    samples = apply_envelope(tone, attack=0.005, decay=0.01, sustain_level=0.1, release=0.03)
    return samples

def generate_stat_gain():
    """Ascending cheerful ding - two rising tones."""
    tone1 = generate_tone(523, 0.12, 0.5)  # C5
    tone1 = apply_envelope(tone1, attack=0.005, decay=0.03, sustain_level=0.6, release=0.05)

    tone2 = generate_tone(659, 0.12, 0.5)  # E5
    tone2 = apply_envelope(tone2, attack=0.005, decay=0.03, sustain_level=0.6, release=0.05)

    tone3 = generate_tone(784, 0.18, 0.5)  # G5
    tone3 = apply_envelope(tone3, attack=0.005, decay=0.03, sustain_level=0.5, release=0.1)

    # Add harmonics
    harm1 = generate_tone(1046, 0.12, 0.15)
    harm1 = apply_envelope(harm1, attack=0.005, decay=0.03, sustain_level=0.3, release=0.05)

    part1 = mix_samples(tone1, harm1)

    silence = [0.0] * int(SAMPLE_RATE * 0.02)
    return concat_samples(part1, silence, tone2, silence, tone3)

def generate_stat_loss():
    """Descending sad tone - two falling tones."""
    tone1 = generate_tone(440, 0.15, 0.5)  # A4
    tone1 = apply_envelope(tone1, attack=0.005, decay=0.05, sustain_level=0.5, release=0.08)

    tone2 = generate_tone(330, 0.2, 0.5)  # E4
    tone2 = apply_envelope(tone2, attack=0.005, decay=0.05, sustain_level=0.4, release=0.12)

    silence = [0.0] * int(SAMPLE_RATE * 0.03)
    return concat_samples(tone1, silence, tone2)

def generate_achievement_unlock():
    """Triumphant fanfare - ascending arpeggio."""
    notes = [
        (523, 0.1, 0.6),   # C5
        (659, 0.1, 0.6),   # E5
        (784, 0.1, 0.6),   # G5
        (1047, 0.3, 0.7),  # C6
    ]

    parts = []
    for freq, dur, vol in notes:
        tone = generate_tone(freq, dur, vol)
        harm = generate_tone(freq * 2, dur, vol * 0.2)
        part = mix_samples(tone, harm)
        part = apply_envelope(part, attack=0.005, decay=0.02, sustain_level=0.7, release=dur * 0.3)
        parts.append(part)

    # Add sparkle at end
    sparkle = generate_tone(2093, 0.15, 0.3)
    sparkle = apply_envelope(sparkle, attack=0.001, decay=0.05, sustain_level=0.2, release=0.1)

    silence = [0.0] * int(SAMPLE_RATE * 0.02)
    result = parts[0]
    for p in parts[1:]:
        result = concat_samples(result, silence, p)
    result = concat_samples(result, sparkle)
    return result

def generate_level_up():
    """Celebratory ascending scale with shimmer."""
    notes = [
        (392, 0.08),  # G4
        (440, 0.08),  # A4
        (494, 0.08),  # B4
        (523, 0.08),  # C5
        (587, 0.08),  # D5
        (659, 0.08),  # E5
        (698, 0.08),  # F5
        (784, 0.25),  # G5 (held)
    ]

    parts = []
    for freq, dur in notes:
        tone = generate_tone(freq, dur, 0.5)
        harm = generate_tone(freq * 1.5, dur, 0.15)  # Fifth harmonic
        part = mix_samples(tone, harm)
        part = apply_envelope(part, attack=0.003, decay=0.02, sustain_level=0.6, release=dur * 0.2)
        parts.append(part)

    result = parts[0]
    for p in parts[1:]:
        result = concat_samples(result, p)

    # Final shimmer
    shimmer = generate_tone(1568, 0.2, 0.25)
    shimmer = apply_envelope(shimmer, attack=0.01, decay=0.05, sustain_level=0.15, release=0.15)
    result = concat_samples(result, shimmer)
    return result

def generate_event_start():
    """Whoosh + chime to signal an event."""
    # Noise whoosh
    noise = generate_noise(0.15, 0.3)
    noise = apply_envelope(noise, attack=0.01, decay=0.05, sustain_level=0.2, release=0.08)

    # Chime
    chime = generate_tone(880, 0.2, 0.5)
    harm = generate_tone(1760, 0.15, 0.15)
    chime_part = mix_samples(chime, harm)
    chime_part = apply_envelope(chime_part, attack=0.005, decay=0.05, sustain_level=0.4, release=0.12)

    return concat_samples(noise, chime_part)

def generate_turn_advance():
    """Soft tick/page turn sound."""
    # Quick click
    click = generate_tone(400, 0.02, 0.4)
    noise_part = generate_noise(0.04, 0.15)
    samples = mix_samples(click, noise_part)
    samples = apply_envelope(samples, attack=0.001, decay=0.01, sustain_level=0.2, release=0.02)
    return samples

def generate_money_gain():
    """Coin/cash register ding."""
    tone1 = generate_tone(1319, 0.08, 0.5)  # E6
    tone2 = generate_tone(1568, 0.12, 0.5)  # G6

    tone1 = apply_envelope(tone1, attack=0.001, decay=0.02, sustain_level=0.5, release=0.04)
    tone2 = apply_envelope(tone2, attack=0.001, decay=0.02, sustain_level=0.4, release=0.08)

    # Metallic shimmer
    shimmer = generate_tone(2637, 0.1, 0.2)
    shimmer = apply_envelope(shimmer, attack=0.001, decay=0.03, sustain_level=0.1, release=0.06)

    silence = [0.0] * int(SAMPLE_RATE * 0.02)
    return concat_samples(mix_samples(tone1, shimmer), silence, tone2)

def generate_money_loss():
    """Coin dropping sound - descending."""
    tone1 = generate_tone(880, 0.08, 0.4)
    tone2 = generate_tone(659, 0.1, 0.4)

    tone1 = apply_envelope(tone1, attack=0.001, decay=0.02, sustain_level=0.4, release=0.04)
    tone2 = apply_envelope(tone2, attack=0.001, decay=0.03, sustain_level=0.3, release=0.06)

    silence = [0.0] * int(SAMPLE_RATE * 0.02)
    return concat_samples(tone1, silence, tone2)

def generate_money_broke():
    """Sad buzzer - low descending tones."""
    tone1 = generate_tone(220, 0.2, 0.5)  # A3
    tone2 = generate_tone(196, 0.2, 0.5)  # G3
    tone3 = generate_tone(165, 0.3, 0.5)  # E3

    tone1 = apply_envelope(tone1, attack=0.01, decay=0.05, sustain_level=0.5, release=0.08)
    tone2 = apply_envelope(tone2, attack=0.01, decay=0.05, sustain_level=0.5, release=0.08)
    tone3 = apply_envelope(tone3, attack=0.01, decay=0.05, sustain_level=0.4, release=0.15)

    # Add dissonance
    dis1 = generate_tone(233, 0.2, 0.15)
    dis1 = apply_envelope(dis1, attack=0.01, decay=0.05, sustain_level=0.3, release=0.08)

    silence = [0.0] * int(SAMPLE_RATE * 0.03)
    part1 = mix_samples(tone1, dis1)
    return concat_samples(part1, silence, tone2, silence, tone3)

def generate_health_critical():
    """Urgent alarm beeps."""
    beeps = []
    for _ in range(3):
        beep = generate_tone(880, 0.08, 0.6)
        beep = apply_envelope(beep, attack=0.002, decay=0.02, sustain_level=0.5, release=0.03)
        silence = [0.0] * int(SAMPLE_RATE * 0.06)
        beeps.append(beep)
        beeps.append(silence)

    # Lower urgent tone
    low = generate_tone(440, 0.15, 0.4)
    low = apply_envelope(low, attack=0.005, decay=0.03, sustain_level=0.3, release=0.1)
    beeps.append(low)

    result = beeps[0]
    for b in beeps[1:]:
        result = concat_samples(result, b)
    return result

def generate_notification():
    """Gentle bell/chime notification."""
    tone = generate_tone(698, 0.15, 0.5)  # F5
    harm1 = generate_tone(1397, 0.12, 0.15)  # F6
    harm2 = generate_tone(2093, 0.08, 0.08)  # Higher harmonic

    samples = mix_samples(tone, harm1, harm2)
    samples = apply_envelope(samples, attack=0.003, decay=0.03, sustain_level=0.4, release=0.12)
    return samples

def generate_grade_good():
    """Happy jingle for good grades."""
    notes = [
        (523, 0.08, 0.5),   # C5
        (659, 0.08, 0.5),   # E5
        (784, 0.08, 0.5),   # G5
        (1047, 0.15, 0.6),  # C6
    ]

    parts = []
    for freq, dur, vol in notes:
        tone = generate_tone(freq, dur, vol)
        tone = apply_envelope(tone, attack=0.003, decay=0.02, sustain_level=0.6, release=dur * 0.3)
        parts.append(tone)

    silence = [0.0] * int(SAMPLE_RATE * 0.01)
    result = parts[0]
    for p in parts[1:]:
        result = concat_samples(result, silence, p)
    return result

def generate_grade_bad():
    """Sad descending tones for bad grades."""
    tone1 = generate_tone(392, 0.12, 0.5)  # G4
    tone2 = generate_tone(330, 0.12, 0.5)  # E4
    tone3 = generate_tone(262, 0.18, 0.5)  # C4

    tone1 = apply_envelope(tone1, attack=0.005, decay=0.03, sustain_level=0.5, release=0.06)
    tone2 = apply_envelope(tone2, attack=0.005, decay=0.03, sustain_level=0.5, release=0.06)
    tone3 = apply_envelope(tone3, attack=0.005, decay=0.04, sustain_level=0.4, release=0.1)

    silence = [0.0] * int(SAMPLE_RATE * 0.03)
    return concat_samples(tone1, silence, tone2, silence, tone3)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    sounds = {
        'button_click': generate_button_click,
        'button_hover': generate_button_hover,
        'stat_gain': generate_stat_gain,
        'stat_loss': generate_stat_loss,
        'achievement_unlock': generate_achievement_unlock,
        'level_up': generate_level_up,
        'event_start': generate_event_start,
        'turn_advance': generate_turn_advance,
        'money_gain': generate_money_gain,
        'money_loss': generate_money_loss,
        'money_broke': generate_money_broke,
        'health_critical': generate_health_critical,
        'notification': generate_notification,
        'grade_good': generate_grade_good,
        'grade_bad': generate_grade_bad,
    }

    for name, generator in sounds.items():
        print(f"Generating {name}...")
        samples = generator()
        wav_path = save_wav(samples, f"{name}.wav")
        final_path = wav_to_final(wav_path)
        print(f"  -> {final_path}")

    print(f"\nAll {len(sounds)} sound effects generated successfully!")

if __name__ == '__main__':
    main()
