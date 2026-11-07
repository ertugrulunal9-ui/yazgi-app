/**
 * Yaş geçişi geçiş reklamı yalnızca doğal arada istenir (Y-013):
 * yıl sonu penceresi açılıyorsa pencere KAPANINCA, açılmıyorsa (sakin yıl) yaş geçişinde.
 * İlk koşu reklamsız (first_run_grace) ve ilk koşuda önceden yükleme de yapılmaz.
 */
import { act, renderHook } from '@testing-library/react-native';
import { useAgeTransitionInterstitial } from '../../src/hooks/useAgeTransitionInterstitial';
import { preloadInterstitialAd, showInterstitialAdDetailed } from '../../src/services/monetization';
import { logInterstitialOpportunity, logInterstitialResult } from '../../src/utils/analyticsEvents';

jest.mock('../../src/services/monetization', () => ({
  preloadInterstitialAd: jest.fn(),
  showInterstitialAdDetailed: jest.fn(async () => ({ shown: true, reason: 'shown', provider: 'admob' })),
}));

jest.mock('../../src/utils/analyticsEvents', () => ({
  logInterstitialOpportunity: jest.fn(async () => {}),
  logInterstitialResult: jest.fn(async () => {}),
}));

const mockedShow = showInterstitialAdDetailed as jest.MockedFunction<typeof showInterstitialAdDetailed>;
const mockedPreload = preloadInterstitialAd as jest.MockedFunction<typeof preloadInterstitialAd>;
const mockedOpportunity = logInterstitialOpportunity as jest.Mock;
const mockedResult = logInterstitialResult as jest.Mock;

type Props = { age: number; isFirstRun: boolean; yearEndWindowPending: boolean };

const setup = (initial: Props) => renderHook(
  (props: Props) => useAgeTransitionInterstitial(props),
  { initialProps: initial }
);

const flush = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

describe('useAgeTransitionInterstitial', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('ilk koşu bittikten sonra açılışta reklamı önceden yükler; ilk koşuda yüklemez', () => {
    setup({ age: 5, isFirstRun: false, yearEndWindowPending: false });
    expect(mockedPreload).toHaveBeenCalledTimes(1);

    mockedPreload.mockClear();
    setup({ age: 5, isFirstRun: true, yearEndWindowPending: false });
    expect(mockedPreload).not.toHaveBeenCalled();
  });

  it('oyun içinde kayıt yükleme (yaş sıçraması) ya da yaşın geriye gitmesi ara değildir', () => {
    const hook = setup({ age: 5, isFirstRun: false, yearEndWindowPending: false });

    hook.rerender({ age: 12, isFirstRun: false, yearEndWindowPending: false });
    hook.rerender({ age: 3, isFirstRun: false, yearEndWindowPending: false });

    expect(mockedOpportunity).not.toHaveBeenCalled();
    expect(mockedShow).not.toHaveBeenCalled();
  });

  it('sakin yılda yaş geçişinde reklamı hemen dener, sonra yeniden yükler', async () => {
    const hook = setup({ age: 5, isFirstRun: false, yearEndWindowPending: false });
    mockedPreload.mockClear();

    hook.rerender({ age: 6, isFirstRun: false, yearEndWindowPending: false });
    expect(mockedOpportunity).toHaveBeenCalledWith({ placement: 'age_transition' });
    expect(mockedShow).toHaveBeenCalledTimes(1);
    await flush();

    expect(mockedResult).toHaveBeenCalledWith({ placement: 'age_transition', shown: true, reason: 'shown' });
    expect(mockedPreload).toHaveBeenCalledTimes(1);
  });

  it('yıl sonu penceresi açılıyorsa yaş geçişinde reklam istemez; pencere kapanınca dener', async () => {
    const hook = setup({ age: 9, isFirstRun: false, yearEndWindowPending: false });

    hook.rerender({ age: 10, isFirstRun: false, yearEndWindowPending: true });
    expect(mockedOpportunity).toHaveBeenCalledTimes(1);
    expect(mockedShow).not.toHaveBeenCalled();

    // Pencere açıkken başka render'lar reklamı tetiklemez
    hook.rerender({ age: 10, isFirstRun: false, yearEndWindowPending: true });
    expect(mockedShow).not.toHaveBeenCalled();

    act(() => {
      hook.result.current.handleYearEndWindowClosed();
    });
    expect(mockedShow).toHaveBeenCalledTimes(1);
    await flush();
    expect(mockedResult).toHaveBeenCalledWith({ placement: 'age_transition', shown: true, reason: 'shown' });

    // Aynı fırsat ikinci kez kullanılmaz
    act(() => {
      hook.result.current.handleYearEndWindowClosed();
    });
    expect(mockedShow).toHaveBeenCalledTimes(1);
  });

  it('yaş geçişine bağlı olmayan pencere (ör. kayıt yüklenince) kapanınca reklam istemez', () => {
    const hook = setup({ age: 12, isFirstRun: false, yearEndWindowPending: true });

    act(() => {
      hook.result.current.handleYearEndWindowClosed();
    });

    expect(mockedShow).not.toHaveBeenCalled();
    expect(mockedOpportunity).not.toHaveBeenCalled();
  });

  it('ilk koşuda first_run_grace kaydedilir; pencere kapanınca da reklam istenmez', () => {
    const hook = setup({ age: 3, isFirstRun: true, yearEndWindowPending: false });

    hook.rerender({ age: 4, isFirstRun: true, yearEndWindowPending: true });
    act(() => {
      hook.result.current.handleYearEndWindowClosed();
    });

    expect(mockedResult).toHaveBeenCalledWith({
      placement: 'age_transition',
      shown: false,
      reason: 'first_run_grace',
    });
    expect(mockedShow).not.toHaveBeenCalled();
    expect(mockedPreload).not.toHaveBeenCalled();
  });

  it('hazır olmayan fırsatı nedeniyle kaydeder ve sonradan yeniden denemez', async () => {
    mockedShow.mockResolvedValueOnce({ shown: false, reason: 'not_ready', provider: 'admob' });
    const hook = setup({ age: 7, isFirstRun: false, yearEndWindowPending: false });

    hook.rerender({ age: 8, isFirstRun: false, yearEndWindowPending: false });
    await flush();
    hook.rerender({ age: 8, isFirstRun: false, yearEndWindowPending: false });
    await flush();

    expect(mockedShow).toHaveBeenCalledTimes(1);
    expect(mockedResult).toHaveBeenCalledWith({ placement: 'age_transition', shown: false, reason: 'not_ready' });
  });
});
