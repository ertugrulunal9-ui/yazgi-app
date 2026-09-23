const loadFreshTracker = async () => {
  jest.resetModules();
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default as any;
  const trackerModule = await import('../../src/utils/seenQuestionsTracker');
  return {
    tracker: trackerModule.default,
    AsyncStorage,
  };
};

describe('seenQuestionsTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes from storage once and skips duplicate initialization', async () => {
    const { tracker, AsyncStorage } = await loadFreshTracker();
    AsyncStorage.__CLEAR__?.();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ math: ['q1', 'q2'] })
    );

    await tracker.initialize();
    await tracker.initialize();

    const debugData = await tracker.getDebugData();
    expect(debugData.math).toEqual(['q1', 'q2']);
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
  });

  it('handles initialize errors and still marks tracker as usable', async () => {
    const { tracker, AsyncStorage } = await loadFreshTracker();
    AsyncStorage.__CLEAR__?.();
    const initError = new Error('storage read failed');
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(initError);

    await tracker.initialize();

    const debugData = await tracker.getDebugData();
    expect(debugData).toEqual({});
    expect(console.error).toHaveBeenCalledWith('SeenQuestionsTracker initialization failed:', initError);
  });

  it('marks single question once and avoids duplicate saves', async () => {
    const { tracker, AsyncStorage } = await loadFreshTracker();
    AsyncStorage.__CLEAR__?.();

    await tracker.markQuestionAsSeen('math', 'q1');
    await tracker.markQuestionAsSeen('math', 'q1');

    expect(await tracker.isQuestionSeen('math', 'q1')).toBe(true);
    expect(await tracker.getSeenCount('math')).toBe(1);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('marks multiple questions and saves only when there is a change', async () => {
    const { tracker, AsyncStorage } = await loadFreshTracker();
    AsyncStorage.__CLEAR__?.();

    await tracker.markQuestionsAsSeen('science', ['s1', 's2']);
    await tracker.markQuestionsAsSeen('science', ['s1', 's2']);
    await tracker.markQuestionsAsSeen('science', ['s2', 's3']);

    expect(await tracker.getSeenCount('science')).toBe(3);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
  });

  it('filters unseen questions and tracks seen status', async () => {
    const { tracker, AsyncStorage } = await loadFreshTracker();
    AsyncStorage.__CLEAR__?.();
    await tracker.markQuestionsAsSeen('history', ['h1', 'h2']);

    const unseen = await tracker.filterUnseenQuestions('history', [
      { id: 'h1', text: 'old' },
      { id: 'h3', text: 'new' },
      { id: 'h4', text: 'new2' },
    ]);

    expect(unseen.map(item => item.id)).toEqual(['h3', 'h4']);
    expect(await tracker.isQuestionSeen('history', 'h1')).toBe(true);
    expect(await tracker.isQuestionSeen('history', 'h9')).toBe(false);
  });

  it('selects questions preferring unseen and falls back to seen pool', async () => {
    const { tracker, AsyncStorage } = await loadFreshTracker();
    AsyncStorage.__CLEAR__?.();
    await tracker.markQuestionsAsSeen('english', ['e1', 'e2']);

    const pool = [
      { id: 'e1' },
      { id: 'e2' },
      { id: 'e3' },
      { id: 'e4' },
    ];

    const enoughUnseen = await tracker.selectQuestionsForExam('english', pool, 2);
    expect(enoughUnseen).toHaveLength(2);
    expect(enoughUnseen.every(item => ['e3', 'e4'].includes(item.id))).toBe(true);

    const withFallback = await tracker.selectQuestionsForExam('english', pool, 4);
    expect(withFallback).toHaveLength(4);
    expect(withFallback.map(item => item.id).sort()).toEqual(['e1', 'e2', 'e3', 'e4']);
  });

  it('returns only available unseen when fallback seen pool is empty', async () => {
    const { tracker, AsyncStorage } = await loadFreshTracker();
    AsyncStorage.__CLEAR__?.();

    const selected = await tracker.selectQuestionsForExam(
      'art',
      [{ id: 'a1' }, { id: 'a2' }],
      5
    );
    expect(selected).toHaveLength(2);
  });

  it('resets exam type and global state', async () => {
    const { tracker, AsyncStorage } = await loadFreshTracker();
    AsyncStorage.__CLEAR__?.();
    await tracker.markQuestionsAsSeen('music', ['m1', 'm2']);
    await tracker.markQuestionsAsSeen('math', ['x1']);

    await tracker.resetExamType('music');
    expect(await tracker.getSeenCount('music')).toBe(0);
    expect(await tracker.getSeenCount('math')).toBe(1);

    await tracker.resetAll();
    expect(await tracker.getDebugData()).toEqual({});
  });

  it('logs save failures without throwing', async () => {
    const { tracker, AsyncStorage } = await loadFreshTracker();
    AsyncStorage.__CLEAR__?.();
    const saveError = new Error('storage write failed');
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(saveError);
    await tracker.markQuestionAsSeen('geography', 'g1');

    expect(console.error).toHaveBeenCalledWith('SeenQuestionsTracker save failed:', saveError);
  });
});
