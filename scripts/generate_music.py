"""
Generate background music tracks for Yazgı game.
Creates ambient, loopable music using synthesized tones and harmonics.
All sounds are original - no copyright issues.
"""

import wave
import struct
import math
import os
import random

SAMPLE_RATE = 44100
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'sounds', 'music')

def generate_tone(freq, duration, volume=0.5):
    """Generate a sine wave tone."""
    samples = []
    num_samples = int(SAMPLE_RATE * duration)
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        sample = volume * math.sin(2 * math.pi * freq * t)
        samples.append(sample)
    return samples

def generate_soft_tone(freq, duration, volume=0.5):
    """Generate a softer tone with harmonics for warmth."""
    samples = []
    num_samples = int(SAMPLE_RATE * duration)
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Fundamental + soft harmonics
        sample = volume * (
            0.6 * math.sin(2 * math.pi * freq * t) +
            0.25 * math.sin(2 * math.pi * freq * 2 * t) +
            0.1 * math.sin(2 * math.pi * freq * 3 * t) +
            0.05 * math.sin(2 * math.pi * freq * 4 * t)
        )
        samples.append(sample)
    return samples

def generate_pad(freq, duration, volume=0.3):
    """Generate a lush pad sound with detuned oscillators."""
    samples = []
    num_samples = int(SAMPLE_RATE * duration)
    detune = 1.003  # Slight detune for width
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        sample = volume * (
            0.4 * math.sin(2 * math.pi * freq * t) +
            0.3 * math.sin(2 * math.pi * freq * detune * t) +
            0.2 * math.sin(2 * math.pi * freq / detune * t) +
            0.1 * math.sin(2 * math.pi * freq * 0.5 * t)  # Sub
        )
        samples.append(sample)
    return samples

def apply_envelope(samples, attack=0.5, decay=0.3, sustain_level=0.7, release=0.5):
    """Apply ADSR envelope."""
    total = len(samples)
    sr = SAMPLE_RATE
    attack_s = int(attack * sr)
    decay_s = int(decay * sr)
    release_s = int(release * sr)
    sustain_s = total - attack_s - decay_s - release_s
    if sustain_s < 0:
        sustain_s = 0
        release_s = max(0, total - attack_s - decay_s)

    result = []
    for i in range(total):
        if i < attack_s:
            env = i / max(attack_s, 1)
        elif i < attack_s + decay_s:
            progress = (i - attack_s) / max(decay_s, 1)
            env = 1.0 - (1.0 - sustain_level) * progress
        elif i < attack_s + decay_s + sustain_s:
            env = sustain_level
        else:
            progress = (i - attack_s - decay_s - sustain_s) / max(release_s, 1)
            env = sustain_level * (1.0 - progress)
        result.append(samples[i] * env)
    return result

def mix_samples(*sample_lists):
    """Mix multiple sample lists."""
    max_len = max(len(s) for s in sample_lists)
    result = [0.0] * max_len
    for samples in sample_lists:
        for i in range(len(samples)):
            result[i] += samples[i]
    peak = max(abs(s) for s in result) if result else 1
    if peak > 0.95:
        result = [s * 0.9 / peak for s in result]
    return result

def concat_samples(*sample_lists):
    """Concatenate sample lists."""
    result = []
    for samples in sample_lists:
        result.extend(samples)
    return result

def crossfade(samples1, samples2, fade_duration=0.5):
    """Crossfade between two sample lists."""
    fade_samples = int(fade_duration * SAMPLE_RATE)
    result = list(samples1[:-fade_samples])

    for i in range(fade_samples):
        progress = i / fade_samples
        s1 = samples1[len(samples1) - fade_samples + i] * (1 - progress)
        s2 = samples2[i] * progress
        result.append(s1 + s2)

    result.extend(samples2[fade_samples:])
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


