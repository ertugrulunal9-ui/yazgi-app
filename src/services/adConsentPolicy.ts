/**
 * Kişiselleştirilmiş reklam kararı (saf, native modülsüz; test edilebilir).
 *
 * İki ayrı sinyal var:
 *  - UMP sonucu: Google'ın onay akışı (yalnızca AEA/İngiltere'de form gösterir).
 *  - Oyuncunun tercihi: `uiPrefs.personalizedAdsEnabled` (varsayılan kapalı).
 *
 * Kişiselleştirilmiş reklam yalnızca ikisi de izin veriyorsa açılır. UMP sonucu
 * hiçbir zaman oyuncu tercihinin üzerine yazılmaz.
 */
export type UmpConsentOutcome =
  /** AEA'da oyuncu formu doldurdu. */
  | 'obtained'
  /** AEA dışı: UMP onay istemiyor. */
  | 'not_required'
  /** Onay gerekli ama alınmadı (form kapatıldı/gösterilemedi). */
  | 'required'
  /** Durum belirlenemedi (web, SDK yok vb.). */
  | 'unknown'
  /** UMP isteği hata verdi. */
  | 'error';

export const isPersonalizedAdsAllowedByUmp = (outcome: UmpConsentOutcome | null): boolean =>
  outcome === 'obtained' || outcome === 'not_required';

/**
 * Etkin kişiselleştirilmiş reklam değeri.
 * UMP sonucu henüz gelmediyse (`null`) kapalı kabul edilir.
 */
export const resolveEffectivePersonalizedAds = (
  outcome: UmpConsentOutcome | null,
  playerOptedIn: boolean
): boolean => playerOptedIn === true && isPersonalizedAdsAllowedByUmp(outcome);
