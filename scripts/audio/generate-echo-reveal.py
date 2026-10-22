"""Yankı (geri dönen sonuç) anı için kısa çan sesi üretir.

Kullanım: python scripts/audio/generate-echo-reveal.py
Çıktı:   assets/sounds/sfx/echo_reveal.wav (44.1 kHz, mono, 16-bit)

Ses tamamen burada sentezlenir; dış kaynak veya lisans gerektirmez.
Üç notalı yükselen bir çan arpeji + gecikmeli kopya ("yankı").
"""

import math
import os
import struct
import wave

SAMPLE_RATE = 44100
DURATION_S = 1.3
PEAK = 0.5  # yaklaşık -6 dBFS

# (başlangıç sn, frekans Hz, genlik)
NOTES = [
    (0.00, 659.25, 1.0),   # E5
    (0.11, 987.77, 0.85),  # B5
    (0.22, 1318.51, 0.7),  # E6
]
ECHO_DELAY_S = 0.19
ECHO_GAIN = 0.35
DECAY_TAU_S = 0.32
ATTACK_S = 0.006


def bell(t: float, freq: float) -> float:
    """Temel ton + çana özgü uyumsuz üst kısmi (2.76x)."""
    if t < 0:
        return 0.0
    attack = min(1.0, t / ATTACK_S)
    env = attack * math.exp(-t / DECAY_TAU_S)
    partial_env = attack * math.exp(-t / (DECAY_TAU_S * 0.45))
    return env * math.sin(2 * math.pi * freq * t) + 0.25 * partial_env * math.sin(2 * math.pi * freq * 2.76 * t)


def main() -> None:
    frames = int(SAMPLE_RATE * DURATION_S)
    samples = []
    for i in range(frames):
        t = i / SAMPLE_RATE
        value = 0.0
        for start, freq, amp in NOTES:
            value += amp * bell(t - start, freq)
            value += ECHO_GAIN * amp * bell(t - start - ECHO_DELAY_S, freq)
        samples.append(value)

    # Son 80 ms'de yumuşak kapanış (tıklamasız bitiş)
    tail = int(SAMPLE_RATE * 0.08)
    for i in range(tail):
        samples[frames - tail + i] *= 1 - (i / tail)

    peak = max(abs(s) for s in samples) or 1.0
    scale = PEAK / peak

    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    out_path = os.path.join(root, 'assets', 'sounds', 'sfx', 'echo_reveal.wav')
    with wave.open(out_path, 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(b''.join(struct.pack('<h', int(max(-1.0, min(1.0, s * scale)) * 32767)) for s in samples))
    print(f'wrote {out_path} ({frames} frames)')


if __name__ == '__main__':
    main()
