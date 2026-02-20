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
