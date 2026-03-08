#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const DEFAULT_FILES = [
  'src/i18n/legacy.ts',
  'src/i18n/events/tr.ts',
  ...fs.readdirSync(path.resolve('src/i18n/domains'))
    .filter(name => name.endsWith('.ts'))
    .map(name => `src/i18n/domains/${name}`),
];

const PHRASE_REPLACEMENTS = new Map([
  ['Ayni tarz secimler birikince momentum olusur.', 'Aynı tarz seçimler birikince ivme oluşur.'],
  ['Seri yakaladiginda etkiler daha belirgin olur.', 'Seri yakaladığında etkiler daha belirgin olur.'],
  ['Kararlarini yavasla.', 'Kararlarını yavaşlat.'],
  ['Ilk 3 oturumda ilk event kararini ver', 'İlk 3 oturumda ilk olay kararını ver'],
  ['Event tipi: ', 'Olay türü: '],
  ['Momentum Bonusu', 'İvme Bonusu'],
  ['Legacy Puan', 'Miras Puanı'],
  ['legacy puani', 'miras puanı'],
  ['Legacy puani', 'Miras puanı'],
  ['save slot', 'kayıt yuvası'],
  ['Save slot', 'Kayıt yuvası'],
  ['save slots', 'kayıt yuvaları'],
  ['tutorial', 'rehber'],
  ['Tutorial', 'Rehber'],
  ['event', 'olay'],
  ['Event', 'Olay'],
  ['momentum', 'ivme'],
  ['Momentum', 'İvme'],
  ['legacy', 'miras'],
  ['Legacy', 'Miras'],
  ['item', 'eşya'],
  ['Item', 'Eşya'],
  ['slot', 'yuva'],
  ['Slot', 'Yuva'],
  ['hub screen', 'ana ekran'],
]);

