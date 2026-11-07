import { tRuntime } from '../i18n/strings';

/**
 * Reklam servisinin teknik (İngilizce) hata metnini oyuncuya gösterilecek, oyun dilindeki
 * mesaja çevirir. Bilinmeyen metin asla olduğu gibi gösterilmez.
 */
export const getAdErrorMessage = (error?: string | null): string => {
  const raw = (error ?? '').toLowerCase();
  if (raw.includes('daily ad limit')) return tRuntime('messages.adErrorDailyLimit');
  if (raw.includes('closed before reward')) return tRuntime('messages.adErrorClosedEarly');
  if (raw.includes('timed out')) return tRuntime('messages.adErrorTimeout');
  if (
    raw.includes('unavailable') ||
    raw.includes('ads disabled') ||
    raw.includes('premium user')
  ) {
    return tRuntime('messages.adErrorUnavailable');
  }
  // 'cancelled' (oyuncu ekrandan çıktı ya da uygulama arka plana geçti) genel mesaja düşer:
  // enerji/sınav reklamında da dönebildiği için "geri alma" metni burada yanlış olur. Geri Al
  // yolu iptali kendi mesajıyla (messages.undoLeftResult) ayrıca ele alıyor.
  return tRuntime('messages.adErrorGeneric');
};
