---
name: kapsam-yonetimi
description: Scope management and product roadmap planning to convert broad feature ideas into a releasable MVP. Use when a user asks to prioritize mevcut and planned features, define a realistic MVP cut, estimate completion windows, order work by impact and dependency, or produce sprint plans (especially 4-week plans) with clear scope boundaries.
---

# Kapsam Yonetimi

Netlestir projeyi bitmeyen fikir listesinden cikartip yayinlanabilir MVP kapsamina indirmek, sonra bunu haftalik sprint planina cevirmek.

## Workflow

1. Topla girisleri.
- Ayir `mevcut_ozellikler`, `istenen_ozellikler`, hedef kullanici, hedef tarih, ekip kapasitesi.
- Sorulmamissa makul varsayim yaz ve acik et.

2. Hazirla ortak backlog.
- Birlestir tum ozellikleri tek listede.
- Etiketle her ozelligi: `Must`, `Should`, `Could`, `Won't`.
- Oku `references/puanlama-sablonu.md` ve puanlama sutunlarini uygula.

3. Hesapla oncelik sirasi.
- Uret her ozellik icin toplam puan.
- Yuksek etki + dusuk efor + dusuk bagimlilik olanlari one cek.
- Isaretle belirsiz ve riskli kalemleri `spike` olarak ayir.

4. Ciz MVP kesme cizgisi.
- Sec sadece ilk surum icin zorunlu olanlari (`P0`).
- Tasir `P1/P2` kalemlerini sonraki iterasyonlara.
- Belirt hangi ozellikler cikarsa tarih kurtarilir.

5. Kur 4 haftalik sprint plani.
- Oku `references/dort-haftalik-sprint-sablonu.md`.
- Dagit `P0` kapsamini haftalara bagimlilik ve entegrasyon riskine gore.
- Planla son haftada sadece stabilizasyon, bugfix, telemetry, release hazirligi.

6. Ver teslimat ozetini.
- Yaz net bir cikti: Varsayimlar, Onceliklendirilmis backlog (P0/P1/P2), 4 haftalik sprint plani, Bitis tahmini (en iyi / olasi / riskli), en kritik 3 risk ve onleyici aksiyon.

## Cikti Kurali

Uret cevaplari tablo+madde dengesiyle ve karar alinabilir formatta.

- Ver her hafta icin: hedef, kapsam, cikti, tamamlanma kosulu.
- Yaz her sprint maddesi icin sahiplik (rol bazli) ve bagimlilik.
- Ekle en az bir "scope cut" onerisi ve bir "scope swap" onerisi.
- Koru terminoloji: `MVP`, `P0`, `P1`, `P2`, `risk`, `bagimlilik`, `tamamlanma`.

## Hizli Hesaplama Kurali

Eger saat/gun tahmini yoksa:
- Donustur eforu `S=1`, `M=2`, `L=3`, `XL=5` puanina.
- Kabul et haftalik net kapasiteyi kisi basi `3.5` gun (toplantilar ve operasyon cikartilmis).
- Hesapla kabaca bitis:
  `toplam_efor_gunu / (ekip_sayisi * 3.5)` = gerekli hafta.

Raporla bu hesabin kaba tahmin oldugunu acikca.
