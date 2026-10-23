import { getRuntimeLocale } from '../i18n/strings';
import type { AppLocale } from '../i18n/strings';

/**
 * Metni oyun diline göre büyük harfe çevirir. Türkçede "i" → "İ" olmalı;
 * `textTransform: 'uppercase'` ise Android'de cihaz dilini, web'de sayfa dilini
 * kullandığı için Türkçe metinde "GELIŞIM" gibi yanlış sonuç verebiliyor.
 */
export const toUpperLocale = (text: string, locale: AppLocale = getRuntimeLocale()): string => (
  locale === 'tr' ? text.replace(/i/g, 'İ').toUpperCase() : text.toUpperCase()
);
