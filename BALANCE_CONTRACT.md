# Balance Contract

Bu doküman, başlangıç balansı için tek kaynak sözleşmesidir.

## Source of truth

- Kod kaynağı: `src/config/balanceContract.ts`
- Başlangıç statları:
  - `health: 25`
  - `intelligence: 0`
  - `charisma: 5`
  - `discipline: 0`
  - `money: 0`
  - `familyRelation: 50`
- Başlangıç enerji formülü:
  - `energy = floor(base + health * healthFactor)`
  - `base = 50`
  - `healthFactor = 0.3`

## Testing Rule

- Testler sabit sayı kopyalamaz.
- Başlangıç stat/enerji beklentileri `src/config/balanceContract.ts` üzerinden okunur.
- Balans güncellemesi yapılırsa önce sözleşme dosyası güncellenir, sonra testler otomatik olarak yeni değeri doğrular.
