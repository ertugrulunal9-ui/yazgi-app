import {
  createAchievementShareText,
  createFateShareText,
  createRomanceShareText,
  createTraitShareText,
  formatShareMessage,
} from '../../src/utils/shareUtils';

describe('shareUtils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates trait share text with trait placeholder resolved', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const share = createTraitShareText('DISCIPLINED');

    expect(share.type).toBe('TRAIT_ACQUIRED');
    expect(share.emoji).toBe('\u26A1');
    expect(share.text).toContain('DISCIPLINED');
  });

  it('creates achievement share text', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const share = createAchievementShareText();

    expect(share.type).toBe('SECRET_ACHIEVEMENT');
    expect(share.emoji).toBe('\u{1F3C6}');
    expect(share.text.length).toBeGreaterThan(0);
  });

  it('creates romance share text', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const share = createRomanceShareText();

    expect(share.type).toBe('FIRST_ROMANCE');
    expect(share.emoji).toBe('\u{1F497}');
    expect(share.text.length).toBeGreaterThan(0);
  });

  it('creates positive fate share text', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const share = createFateShareText(true);

    expect(share.type).toBe('FATE_MOMENT');
    expect(share.emoji).toBe('\u{1F31F}');
    expect(share.text).toContain('gülümsedi');
  });

  it('creates negative fate share text', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.9);
    const share = createFateShareText(false);

    expect(share.type).toBe('FATE_MOMENT');
    expect(share.emoji).toBe('\u{1F327}\uFE0F');
    expect(share.text).toContain('sırtını döndü');
  });

  it('formats final share message with signature', () => {
    const message = formatShareMessage({
      type: 'LEGENDARY_EVENT',
      text: 'Efsane bir an!',
      emoji: '\u2728',
    });

    expect(message).toContain('\u2728 Efsane bir an!');
    expect(message).toContain('yazgi.app');
  });
});
