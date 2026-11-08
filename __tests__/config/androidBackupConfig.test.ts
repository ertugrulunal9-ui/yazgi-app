/**
 * Android yedek yapılandırması koruması (Y-038, kullanıcı kararı 2026-11-08).
 *
 * Karar: `allowBackup` AÇIK kalır (oyuncu telefon değiştirince kayıtları Google yedeğinden geri gelir)
 * ve expo-secure-store'un hazır yedek kuralları EKLENMEZ. O kurallar
 * `<include domain="sharedpref" path="."/>` içerdiği için AsyncStorage veritabanını (tüm kayıtlar)
 * yedekten düşürür; yeni telefonda oyuncu her şeyini kaybeder.
 * Davranış kanıtı: `__tests__/save/backupRestore.test.ts`.
 */
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

describe('Android yedek yapılandırması', () => {
  it('app.json: expo-secure-store eklentisi configureAndroidBackup:false ile tanımlı', () => {
    const plugins: unknown[] = JSON.parse(read('app.json')).expo.plugins;
    const entry = plugins.find(p => (Array.isArray(p) ? p[0] : p) === 'expo-secure-store');
    expect(entry).toBeDefined();
    const options = Array.isArray(entry) ? (entry[1] as Record<string, unknown> | undefined) : undefined;
    if (options?.configureAndroidBackup !== false) {
      throw new Error(
        'app.json içinde "expo-secure-store" eklentisi { "configureAndroidBackup": false } ile tanımlı olmalı. ' +
          'Varsayılan (true) hâlinde `npx expo prebuild` manifeste hazır yedek kuralları ekler; bu kurallar ' +
          'sharedpref alanını yedeğe dahil etmediği için AsyncStorage veritabanı (tüm kayıtlar) yedekten düşer ' +
          've telefon değiştiren oyuncu kayıtlarını kaybeder.',
      );
    }
  });

  it('AndroidManifest.xml: allowBackup="true" ve hazır yedek kuralı özniteliği yok', () => {
    const manifest = read('android/app/src/main/AndroidManifest.xml');
    if (!/android:allowBackup="true"/.test(manifest)) {
      throw new Error(
        'AndroidManifest.xml içinde android:allowBackup="true" olmalı (kullanıcı kararı 2026-11-08): ' +
          'kapatılırsa telefon değiştiren oyuncunun kayıtları Google yedeğinden geri gelmez.',
      );
    }
    const forbidden = ['fullBackupContent', 'dataExtractionRules', 'secure_store_backup_rules', 'secure_store_data_extraction_rules'];
    const found = forbidden.filter(name => manifest.includes(name));
    if (found.length > 0) {
      throw new Error(
        `AndroidManifest.xml içinde yedek kuralı bulundu (${found.join(', ')}). Bu kurallar (expo-secure-store'un ` +
          'hazır kuralları ya da elle yazılmış olanlar) AsyncStorage veritabanını yedekten düşürebilir ve oyuncu ' +
          'telefon değiştirince tüm kayıtlarını kaybeder. Kaldırın ya da önce `__tests__/save/backupRestore.test.ts` ' +
          'senaryolarıyla ve kullanıcıyla birlikte yeniden karar verin.',
      );
    }
  });
});