const WORD_REPLACEMENTS = new Map([
  ['Acik', 'Açık'],
  ['acik', 'açık'],
  ['acilir', 'açılır'],
  ['acildi', 'açıldı'],
  ['acilan', 'açılan'],
  ['aciliyor', 'açılıyor'],
  ['acmak', 'açmak'],
  ['Ac', 'Aç'],
  ['ac', 'aç'],
  ['Agir', 'Ağır'],
  ['agir', 'ağır'],
  ['Arkadas', 'Arkadaş'],
  ['arkadas', 'arkadaş'],
  ['arkadasin', 'arkadaşın'],
  ['arkadaslik', 'arkadaşlık'],
  ['Asagi', 'Aşağı'],
  ['asagi', 'aşağı'],
  ['Basla', 'Başla'],
  ['basla', 'başla'],
  ['Baslangic', 'Başlangıç'],
  ['baslangic', 'başlangıç'],
  ['basliyor', 'başlıyor'],
  ['basladi', 'başladı'],
  ['baslamak', 'başlamak'],
  ['basarisiz', 'başarısız'],
  ['Bircok', 'Birçok'],
  ['bircok', 'birçok'],
  ['Buyuk', 'Büyük'],
  ['buyuk', 'büyük'],
  ['cagi', 'çağı'],
  ['Cagi', 'Çağı'],
  ['Calis', 'Çalış'],
  ['calis', 'çalış'],
  ['Caliskan', 'Çalışkan'],
  ['caliskan', 'çalışkan'],
  ['caliskanlik', 'çalışkanlık'],
  ['calismalarin', 'çalışmaların'],
  ['calisarak', 'çalışarak'],
  ['Cek', 'Çek'],
  ['cek', 'çek'],
  ['Ceviri', 'Çeviri'],
  ['ceviri', 'çeviri'],
  ['cevrendekilere', 'çevrendekilere'],
  ['cevrili', 'çevrili'],
  ['Cik', 'Çık'],
  ['cik', 'çık'],
  ['cikti', 'çıktı'],
  ['cikar', 'çıkar'],
  ['cikardi', 'çıkardı'],
  ['cikiyor', 'çıkıyor'],
  ['Cok', 'Çok'],
  ['cok', 'çok'],
  ['Cografya', 'Coğrafya'],
  ['cografya', 'coğrafya'],
  ['Cocuk', 'Çocuk'],
  ['cocuk', 'çocuk'],
  ['Deger', 'Değer'],
  ['deger', 'değer'],
  ['degistir', 'değiştir'],
  ['degisimi', 'değişimi'],
  ['degisiklik', 'değişiklik'],
  ['degisti', 'değişti'],
  ['Dogru', 'Doğru'],
  ['dogru', 'doğru'],
  ['Dogum', 'Doğum'],
  ['dogum', 'doğum'],
  ['Donem', 'Dönem'],
  ['donem', 'dönem'],
  ['Dondu', 'Döndü'],
  ['dondu', 'döndü'],
  ['donus', 'dönüş'],
  ['donusuyor', 'dönüşüyor'],
  ['Dunya', 'Dünya'],
  ['dunya', 'dünya'],
  ['Dus', 'Düş'],
  ['dus', 'düş'],
  ['dusurur', 'düşürür'],
  ['duzelmedi', 'düzelmedi'],
  ['Duz', 'Düz'],
  ['duz', 'düz'],
  ['Egitimi', 'Eğitimi'],
  ['egitimi', 'eğitimi'],
  ['Etkilesim', 'Etkileşim'],
  ['etkilesim', 'etkileşim'],
  ['etkilesimleri', 'etkileşimleri'],
  ['Gecis', 'Geçiş'],
  ['gecis', 'geçiş'],
  ['Gelistir', 'Geliştir'],
  ['gelistir', 'geliştir'],
  ['gelistirdin', 'geliştirdin'],
  ['gelistiriyorsun', 'geliştiriyorsun'],
  ['gelistirmeye', 'geliştirmeye'],
  ['Gercek', 'Gerçek'],
  ['gercek', 'gerçek'],
  ['Giris', 'Giriş'],
  ['giris', 'giriş'],
  ['Gizli', 'Gizli'],
  ['Gor', 'Gör'],
  ['gor', 'gör'],
  ['gorunuyor', 'görünüyor'],
  ['goruntule', 'görüntüle'],
  ['goster', 'göster'],
  ['gosteriliyor', 'gösteriliyor'],
  ['gosterilemedi', 'gösterilemedi'],
  ['Guclu', 'Güçlü'],
  ['guclu', 'güçlü'],
  ['gucleniyor', 'güçleniyor'],
  ['guclendir', 'güçlendir'],
  ['guc', 'güç'],
  ['Guncelle', 'Güncelle'],
  ['guncelle', 'güncelle'],
  ['Gun', 'Gün'],
  ['gun', 'gün'],
  ['Gunu', 'Günü'],
  ['gunu', 'günü'],
  ['Gunler', 'Günler'],
  ['gunler', 'günler'],
  ['Guzel', 'Güzel'],
  ['guzel', 'güzel'],
  ['Hala', 'Hâlâ'],
  ['hala', 'hâlâ'],
  ['Henuz', 'Henüz'],
  ['henuz', 'henüz'],
  ['Hic', 'Hiç'],
  ['hic', 'hiç'],
  ['Hos', 'Hoş'],
  ['hos', 'hoş'],
  ['Hosgeldin', 'Hoş geldin'],
  ['hosgeldin', 'hoş geldin'],
  ['Icindeki', 'İçindeki'],
  ['icindeki', 'içindeki'],
  ['Icinden', 'İçinden'],
  ['icinden', 'içinden'],
  ['Ic', 'İç'],
  ['ic', 'iç'],
  ['Ile', 'İle'],
  ['Iliski', 'İlişki'],
  ['iliski', 'ilişki'],
  ['Ilk', 'İlk'],
  ['ilk', 'ilk'],
  ['Ileri', 'İleri'],
  ['ileri', 'ileri'],
  ['Insan', 'İnsan'],
  ['insan', 'insan'],
  ['Ingilizce', 'İngilizce'],
  ['ingilizce', 'ingilizce'],
  ['Iptal', 'İptal'],
  ['iptal', 'iptal'],
  ['Ipuclari', 'İpuçları'],
  ['ipuclari', 'ipuçları'],
  ['Ipuclari:', 'İpuçları:'],
  ['Ipuclari', 'İpuçları'],
  ['Ipuclari:', 'İpuçları:'],
  ['Iyi', 'İyi'],
  ['iyi', 'iyi'],
  ['Izle', 'İzle'],
  ['izle', 'izle'],
  ['Iz', 'İz'],
  ['iz', 'iz'],
  ['Kaderini', 'Kaderini'],
  ['Kapali', 'Kapalı'],
  ['kapali', 'kapalı'],
  ['Kardes', 'Kardeş'],
  ['kardes', 'kardeş'],
  ['Karsi', 'Karşı'],
  ['karsi', 'karşı'],
  ['Kayit', 'Kayıt'],
  ['kayit', 'kayıt'],
  ['Kisisellestirilmis', 'Kişiselleştirilmiş'],
  ['kisisellestirilmis', 'kişiselleştirilmiş'],
  ['Kotu', 'Kötü'],
  ['kotu', 'kötü'],
  ['Kucuk', 'Küçük'],
  ['kucuk', 'küçük'],
  ['Lutfen', 'Lütfen'],
  ['lutfen', 'lütfen'],
  ['Meraklisin', 'Meraklısın'],
  ['Miras Puani', 'Miras Puanı'],
  ['miras puani', 'miras puanı'],
  ['Muzik', 'Müzik'],
  ['muzik', 'müzik'],
  ['Mukemmel', 'Mükemmel'],
  ['mukemmel', 'mükemmel'],
  ['Notr', 'Nötr'],
  ['notr', 'nötr'],
  ['Ogrenci', 'Öğrenci'],
  ['ogrenci', 'öğrenci'],
  ['Ogren', 'Öğren'],
  ['ogren', 'öğren'],
  ['Ogret', 'Öğret'],
  ['ogret', 'öğret'],
  ['Olculu', 'Ölçülü'],
  ['olculu', 'ölçülü'],
  ['Ozel', 'Özel'],
  ['ozel', 'özel'],
  ['Ozellik', 'Özellik'],
  ['ozellik', 'özellik'],
  ['Ozeti', 'Özeti'],
  ['ozeti', 'özeti'],
  ['Ozet', 'Özet'],
  ['ozet', 'özet'],
  ['Pisman', 'Pişman'],
  ['pisman', 'pişman'],
  ['Puani', 'Puanı'],
  ['puani', 'puanı'],
  ['Ruzgar', 'Rüzgar'],
  ['ruzgar', 'rüzgar'],
  ['Saglik', 'Sağlık'],
  ['saglik', 'sağlık'],
  ['Sans', 'Şans'],
  ['sans', 'şans'],
  ['Sec', 'Seç'],
  ['sec', 'seç'],
  ['Secenek', 'Seçenek'],
  ['secenek', 'seçenek'],
  ['Secim', 'Seçim'],
  ['secim', 'seçim'],
  ['Secildi', 'Seçildi'],
  ['secildi', 'seçildi'],
  ['Sehir', 'Şehir'],
  ['sehir', 'şehir'],
  ['Sifir', 'Sıfır'],
  ['sifir', 'sıfır'],
  ['Sinav', 'Sınav'],
  ['sinav', 'sınav'],
  ['Siradaki', 'Sıradaki'],
  ['siradaki', 'sıradaki'],
  ['Sira', 'Sıra'],
  ['sira', 'sıra'],
  ['Soyle', 'Söyle'],
  ['soyle', 'söyle'],
  ['Sosyal yonun', 'Sosyal yönün'],
  ['Sure', 'Süre'],
  ['sure', 'süre'],
  ['Suruyor', 'Sürüyor'],
  ['suruyor', 'sürüyor'],
  ['Su', 'Şu'],
  ['su', 'şu'],
  ['Suk', 'Sük'],
  ['Tanis', 'Tanış'],
  ['tanis', 'tanış'],
  ['Tanimliyor', 'Tanımlıyor'],
  ['tanimliyor', 'tanımlıyor'],
  ['Tasiyor', 'Taşıyor'],
  ['tasiyor', 'taşıyor'],
  ['Turkce', 'Türkçe'],
  ['turkce', 'türkçe'],
  ['Yas', 'Yaş'],
  ['yas', 'yaş'],
  ['Yasam', 'Yaşam'],
  ['yasam', 'yaşam'],
  ['yasinda', 'yaşında'],
  ['yasindan', 'yaşından'],
  ['yasini', 'yaşını'],
  ['yasina', 'yaşına'],
  ['Yavas', 'Yavaş'],
  ['yavas', 'yavaş'],
  ['Yenile', 'Yenile'],
  ['Yolun basindasin', 'Yolun başındasın'],
  ['Yukle', 'Yükle'],
  ['yukle', 'yükle'],
  ['yukleniyor', 'yükleniyor'],
  ['Yukleniyor', 'Yükleniyor'],
  ['Yuzde', 'Yüzde'],
  ['yuzde', 'yüzde'],
  ['Zeka', 'Zekâ'],
  ['zeka', 'zekâ'],
]);

