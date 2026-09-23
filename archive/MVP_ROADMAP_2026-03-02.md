# Yazgi MVP Roadmap (4 Hafta)

Tarih: 2 Mart 2026  
Donem: 2 Mart 2026 - 29 Mart 2026  
Rol: Scrum Master / Analist (Kapsam Yonetimi)

## Varsayimlar

- Ekip kapasitesi: 2 full-time developer + 0.5 QA (yaklasik 9 net eng-day/hafta).
- Kapsam hedefi: "release candidate" seviyesinde MVP (test kapisi yesil, kritik monetization yolu hazir, cekirdek loop stabil).
- Yeni buyuk feature acilmayacak; mevcut branchteki paketlerin tamamlanmasi oncelik olacak.

## Mevcut Durum (X)

- Cekirdek oyun dongusu, event altyapisi, save/load, i18n fazlari mevcut.
- `typecheck` (2 Mart 2026) gecerli.
- Feature flag ile aktif olan ana paketler:
  - `MILESTONE_SUMMARY`, `FATE_TRANSPARENCY`, `ECONOMY_DEPTH`, `MICRO_GOALS`,
  - `NPC_VISIBLE_REACTIONS`, `NPC_RICH_FEEDBACK`, `UNDO_MECHANIC`
- Premium altyapi kodu mevcut ama flag kapali: `PREMIUM_SUBSCRIPTION=false`.
- Test durumu: 104 suite icinde 8 suite fail (kalite kapisi kirik).

## Hedeflenen Kapsam (Y)

- Test/kalite kapisini yesile cekmek.
- Premium subscription/paywall akisini release'e hazirlamak.
- Kalici secim etkileri (permanent flags + butterfly effect) kontrollu aktivasyon.
- Save/export/analytics kontratlarini yeni sisteme senkronlamak.
- 4 hafta sonunda RC build + release checklist.

## Onceliklendirilmis Backlog

Skor formulu:
`skor = (2*UserValue) + (2*BusinessImpact) + TimeCriticality - Effort - DependencyRisk - Uncertainty`

| Item | User | Biz | Time | Effort | Dep | Unc | Skor | Oncelik |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Test kapisi fix (8 fail suite) | 5 | 5 | 5 | 4 | 2 | 1 | 17 | P0 |
| Ending/career resolver senkronu | 5 | 4 | 5 | 3 | 2 | 1 | 15 | P0 |
| Save export/import v5 kontrat senkronu | 5 | 5 | 5 | 4 | 2 | 2 | 15 | P0 |
| AppShell modal/entegrasyon stabilizasyonu | 4 | 4 | 4 | 3 | 2 | 1 | 12 | P0 |
| Experiment bitmask yeni flag setine uyarlama | 3 | 4 | 4 | 2 | 1 | 1 | 12 | P0 |
| Premium subscription release hazirligi | 4 | 5 | 4 | 4 | 3 | 2 | 11 | P1 |
| Permanent flags + butterfly effect rollout | 4 | 4 | 3 | 4 | 3 | 2 | 8 | P1 |
| Social groups + item unlock polish | 3 | 3 | 2 | 3 | 2 | 2 | 5 | P2 |
| Extra economy tuning + content genisletme | 3 | 3 | 1 | 4 | 2 | 2 | 3 | P2 |

## MVP Cut-Line

### MVP'ye girenler (P0)
- Tum test suite kiriklarini kapatma.
- Ending/career ve save/export kontrat uyumu.
- AppShell stabilizasyonu.
- Experiment/analytics parametre uyumu.

### MVP sonrasi (P1/P2)
- Premium flag acilisi ve store-ready sertlestirme.
- Permanent flags + butterfly events genis rollout.
- Social/economy icerik genisletmesi.

## 4 Haftalik Sprint Plani

## Hafta 1 (2 Mart - 8 Mart 2026) - Stabilizasyon Sprinti

- Hedef: Kalite kapisini geri kazanmak (test fail -> pass).
- Kapsam:
  - `endingResolver*` ve `gameUtilsExtended` test uyumsuzluklarini gider.
  - `personalitySystem` esitlik/hesaplama beklentilerini kodla veya testle senkronla.
  - `AppShell.integration` modal/export kaynakli render hatasini kapat.