def generate_menu_music():
    """
    Calm, atmospheric menu music.
    Slow chord progression with pad sounds. ~30 seconds loop.
    Key: C minor - mysterious, fate-like feel.
    """
    duration = 30  # seconds
    chord_dur = 7.5  # each chord lasts 7.5 seconds

    # Cm - Eb - Ab - G chords (cinematic, fate-like)
    chords = [
        [130.81, 155.56, 196.00],  # Cm (C3, Eb3, G3)
        [155.56, 196.00, 233.08],  # Eb (Eb3, G3, Bb3)
        [207.65, 261.63, 311.13],  # Ab (Ab3, C4, Eb4)
        [196.00, 246.94, 293.66],  # G  (G3, B3, D4)
    ]

    all_parts = []
    for chord in chords:
        parts = []
        for freq in chord:
            pad = generate_pad(freq, chord_dur, 0.2)
            pad = apply_envelope(pad, attack=1.5, decay=0.5, sustain_level=0.6, release=1.5)
            parts.append(pad)

        # Add subtle high shimmer
        shimmer_freq = chord[2] * 2
        shimmer = generate_tone(shimmer_freq, chord_dur, 0.05)
        shimmer = apply_envelope(shimmer, attack=2, decay=1, sustain_level=0.3, release=2)
        parts.append(shimmer)

        chord_samples = mix_samples(*parts)
        all_parts.append(chord_samples)

    # Crossfade chords together
    result = all_parts[0]
    for part in all_parts[1:]:
        result = crossfade(result, part, 1.0)

    # Fade the end to loop cleanly back to start
    fade_len = int(2 * SAMPLE_RATE)
    for i in range(fade_len):
        progress = i / fade_len
        result[-(fade_len - i)] *= (1 - progress)

    return result


def generate_childhood_music():
    """
    Light, playful, innocent music for ages 0-7.
    Simple melody with warm tones. ~30 seconds loop.
    Key: C major - bright and innocent.
    """
    duration = 30
    note_dur = 0.8

    # Simple, childlike melody in C major
    melody_notes = [
        262, 294, 330, 294, 262, 330, 392, 330,  # C D E D C E G E
        392, 440, 392, 330, 294, 262, 294, 330,  # G A G E D C D E
        262, 330, 392, 330, 262, 294, 330, 262,  # C E G E C D E C
        392, 330, 294, 262, 330, 294, 262, 262,  # G E D C E D C C
    ]

    # Pad chords underneath
    pad_chords = [
        [131, 165, 196],  # C major
        [131, 165, 196],
        [110, 131, 165],  # Am
        [110, 131, 165],
        [147, 175, 220],  # Dm
        [147, 175, 220],
        [131, 165, 196],  # C major
        [131, 165, 196],
    ]

    # Generate melody
    melody_parts = []
    for freq in melody_notes:
        tone = generate_soft_tone(freq, note_dur, 0.25)
        tone = apply_envelope(tone, attack=0.05, decay=0.1, sustain_level=0.5, release=0.2)
        melody_parts.append(tone)

    melody = concat_samples(*melody_parts)

    # Generate pad (longer notes)
    pad_dur = note_dur * 4
    pad_parts = []
    for chord in pad_chords:
        chord_parts = []
        for freq in chord:
            pad = generate_pad(freq, pad_dur, 0.12)
            pad = apply_envelope(pad, attack=0.5, decay=0.3, sustain_level=0.5, release=0.5)
            chord_parts.append(pad)
        pad_parts.append(mix_samples(*chord_parts))

    pad = concat_samples(*pad_parts)

    # Mix melody and pad
    result = mix_samples(melody, pad)

    # Fade end for looping
    fade_len = int(1.5 * SAMPLE_RATE)
    for i in range(fade_len):
        progress = i / fade_len
        result[-(fade_len - i)] *= (1 - progress)

    return result


