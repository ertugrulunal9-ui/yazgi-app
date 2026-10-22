import { getAvatarMood } from '../../src/utils/avatarMood';

const calm = { current: 0, threshold: 70 };

describe('getAvatarMood', () => {
  it('shows stress first, from the same 60% point as the header stress warning', () => {
    expect(getAvatarMood({ age: 12, stress: { current: 42, threshold: 70 }, health: 70, familyRelation: 90 })).toBe('STRESSED');
    expect(getAvatarMood({ age: 12, stress: { current: 41, threshold: 70 }, health: 70, familyRelation: 90 })).not.toBe('STRESSED');
  });

  it('judges health against the age cap, so a healthy baby is not drawn sad', () => {
    // 7 yaş altında sağlık üst sınırı 30: başlangıçtaki 20 sağlık iyi sayılır.
    expect(getAvatarMood({ age: 0, stress: calm, health: 20, familyRelation: 60 })).not.toBe('SAD');
    expect(getAvatarMood({ age: 4, stress: calm, health: 9, familyRelation: 60 })).toBe('SAD');
    expect(getAvatarMood({ age: 16, stress: calm, health: 30, familyRelation: 60 })).toBe('SAD');
  });

  it('looks down when family ties are broken', () => {
    expect(getAvatarMood({ age: 12, stress: calm, health: 60, familyRelation: 20 })).toBe('SAD');
  });

  it('smiles only when calm, healthy and close to family', () => {
    expect(getAvatarMood({ age: 12, stress: calm, health: 60, familyRelation: 70 })).toBe('HAPPY');
    expect(getAvatarMood({ age: 12, stress: { current: 25, threshold: 70 }, health: 60, familyRelation: 70 })).toBe('NORMAL');
    expect(getAvatarMood({ age: 12, stress: calm, health: 40, familyRelation: 70 })).toBe('NORMAL');
  });

  it('falls back to the default stress threshold when stress data is missing', () => {
    expect(getAvatarMood({ age: 12, stress: undefined, health: 60, familyRelation: 70 })).toBe('HAPPY');
    expect(getAvatarMood({ age: 12, stress: { current: 45, threshold: 0 }, health: 60, familyRelation: 70 })).toBe('STRESSED');
  });
});
