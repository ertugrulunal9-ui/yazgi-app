import { getAdErrorMessage } from '../../src/utils/adErrorMessage';
import { setRuntimeLocale } from '../../src/i18n/strings';

const TECHNICAL = [
  'Rewarded ad closed before reward',
  'Daily ad limit reached (8)',
  'Rewarded ad load timed out',
  'cancelled',
  'Ads provider unavailable in this build',
  'Rewarded ad dependencies are unavailable',
  'Rewarded ad show failed',
  'Premium user — ads disabled',
  'Some unexpected SDK message',
  undefined,
];

describe('getAdErrorMessage', () => {
  it.each(['tr', 'en'] as const)('never returns the raw technical text (%s)', (locale) => {
    setRuntimeLocale(locale);
    for (const raw of TECHNICAL) {
      const message = getAdErrorMessage(raw);
      expect(message).not.toBe(raw);
      expect(message).not.toMatch(/Rewarded|Daily ad limit|timed out|SDK|messages\./);
      expect(message.length).toBeGreaterThan(5);
    }
  });

  it('gives different, specific messages for the common cases in Turkish', () => {
    setRuntimeLocale('tr');
    expect(getAdErrorMessage('Daily ad limit reached (8)')).toMatch(/hakkın/);
    expect(getAdErrorMessage('Rewarded ad closed before reward')).toMatch(/ödül/);
    expect(getAdErrorMessage('Rewarded ad load timed out')).toMatch(/yüklenemedi/);
  });

  it('maps a cancelled ad to the generic message, not the undo-specific one', () => {
    setRuntimeLocale('tr');
    expect(getAdErrorMessage('cancelled')).toBe(getAdErrorMessage('Some unexpected SDK message'));
    expect(getAdErrorMessage('cancelled')).not.toMatch(/geri alınmadı/);
  });

  it('has an English message for the common cases', () => {
    setRuntimeLocale('en');
    expect(getAdErrorMessage('Daily ad limit reached (8)')).toMatch(/limit/);
    expect(getAdErrorMessage('Rewarded ad closed before reward')).toMatch(/reward/);
  });
});
