import { buildTraitChangeFeedback } from '../../src/utils/traitFeedback';

describe('traitFeedback', () => {
  it('adds prevention guidance for gained negative traits', () => {
    const changes = buildTraitChangeFeedback(['LAZY'], []);
    const lazyGain = changes.find(change => change.traitId === 'LAZY' && change.changeType === 'GAINED');

    expect(lazyGain).toBeDefined();
    expect(lazyGain?.guidance).toContain('Disiplini');
  });

  it('explains conflict source for removed traits when resolver is known', () => {
    const changes = buildTraitChangeFeedback(['DISCIPLINED'], ['LAZY']);
    const lazyRemoval = changes.find(change => change.traitId === 'LAZY' && change.changeType === 'REMOVED');

    expect(lazyRemoval).toBeDefined();
    expect(lazyRemoval?.summary).toContain('kaldirildi (cakisma:');
  });

  it('deduplicates repeated trait ids', () => {
    const changes = buildTraitChangeFeedback(['LAZY', 'LAZY'], ['LAZY', 'LAZY']);
    const gainedCount = changes.filter(change => change.changeType === 'GAINED').length;
    const removedCount = changes.filter(change => change.changeType === 'REMOVED').length;

    expect(gainedCount).toBe(1);
    expect(removedCount).toBe(1);
  });
});

