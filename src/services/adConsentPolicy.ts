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

/**
 * Son bilinen UMP durumu. Açılıştaki onay akışı ve Ayarlar'daki gizlilik seçenekleri formu
 * yazar; Ayarlar yalnızca bunu okur (açılınca ağ isteği yapmaz).
 */
export interface UmpConsentSnapshot {
  /** `null`: UMP sonucu henüz gelmedi. */
  outcome: UmpConsentOutcome | null;
  /** UMP "gizlilik seçenekleri" girişi istiyor (AEA/İngiltere): Ayarlar'da düğme gösterilir. */
  privacyOptionsRequired: boolean;
  /** Durumu son kim yazdı. */
  source: 'startup' | 'privacy_options' | null;
}

export const INITIAL_UMP_CONSENT_SNAPSHOT: UmpConsentSnapshot = {
  outcome: null,
  privacyOptionsRequired: false,
  source: null,
};

/**
 * Gizlilik seçenekleri formunun sonucu.
 *  - `closed`: form açıldı ve kapandı; UMP durumu yeniden okundu.
 *  - `unavailable`: UMP bu girişi istemiyor (AEA dışı, web); form açılmadı.
 *  - `error`: form açılamadı; UMP durumu değişmedi.
 */
export type AdPrivacyOptionsResult = 'closed' | 'unavailable' | 'error';

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