function escapeForSingleQuote(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
}

function escapeForDoubleQuote(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n');
}

function escapeForBacktick(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function getPropertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return null;
}

function normalizeTurkishText(input) {
  let text = input;

  PHRASE_REPLACEMENTS.forEach((replacement, phrase) => {
    text = text.split(phrase).join(replacement);
  });

  WORD_REPLACEMENTS.forEach((replacement, token) => {
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(`\\b${escaped}\\b`, 'g'), replacement);
  });

  text = text
    .replace(/İyi gunler/g, 'İyi günler')
    .replace(/iyi gunler/g, 'iyi günler')
    .replace(/genc/g, 'genç')
    .replace(/Genc/g, 'Genç')
    .replace(/gorsel/g, 'görsel')
    .replace(/Gorsel/g, 'Görsel')
    .replace(/cunku/g, 'çünkü')
    .replace(/Cunku/g, 'Çünkü')
    .replace(/coktan/g, 'çoktan')
    .replace(/Coktan/g, 'Çoktan');

  return text;
}

function applyTsFile(filePath, forceLocale = null) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );

  const edits = [];

  function addEdit(start, end, replacement) {
    if (sourceText.slice(start, end) === replacement) return;
    edits.push({ start, end, replacement });
  }

  function visit(node, localeContext) {
    if (ts.isPropertyAssignment(node)) {
      const propertyName = getPropertyName(node.name);
      const nextLocale = propertyName === 'tr' || propertyName === 'en'
        ? propertyName
        : localeContext;
      visit(node.initializer, nextLocale);
      return;
    }

    if (ts.isStringLiteral(node)) {
      if (localeContext === 'tr') {
        const normalized = normalizeTurkishText(node.text);
        const quote = sourceText[node.getStart(sourceFile)];
        const replacement = quote === '"'
          ? `"${escapeForDoubleQuote(normalized)}"`
          : `'${escapeForSingleQuote(normalized)}'`;
        addEdit(node.getStart(sourceFile), node.getEnd(), replacement);
      }
      return;
    }

    if (ts.isNoSubstitutionTemplateLiteral(node)) {
      if (localeContext === 'tr') {
        const normalized = normalizeTurkishText(node.text);
        addEdit(node.getStart(sourceFile), node.getEnd(), `\`${escapeForBacktick(normalized)}\``);
      }
      return;
    }

    ts.forEachChild(node, child => visit(child, localeContext));
  }

  visit(sourceFile, forceLocale);

  if (edits.length === 0) return false;

  let output = sourceText;
  edits.sort((a, b) => b.start - a.start).forEach(edit => {
    output = output.slice(0, edit.start) + edit.replacement + output.slice(edit.end);
  });

  fs.writeFileSync(filePath, output, 'utf8');
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const files = args.length > 0 ? args : DEFAULT_FILES;
  let changedCount = 0;

  files.forEach(relativeFile => {
    const filePath = path.resolve(relativeFile);
    if (!fs.existsSync(filePath)) return;
    const forceLocale = filePath.endsWith(path.normalize('src/i18n/events/tr.ts')) ? 'tr' : null;
    if (applyTsFile(filePath, forceLocale)) {
      changedCount += 1;
      console.log(`normalized ${relativeFile}`);
    }
  });

  console.log(`changed ${changedCount} files`);
}

main();
