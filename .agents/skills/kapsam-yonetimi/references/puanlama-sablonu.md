# Puanlama Sablonu

Kullan amacli bu tabloyu backlog item'larini hizli karsilastirmak icin.

## Sutunlar

| Alan | Aralik | Aciklama |
| --- | --- | --- |
| Feature | metin | Ozellik adi |
| User Value | 1-5 | Kullaniciya dogrudan deger |
| Business Impact | 1-5 | Gelir, retention, stratejik etki |
| Time Criticality | 1-5 | Gecikirse kayip riski |
| Effort | 1-5 | Uygulama zorlugu (5 en zor) |
| Dependency Risk | 0-3 | Bagimlilik riski (3 en riskli) |
| Uncertainty | 0-2 | Bilinmezlik seviyesi |

## Toplam Skor

Kullan asagidaki kisa formulu:

`skor = (2*UserValue) + (2*BusinessImpact) + TimeCriticality - Effort - DependencyRisk - Uncertainty`

## Oncelik Kurali

- Ata `P0`: skor >= 8 ve release icin kritik.
- Ata `P1`: skor 4-7 arasi veya release sonrasi hizli kazanclar.
- Ata `P2`: skor <= 3, nice-to-have veya deneysel.

Not et: Kritik yasal/guvenlik gereksinimleri skordan bagimsiz `P0` olur.
