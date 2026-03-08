import { Choice, PersonalityState, PersonalityTendency } from '../types';
import { HIGH_MOMENTUM_THRESHOLD, normalizePersonalityState, resolveMomentumFromChoice } from '../systems/PersonalityMomentumEngine';
import { tRuntime } from '../i18n/strings';

export interface MomentumDialogueTag {
  tendency: PersonalityTendency;
  label: string;
  tagText: string;
  subtitle: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
}

const TENDENCY_LABELS: Record<PersonalityTendency, string> = {
  HELPFUL: 'Yardimsever',
  PRAGMATIC: 'Kurnaz',
  AGGRESSIVE: 'Sert',
};

const TENDENCY_SUBTITLES: Record<PersonalityTendency, string> = {
  HELPFUL: tRuntime('feedback.momentum.dialogueSubtitles.HELPFUL'),
  PRAGMATIC: tRuntime('feedback.momentum.dialogueSubtitles.PRAGMATIC'),
  AGGRESSIVE: tRuntime('feedback.momentum.dialogueSubtitles.AGGRESSIVE'),
};

const TENDENCY_COLORS: Record<PersonalityTendency, { text: string; border: string; glow: string }> = {
  HELPFUL: {
    text: '#6ee7b7',
    border: '#34d399',
    glow: 'rgba(16, 185, 129, 0.5)',
  },
  PRAGMATIC: {
    text: '#7dd3fc',
    border: '#38bdf8',
    glow: 'rgba(14, 165, 233, 0.5)',
  },
  AGGRESSIVE: {
    text: '#fda4af',
    border: '#fb7185',
    glow: 'rgba(244, 63, 94, 0.5)',
  },
};

const isTendency = (value: string | null): value is PersonalityTendency => (
  value === 'HELPFUL' || value === 'PRAGMATIC' || value === 'AGGRESSIVE'
);

export const getMomentumDialogueTag = (
  choice: Choice,
  personalityState: Partial<PersonalityState> | undefined,
  threshold: number = HIGH_MOMENTUM_THRESHOLD
): MomentumDialogueTag | null => {
  const signal = resolveMomentumFromChoice(choice);
  if (!isTendency(signal)) return null;

  const normalized = normalizePersonalityState(personalityState);
  const entry = normalized[signal];
  if (entry.multiplier < threshold) return null;

  const label = TENDENCY_LABELS[signal];
  const colors = TENDENCY_COLORS[signal];

  return {
    tendency: signal,
    label,
    tagText: `[${label}]`,
    subtitle: TENDENCY_SUBTITLES[signal],
    textColor: colors.text,
    borderColor: colors.border,
    glowColor: colors.glow,
  };
};