- Sahiplik:
  - Dev A: ending + game utils
  - Dev B: AppShell + personality system
  - QA: regression smoke
- Bagimlilik:
  - Guncel oyun davranisi icin karar (testleri mi kodu mu referans alacak) netlestirilmeli.
- Cikti:
  - En az 4 fail suite kapanmis.
- Tamamlanma kosulu:
  - `npm run typecheck` pass
  - fail suite sayisi 8 -> <= 4

## Hafta 2 (9 Mart - 15 Mart 2026) - Kontrat ve Veri Uyumu

- Hedef: Save/analytics kontratlarinda kirilmayi sifirlamak.
- Kapsam:
  - `SaveExportImport` beklentilerini v5 export/encryption modeline senkronla.
  - `experimentAssignment` bitmask formatini mevcut feature-flag seti ile esitle.
  - `economicRecoveryEvents` testini guncel event sayisi/icerigi ile esle.
- Sahiplik:
  - Dev A: Save/export kontrati
  - Dev B: Analytics bitmask + event testleri
  - QA: import/export geri uyumluluk senaryolari
- Bagimlilik:
  - Save schema/version kararinin urun seviyesinde net olmasi.
- Cikti:
  - Tum test suite yesil veya kritik blocker disinda tekil istisna listesi.
- Tamamlanma kosulu:
  - `npm test -- --watch=false` pass
  - Export/import senaryosu manuel smoke pass

## Hafta 3 (16 Mart - 22 Mart 2026) - Premium ve Rollout Hazirligi

- Hedef: Gelir yolunu kontrollu acilabilir hale getirmek.
- Kapsam:
  - `PREMIUM_SUBSCRIPTION` icin feature flag rollout plani.
  - Paywall + subscription manager (offerings/purchase/restore) hata akislari.
  - `app.json` RevenueCat/AdMob production config checklist ve runtime guard.
- Sahiplik:
  - Dev A: subscription/paywall
  - Dev B: config guards + remote flag rollout
  - QA: sandbox satin alma ve restore testleri
- Bagimlilik:
  - RevenueCat ve store urun ID'lerinin hazir olmasi.
- Cikti:
  - Premium feature dark-launcha hazir.
- Tamamlanma kosulu:
  - Premium akisinin happy-path + fail-path test raporu
  - Feature flag ile ac/kapat dogrulamasi

## Hafta 4 (23 Mart - 29 Mart 2026) - Stabilizasyon ve Release Gate

- Hedef: MVP RC build cikarmak.
- Kapsam:
  - Release regression (core gameplay, save/load, event loop, monetization toggles).
  - Crash/analytics kontrolu, no-regression smoke.
  - Scope disi kalan P1/P2 maddelerini post-MVP backlog'a tasima.
- Sahiplik:
  - Dev A + Dev B: bugfix ve release branch stabilizasyonu
  - QA: full smoke + release sign-off
- Bagimlilik:
  - Onceki haftalardan kritik bug tasinmamasi.
- Cikti:
  - RC build + release notlari + "ship/no-ship" karari.
- Tamamlanma kosulu:
  - Typecheck + test + smoke kapilari pass
  - Kritik seviyesi issue yok

## Scope Kararlari

- Scope cut onerisi:
  - `PERMANENT_FLAGS` genel rolloutunu MVP sonrasina birak; sadece altyapiyi ac ve sinirli event setiyle test et.
- Scope swap onerisi:
  - Yeni social/economy icerik eklemek yerine Hafta 3'te premium purchase-failure handling'e ek zaman ayir.
- Gecikmede ilk cikarilacak kalem:
  - P2 seviyesindeki "extra economy tuning + content expansion".

## Bitis Tahmini

- En iyi senaryo: 27 Mart 2026 (Cuma) - RC hazir.
- Olasi senaryo: 31 Mart 2026 (Sali) - ufak bugfix buffer ile.
- Riskli senaryo: 7 Nisan 2026 (Sali) - premium/store bagimliliklari gecikirse.
