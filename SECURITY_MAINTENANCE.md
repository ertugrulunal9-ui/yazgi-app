# Security and Stability Maintenance

Bu dokumanin amaci Yazgi projesinde guvenlik, stabilite ve surum yonetimini birlikte standartlastirmaktir.

## 1. Version Policy

- `latest` etiketi kullanma.
- Tum bagimliliklar `package.json` + `package-lock.json` ile deterministik olmalidir.
- CI sadece `npm ci` ile kurulum yapar.

Kontrol:

```bash
npm run deps:policy
```

## 2. Audit Policy

- Temel gate: production odakli audit.
- Bilinen upstream/transitif ve non-breaking fix olmayan advisory'ler allowlist ile izlenir.
- Yeni advisory cikarsa gate fail olur.

Kontrol:

```bash
npm run audit:prod
```

Allowlist dosyasi:

- `security/audit-allowlist.json`

## 3. Baseline Health Checks

Haftalik minimum komutlar:

```bash
npm run deps:fix
npm run doctor
npm run lint
npm run test:ci -- --watchAll=false
npm run audit:prod
```

Tek komut:

```bash
npm run maint:weekly
```

Doctor kontrolu (ayrica):

```bash
npm run maint:doctor
```

Not: Bu projede native klasorler kaynakta tutuldugu icin `expo.doctor.appConfigFieldsNotSyncedCheck.enabled=false` ayari aktif. CNG modeline gecilirse bu ayari tekrar `true` yapip kontrolu geri acin.

## 4. Update Cadence

- Haftalik: patch guncellemeleri + doctor/test/audit.
- Aylik: minor guncellemeleri ayri branch'te, regresyon testi ile.
- Major (Expo SDK/RN): stabil release sonrasi 2-4 hafta bekleme, sonra migration branch.

## 5. App Security Controls

- Secret'lar yalnizca environment/EAS secrets uzerinden.
- Backend endpointleri schema validation (Zod), auth ve rate-limit ile korunur.
- Odeme/entitlement dogrulamasi mumkun oldugunca server-side.
- Loglarda token/PII redaksiyonu zorunlu.

## 6. Operational Safety

- Crash izleme (Crashlytics vb.) aktif tutulur.
- Release channel stratejisi: `development` -> `preview` -> `production`.
- Her production release icin rollback plani (EAS Update channel geri alma) hazir tutulur.

## Incident Rule

Guvenlik veya stabilite problemi tespit edilirse:

1. Release durdurulur.
2. Etkilenen channel devre disi birakilir veya rollback uygulanir.
3. Kokk neden analizi ve kalici aksiyon dokumante edilir.

## 2026-02 Audit Action Plan

Tarih: 22 Subat 2026

Amac: Audit surecini "kontrollu risk" modunda tutarken CI ve production gate'ini korumak.

### Adim 1 - Gate'i koru (zorunlu)

- `npm run audit:prod` her PR ve release pipeline'inda zorunlu kalir.
- `npm run test:ci` zorunlu kalite kapisi olarak kalir.
- `npm audit fix --force` yasakli operasyon olarak kabul edilir.

### Adim 2 - Non-breaking fix dene (uygulanma durumu)

Calistirilan komut:

```bash
npm audit fix
```

Sonuc:

- Transitive lockfile guncellemeleri yapildi.
- High advisory sayisi anlamli sekilde dusmedi (upstream zincir agirlikli kaldi).
- `npm run audit:prod` PASS.
- `npm run typecheck:all` PASS.
- `npm run test:ci` coverage branch threshold altina dustu (global branch < 65).

Karar:

- Bu adim "denendi ama merge edilmedi" olarak ele alinacak.
- Non-breaking fix denemeleri, `test:ci` esitigi tekrar PASS olana kadar release'e alinmayacak.

### Adim 3 - reviewAfter tarihinde yeniden degerlendir

- Kayitli allowlist advisory'leri `security/audit-allowlist.json` icindeki `reviewAfter` tarihinde tekrar gozden gecir.
- Upstream'de non-breaking patch ciktiysa once onu uygula, sonra gate komutlarini tekrar calistir.

### Adim 4 - Gerekirse SDK major yolu

Asagidaki iki kosul birlikte saglanirsa major upgrade branch ac:

1. High advisory allowlist'te uzun sure kalmis ve upstream non-breaking fix yok.
2. Uretim riski (saldiri yuzeyi + etkisi) kabul edilemez seviyeye cikmis.

Major branch icin zorunlu kontrol listesi:

```bash
npx expo install --fix
npm run doctor
npm run typecheck:all
npm run test:ci
npm run audit:prod
```

Not: Bu adim yalnizca planli migration penceresinde uygulanir; hotfix olarak degil.