def generate_school_music():
    """
    Structured, curious music for ages 7-14.
    More rhythmic, slightly more complex. ~30 seconds loop.
    Key: G major - cheerful but structured.
    """
    duration = 30
    note_dur = 0.5

    # More structured melody
    melody_notes = [
        392, 440, 494, 523, 494, 440, 392, 330,  # G A B C B A G E
        294, 330, 392, 440, 392, 330, 294, 392,  # D E G A G E D G
        523, 494, 440, 392, 440, 494, 523, 587,  # C B A G A B C D
        523, 494, 440, 392, 330, 294, 330, 392,  # C B A G E D E G
        392, 440, 494, 392, 330, 294, 392, 440,  # G A B G E D G A
        494, 523, 587, 523, 494, 440, 392, 330,  # B C D C B A G E
        294, 330, 392, 440, 494, 523, 494, 440,  # D E G A B C B A
        392, 330, 294, 330, 392, 440, 392, 392,  # G E D E G A G G
    ]

    # Pad chords
    pad_chords = [
        [196, 247, 294],  # G major
        [165, 196, 247],  # Em
        [220, 262, 330],  # Am
        [147, 185, 220],  # D major
        [196, 247, 294],  # G major
        [131, 165, 196],  # C major
        [147, 185, 220],  # D major
        [196, 247, 294],  # G major
    ]

    # Generate melody
    melody_parts = []
    for freq in melody_notes:
        tone = generate_soft_tone(freq, note_dur, 0.22)
        tone = apply_envelope(tone, attack=0.03, decay=0.08, sustain_level=0.5, release=0.12)
        melody_parts.append(tone)

    melody = concat_samples(*melody_parts)

    # Generate pad
    pad_dur = note_dur * 8
    pad_parts = []
    for chord in pad_chords:
        chord_parts = []
        for freq in chord:
            pad = generate_pad(freq, pad_dur, 0.1)
            pad = apply_envelope(pad, attack=0.5, decay=0.3, sustain_level=0.5, release=0.5)
            chord_parts.append(pad)
        pad_parts.append(mix_samples(*chord_parts))

    pad = concat_samples(*pad_parts)

    # Simple bass line
    bass_notes = [196, 165, 220, 147, 196, 131, 147, 196]  # Root notes
    bass_parts = []
    for freq in bass_notes:
        bass = generate_tone(freq / 2, pad_dur, 0.12)
        bass = apply_envelope(bass, attack=0.1, decay=0.2, sustain_level=0.4, release=0.3)
        bass_parts.append(bass)

    bass = concat_samples(*bass_parts)

    result = mix_samples(melody, pad, bass)

    # Fade end
    fade_len = int(1.5 * SAMPLE_RATE)
    for i in range(fade_len):
        progress = i / fade_len
        result[-(fade_len - i)] *= (1 - progress)

    return result


