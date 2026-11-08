import {
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  AdsConsentStatus,
} from 'react-native-google-mobile-ads';
import type { AdsConsentInfo } from 'react-native-google-mobile-ads';
import { INITIAL_UMP_CONSENT_SNAPSHOT } from './adConsentPolicy';
import type { AdPrivacyOptionsResult, UmpConsentOutcome, UmpConsentSnapshot } from './adConsentPolicy';

/**
 * UMP (User Messaging Platform) consent flow.
 * EEA kullanıcıları için Google'ın standart onay formunu gösterir.
 *
 * Yalnızca UMP durumunu döndürür; oyuncunun Ayarlar'daki tercihine dokunmaz.
 * Kişiselleştirilmiş reklam kararı `resolveEffectivePersonalizedAds` ile
 * (UMP izin veriyor VE oyuncu açtı) verilir.
 */

type UmpConsentListener = (snapshot: UmpConsentSnapshot) => void;

let currentSnapshot: UmpConsentSnapshot = INITIAL_UMP_CONSENT_SNAPSHOT;
const listeners = new Set<UmpConsentListener>();
let privacyOptionsInFlight: Promise<AdPrivacyOptionsResult> | null = null;

/** Son bilinen UMP durumu (ağ isteği yapmaz). Yeni durum yazılana kadar aynı nesneyi döndürür. */
export const getUmpConsentSnapshot = (): UmpConsentSnapshot => currentSnapshot;

export const subscribeUmpConsent = (listener: UmpConsentListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const publish = (next: UmpConsentSnapshot): void => {
  currentSnapshot = next;
  listeners.forEach((listener) => {
    try {
      listener(next);
    } catch {
      // Bir dinleyicinin hatası diğerlerini durdurmasın.
    }
  });
};

const toUmpConsentOutcome = (status: AdsConsentStatus | undefined): UmpConsentOutcome => {
  switch (status) {
    case AdsConsentStatus.OBTAINED:
      return 'obtained';
    case AdsConsentStatus.NOT_REQUIRED:
      return 'not_required';
    case AdsConsentStatus.REQUIRED:
      return 'required';
    default:
      return 'unknown';
  }
};

const isPrivacyOptionsRequired = (info: Partial<AdsConsentInfo> | null | undefined): boolean =>
  info?.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;

/** Onay akışı yarıda kaldıysa SDK'nın son bildiği durumdan okunur (ağ isteği yok). */
const readCachedPrivacyOptionsRequired = async (): Promise<boolean> => {
  try {
    return isPrivacyOptionsRequired(await AdsConsent.getConsentInfo());
  } catch {
    return false;
  }
};

export async function requestAndResolveConsent(): Promise<UmpConsentOutcome> {
  try {
    const info = await AdsConsent.requestInfoUpdate();

    // Consent gerekiyorsa formu göster (EEA kullanıcıları)
    if (info.status === AdsConsentStatus.REQUIRED) {
      await AdsConsent.showForm();
    }

    // Güncel durumu al
    const finalInfo = await AdsConsent.requestInfoUpdate();
    const outcome = toUmpConsentOutcome(finalInfo.status);
    publish({
      outcome,
      privacyOptionsRequired: isPrivacyOptionsRequired(finalInfo),
      source: 'startup',
    });
    return outcome;
  } catch {
    // Herhangi bir hata durumunda güvenli fallback: kişiselleştirilmemiş reklam
    publish({
      outcome: 'error',
      privacyOptionsRequired: await readCachedPrivacyOptionsRequired(),
      source: 'startup',
    });
    return 'error';
  }
}

/**
 * Ayarlar > Gizlilik'teki "Reklam gizlilik seçenekleri" düğmesi: UMP gizlilik seçenekleri
 * formunu açar (AEA/İngiltere'de oyuncu reklam iznini sonradan değiştirebilsin). Form kapanınca
 * SDK güncel UMP durumunu döndürür; durum yayınlanır, etkin kişiselleştirme `useAppBootstrap`'te
 * aynı politika fonksiyonuyla yeniden hesaplanır. Oyuncunun Ayarlar'daki anahtarına dokunmaz.
 * Hata fırlatmaz.
 */
export function showAdPrivacyOptions(): Promise<AdPrivacyOptionsResult> {
  if (!currentSnapshot.privacyOptionsRequired) return Promise.resolve('unavailable');
  // Form açıkken ikinci dokunuş ikinci formu açmaz.
  if (privacyOptionsInFlight) return privacyOptionsInFlight;

  const pending = (async (): Promise<AdPrivacyOptionsResult> => {
    try {
      const closedInfo = await AdsConsent.showPrivacyOptionsForm();
      const info = closedInfo ?? (await AdsConsent.getConsentInfo());
      publish({
        outcome: toUmpConsentOutcome(info?.status),
        privacyOptionsRequired: isPrivacyOptionsRequired(info),
        source: 'privacy_options',
      });
      return 'closed';
    } catch {
      return 'error';
    }
  })();
  privacyOptionsInFlight = pending;
  // `then` her zaman sonra çalışır: form eşzamanlı hata verse bile kilit kalmaz.
  void pending.then(() => {
    if (privacyOptionsInFlight === pending) privacyOptionsInFlight = null;
  });

  return pending;
}