def generate_teen_music():
    """
    More energetic, emotional music for ages 14-18.
    Minor key, more movement. ~30 seconds loop.
    Key: A minor - emotional, dramatic.
    """
    duration = 30
    note_dur = 0.4

    # Emotional melody in A minor
    melody_notes = [
        440, 523, 587, 659, 587, 523, 440, 392,  # A C D E D C A G
        440, 494, 523, 587, 659, 587, 523, 494,  # A B C D E D C B
        659, 698, 659, 587, 523, 494, 440, 523,  # E F E D C B A C
        587, 523, 494, 440, 392, 440, 494, 523,  # D C B A G A B C
        587, 659, 698, 659, 587, 523, 494, 440,  # D E F E D C B A
        523, 587, 659, 784, 659, 587, 523, 494,  # C D E G E D C B
        440, 523, 587, 523, 440, 392, 440, 494,  # A C D C A G A B
        523, 494, 440, 392, 440, 494, 523, 440,  # C B A G A B C A
    ]

    # Chords: Am - F - C - G progression (emotional pop)
    pad_chords = [
        [220, 262, 330],  # Am
        [175, 220, 262],  # F
        [262, 330, 392],  # C
        [196, 247, 294],  # G
        [220, 262, 330],  # Am
        [175, 220, 262],  # F
        [262, 330, 392],  # C
        [196, 247, 294],  # G
    ]

    # Generate melody
    melody_parts = []
    for freq in melody_notes:
        tone = generate_soft_tone(freq, note_dur, 0.2)
        tone = apply_envelope(tone, attack=0.02, decay=0.06, sustain_level=0.5, release=0.1)
        melody_parts.append(tone)

    melody = concat_samples(*melody_parts)

    # Generate pad
    pad_dur = note_dur * 8
    pad_parts = []
    for chord in pad_chords:
        chord_parts = []
        for freq in chord:
            pad = generate_pad(freq, pad_dur, 0.12)
            pad = apply_envelope(pad, attack=0.4, decay=0.3, sustain_level=0.5, release=0.4)
            chord_parts.append(pad)
        pad_parts.append(mix_samples(*chord_parts))

    pad = concat_samples(*pad_parts)

    # Driving bass
    bass_notes = [110, 87, 131, 98, 110, 87, 131, 98]
    bass_parts = []
    for freq in bass_notes:
        bass = generate_tone(freq, pad_dur, 0.15)
        bass = apply_envelope(bass, attack=0.05, decay=0.15, sustain_level=0.5, release=0.2)
        bass_parts.append(bass)

    bass = concat_samples(*bass_parts)

    # Simple rhythmic pulse
    pulse_parts = []
    pulse_note_dur = note_dur
    for _ in range(len(melody_notes)):
        tick = generate_tone(80, pulse_note_dur * 0.3, 0.08)
        tick = apply_envelope(tick, attack=0.005, decay=0.05, sustain_level=0.3, release=0.05)
        silence = [0.0] * int(SAMPLE_RATE * pulse_note_dur * 0.7)
        pulse_parts.append(concat_samples(tick, silence))

    pulse = concat_samples(*pulse_parts)

    result = mix_samples(melody, pad, bass, pulse)

    # Fade end
    fade_len = int(1.5 * SAMPLE_RATE)
    for i in range(fade_len):
        progress = i / fade_len
        result[-(fade_len - i)] *= (1 - progress)

    return result


def generate_gameover_music():
    """
    Melancholic, reflective ending music.
    Slow, sparse, emotional. ~20 seconds (no loop).
    Key: D minor - somber, reflective.
    """
    # Slow, sparse chords
    chord_dur = 5

    # Dm - Bb - Gm - A progression (melancholic)
    chords = [
        [147, 175, 220],  # Dm (D3, F3, A3)
        [117, 147, 175],  # Bb (Bb2, D3, F3)
        [98, 117, 147],   # Gm (G2, Bb2, D3)
        [110, 139, 165],  # A  (A2, C#3, E3)
    ]

    all_parts = []
    for chord in chords:
        parts = []
        for freq in chord:
            pad = generate_pad(freq, chord_dur, 0.18)
            pad = apply_envelope(pad, attack=2, decay=0.5, sustain_level=0.5, release=2)
            parts.append(pad)

        # Sparse high note
        high = generate_tone(chord[2] * 4, chord_dur, 0.04)
        high = apply_envelope(high, attack=2.5, decay=0.5, sustain_level=0.2, release=2)
        parts.append(high)

        chord_samples = mix_samples(*parts)
        all_parts.append(chord_samples)

    # Crossfade and fade out
    result = all_parts[0]
    for part in all_parts[1:]:
        result = crossfade(result, part, 1.5)

    # Long fade out at the end
    fade_len = int(4 * SAMPLE_RATE)
    for i in range(fade_len):
        progress = i / fade_len
        idx = len(result) - fade_len + i
        if idx < len(result):
            result[idx] *= (1 - progress)

    return result


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    tracks = {
        'menu': generate_menu_music,
        'childhood': generate_childhood_music,
        'school': generate_school_music,
        'teen': generate_teen_music,
        'gameover': generate_gameover_music,
    }

    for name, generator in tracks.items():
        print(f"Generating {name} music...")
        samples = generator()
        filepath = save_wav(samples, f"{name}.wav")
        duration = len(samples) / SAMPLE_RATE
        print(f"  -> {filepath} ({duration:.1f}s)")

    print(f"\nAll {len(tracks)} music tracks generated successfully!")

if __name__ == '__main__':
    main()
