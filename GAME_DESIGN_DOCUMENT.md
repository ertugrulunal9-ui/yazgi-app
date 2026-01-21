# YAZGI - Hayat Yolculuğu
## Game Design Document (GDD)

**Versiyon:** 1.0  
**Son Güncelleme:** Ocak 2026  
**Durum:** Active Development

---

## 1. Executive Summary

**Yazgı (LifeSim: Hayat Yolculuğu)**, Türk mobil oyuncuları için özel olarak tasarlanan, metin-tabanlı seçim simulatörüdür. Oyuncu, bir karakterin doğumundan 18 yaşına kadar yaşam yolculuğunu kontrol eder; her kararı sağlık, zeka, sosyal ilişkiler ve finansal durum gibi yaşam istatistiklerini etkiler. BitLife ve InstLife'a benzer mekaniklerle zenginleştirilmiş oyun, Türkiye'nin yükselen mobil gaming pazarına hitap ederken, kültürel uyum ve yerel hikayelerle farklılaşır. Hedef: 16-35 yaş arasındaki Türk kullanıcılara odaklanarak, 6 ayda 100K DAU ve %35 D7 retention oranına ulaşmak.

---

## 2. Core Gameplay Loop

### 2.1 Oyun Akışı Diyagramı

```
┌─────────────────────────────────────────────────────────────┐
│                    OYUN BAŞLANGIÇ                           │
│            (Karakter Oluşturma - İsim, Aile)                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │   HUB MENÜSÜ       │
        │ (Ana Aktiviteler)  │
        └────┬────┬────┬─────┘
             │    │    │
    ┌────────┘    │    └──────────┐
    │             │               │
    ▼             ▼               ▼
┌────────┐  ┌──────────┐  ┌──────────────┐
│ Ders   │  │ Spor     │  │ Sosyal      │
│ Çalış  │  │ Yap      │  │ İnter       │
└───┬────┘  └────┬─────┘  └──────┬───────┘
    │            │               │
    │       ┌────┴────┬─────┐    │
    │       │         │     │    │
    │       ▼         ▼     ▼    │
    │    ┌───────┐ ┌─────┬─────┐│
    │    │Work   │ │Şop  │Art  ││
    │    └───────┘ └─────┴─────┘│
    │       │             │     │
    └───────┴─────────────┴─────┘
            │
            ▼
    ┌──────────────────┐
    │  OLAy SEÇENEĞİ   │
    │  (PROB% şansla)  │
    └────┬─────────────┘
         │
    ┌────┴────────────┐
    │                 │
    ▼                 ▼
┌────────────┐  ┌─────────────┐
│ SEÇIM      │  │ SONUÇ FAZA  │
│ (2-3 opsy.)│  │(Stat Geri   │
│            │  │ bildirimi)  │
└──────┬─────┘  └──────┬──────┘
       │               │
       └───────┬───────┘
               │
               ▼
       ┌──────────────────┐
       │ Enerji Azalma    │
       │ Yaşa Etkisi      │
       └────┬─────────────┘
            │
    ┌───────┴────────┐
    │                │
    ▼                ▼
┌──────────┐  ┌─────────────────┐
│Enerji    │  │ Her 5 tur:      │
│Sıfırlandı│  │ RAPOR KARTI     │
└────┬─────┘  │ (Not Gösterim)  │
     │        └────┬────────────┘
     │             │
     └─────┬───────┘
           │
    ┌──────┴───────┐
    │              │
    ▼              ▼
┌─────────┐   ┌──────────────┐
│ YAŞ++ │   │ YAŞ=18?      │
│ HUBa DÖN│   └─────┬────────┘
└─────────┘         │
               ┌─────┴──────┐
               │            │
               ▼            ▼
          ┌─────────┐  ┌──────────────┐
          │ Yaş < 18│  │ OYUN SONU    │
          │ LOOP    │  │ (Kariyer Rpt)│
          └─────────┘  └──────────────┘
```

### 2.2 Tur Mekaniki

- **Bir Tur:** Bir hub aktivitesi seçimi veya bir event
- **Enerji Sistemi:** 
  - Başlangıç: 50 + (Health × 0.3)
  - Her aktivite: -5 ila -20 enerji
  - Sıfır enerji → gün biter, istatistikler ayarlanır
- **Yaş İlerlemesi:** 
  - 0-7 yaş: Her 2 tur
  - 7-18 yaş: Her 5 tur
- **Event Türü:** %70 COMMON, %25 UNCOMMON, %5 RARE
- **Oyun Süresi:** Ortalama 45-60 dakika (yaş 0-18)

---

## 3. Progression System

### 3.1 İstatistik Sistemi (Stats)

| İstatistik | Min | Max | Açıklama |
|-----------|-----|-----|----------|
| **Health** | 0 | 100 | Fiziksel sağlık, hastalık direnci, ömür |
| **Intelligence** | 0 | 100 | Akademik başarı, kariyer potansiyeli |
| **Charisma** | 0 | 100 | Sosyal etkileşim, romantik ilişki başarısı |
| **Discipline** | 0 | 100 | Çalışma konsantrasyonu, kötü alışkanlıklara direnç |
| **Money** | 0 | ∞ | Para tasarrufları, satın alma gücü |
| **Energy** | 0 | Max | Günlük aktivite potansiyeli (reset/gün) |
| **Family Relation** | 0 | 100 | Ebeveyn ilişkisi, miras potansiyeli |

### 3.2 Kalıtsal Özellikler (Genetic Traits)

Doğumda rastgele atanır (%5-15 şans):

| Özellik | Etki | Açıklama |
|---------|------|----------|
| **GENIUS** | +30% Intelligence gains | Doğal zeka avantajı |
| **ATHLETIC** | +30% Sports skill, -10% energy cost | Sporcu yatkınlığı |
| **SICKLY** | -30% Health gains, -10% max health | Zayıf bağışıklık sistemi |
| **CHARISMATIC** | +30% Charisma gains | Doğal sosyal çekim |
| **WEALTHY_FAMILY** | +50% initial money | Zengin ailede doğum |
| **POOR_FAMILY** | -50% initial money | Fakir ailede doğum |

### 3.3 Edinilmiş Özellikler (Acquired Traits)

Oyun boyunca mekaniklere dayalı olarak elde edilir:

| Özellik | Gereksinim | Oyun Etkisi |
|---------|-----------|-----------|
| **BOOKWORM** | 15+ saat ders çalışma | +10 Language grade |
| **EMPATHETIC** | 4+ sosyal pozitif seçim | +20% family relation gains |
| **DISCIPLINED** | 10+ spor etkinliği | -15% energy cost tüm aktiviteler |
| **GAMER** | 8+ computer session | +40% coding skill |
| **MUSICIAN** | 6+ music practice | +50% music skill |
| **NERD** | GENIUS + 10 saat çalışma | +15% intelligence gains |

### 3.4 Beceri Sistemi (Skills)

| Beceri | Max | Kazanım | Kullanım |
|--------|-----|---------|----------|
| **Coding** | 100 | Computer aktivitesi | Tech job career, special events |
| **Music** | 100 | Art aktivitesi | Musical events, income source |
| **Sports** | 100 | Sports aktivitesi | Athletic events, health bonus |

**Beceri Etkisi:** Level = Kariyer seçeneği (0-49: işçi, 50-79: profesyonel, 80+: uzman)

### 3.5 Okul Sistemi (7-18 yaş)

**Ders Konuları:**
- Math (Matematik)
- Science (Fen)
- Language (Türkçe)
- Art (Sanat)

**Not Hesaplama Formülü:**
```
Base Score = (Intelligence × 1.2) - (Stress × 0.15) + Random(0-10)
Stress = 100 - Current Energy

Trait Bonuses:
- GENIUS: +10
- BOOKWORM: +10 (Language only)
- DISCIPLINED: +5

Grade Thresholds:
- 90+: A (Mükemmel)
- 80-89: B (İyi)
- 70-79: C (Orta)
- 60-69: D (Geçer)
- <60: F (Başarısız)
```

**Rapor Kartı Sıklığı:** Her 5 tur (7-18 yaş)

**Aile Tepkisi:**
- Ortalama not ≥ 80 + SUPPORTIVE family → +10 Family Relation
- Ortalama not < 60 + STRICT family → -15 Family Relation + Disiplin event
- CHAOTIC family → Random tepki

### 3.6 Aile Sistemi

**Başlangıç Parametreleri:**

| Parametre | Değerler | Etki |
|-----------|----------|------|
| **Wealth** | Poor / Middle / Rich | Initial money, inheritance, event access |
| **Dynamic** | Supportive / Strict / Chaotic | Reward/punishment, special events |
| **NPC Count** | 3-5 | Relatives/connections |

**Miras Sistemi:** 
- Age 18'de Family Relation × Wealth sınıfı = Miras miktarı
- SUPPORTIVE + Rich = 50K+ başlangıç bonus

### 3.7 NPC/İlişki Sistemi

**NPC Rolleri:**
- ACQUAINTANCE (Tanıdık): Random encounter şansı
- FRIEND (Arkadaş): Positif event trigger, +5 reputation
- PARTNER (Partner): Romance event branch, stat synergy
- RIVAL (Rakip): Competitive events, -reputation ve conflict

**İlişki Mekanikler:**
- Her social interaction: +5 to -10 relationship score
- Romance: Partner-level relationship → career/happiness bonus
- Conflict: Rival relationship → negative event triggers

---

## 4. Monetization Strategy

### 4.1 F2P + IAP Modeli

**Serbest Özellikler:**
- Sınırsız oynanış (Ad-supported)
- Tüm aktiviteler
- Tüm eventler
- Tüm statslar ve mekanikler
- 3 save slot

**İçinde Satın Alma (IAP):**

| Ürün | Fiyat | Faydalar | Kâr Potansiyeli |
|------|-------|----------|-----------------|
| **Premium Traits** | ₺29.99 | GENIUS, LUCKY, CHARMING (seçilebilir) | 5-8% conversion |
| **Save Slot +3** | ₺14.99 | 3 ek kayıt alanı | 3-5% conversion |
| **Cosmetics Pack** | ₺24.99 | Avatar skins, aile isimleri tema | 2-4% conversion |
| **Energy Refill** | ₺9.99 | +50 energy anında | 4-7% conversion |
| **Season Pass** | ₺59.99 | 30-day: daily rewards, XP+50%, no ads | 1-3% conversion |
| **Skip Tutorial** | ₺4.99 | Kurulumu atla | Negligible |

**Expected ARPU (Ortalama Kâr/Kullanıcı):** ₺8-15/month

### 4.2 Reklam Sistemi

- **Rewarded Ads (Ödüllü):** 
  - "+20 energy" / "+10 intelligence" → oyuncu seçmeli
  - Frekans: Günde max 5
  - Expected CPM: $2-4 (Türkiye)
  
- **Interstitial Ads (Aralı):**
  - Game over → main menu geçişinde
  - Frekans: 1-2 per session
  
- **Placement:** (No banner ads - UX priority)

**Expected Ad Revenue:** $0.50-1.50/user/month

### 4.3 Revenue Projection (1 Yıl)

```
Scenario: 100K MAU, 30% DAU, 3% paying users

Ad Revenue: 100K × 30% × $1 = $30K/month = $360K/year
IAP Revenue: 100K × 3% × $12 ARPU = $36K/month = $432K/year

Total Potential: ~$800K/year (gross)
Deductions: 30% platform fee (Apple/Google), 50% ad network cut
Net Target: ~$280K/year

Investment: $50K (6-month dev + marketing)
Break-even: 3-4 ayda ulaşılabilir
```

---

## 5. Retention Mechanics

### 5.1 Tekrarlama Özendirme (Replayability)

- **Randomized Events:** Her oyunda %60 farklı event dizi
- **Multiple Endings:** 8+ kariyer bitişi (Doctor, Teacher, Artist, Criminal, CEO, etc.)
- **Choice Branches:** Her seçim 2-3 yeni event açabilir
- **Achievement System:** 
  - 50+ achievements (e.g., "Genius Doctor", "Self-Made Millionaire")
  - Leaderboard (highest money, best grades, longest marriage)

### 5.2 Sosyal Özellikleri

- **Share Endings:** "Benim Yazgım" paylaşılabilir özet (Twitter/Instagram)
- **Compare Stats:** Arkadaşlarla istatistik karşılaştırma
- **Challenge Mode:** "Sen daha iyi oyunabilir misin?" seçeneği
- **Friendship NPC Names:** Arkadaş adlarını NPC'ye dönüştürme

### 5.3 Seasonal Content

**Her 2 Hafta:**
- Yeni event seti (5-10 olay)
- Limited-time challenge ("Herkesin zengin olması imkansız mı?")
- Seasonal trait bonuses (yaz: spor bonus, kış: sağlık bonus)
- Battle Pass-style progression (free + premium track)

### 5.4 Daily/Weekly Loop

| Mekanik | Frekans | Ödül |
|---------|---------|------|
| **Daily Login** | Her gün | +5 energy |
| **Daily Challenge** | Her gün | +50 money + achievement |
| **Weekly Quest** | Pazartesi | +1 stat point (seçmeli) |
| **Leaderboard Reset** | Her Cumartesi | Top 10: special title |

### 5.5 Notification Strategy

- **Day 1-7:** Günde 1 push (off-peak saatinde)
- **Week 2+:** 2-3 push/hafta
- **Day 30+:** Düşük olan gün yeniden katılımı uyandırma

---

## 6. Success Metrics (KPIs)

### 6.1 Aquisition Metrics

| Metrik | Target (6 ay) | Yöntem |
|--------|---------------|--------|
| **Organic Downloads** | 150K | ASO, Reddit, local gaming forums |
| **Paid UA CAC** | ≤₺15 | TikTok, Instagram, Snapchat |
| **Influencer Downloads** | 50K | Turkish gaming streamers (100-500K followers) |
| **Total Downloads** | 200K+ | Tümü |

### 6.2 Engagement Metrics

| Metrik | Target | Açıklama |
|--------|--------|----------|
| **DAU/MAU** | 30%+ | Günlük aktif kullanıcı yüzdesi |
| **Session Length** | 45-60 min avg | Ortalama oturum süresi |
| **Session Frequency** | 1.5/day | Günde ortalama oturum sayısı |
| **Completion Rate** | 70%+ | Age 0-18 tamamlama yüzdesi |

### 6.3 Retention Metrics

| Metrik | Target | Yöntem |
|--------|--------|--------|
| **D1 (Day 1)** | 50%+ | Kurulumdan sonra 1 gün içinde dönüş |
| **D7 (Day 7)** | 35%+ | 7. gün hala oyun oynayan |
| **D30 (Day 30)** | 15%+ | 30. gün hala aktif |
| **LTV (Life Time Value)** | ₺50+ | Kullanıcı başına toplam gelir |

### 6.4 Monetization Metrics

| Metrik | Target | Formül |
|--------|--------|--------|
| **ARPU** | ₺10/month | (Ad + IAP Revenue) / MAU |
| **ARPPU** | ₺300+ | Revenue / Paying Users |
| **Conversion Rate** | 3-5% | Paying Users / DAU |
| **Payback Period** | <4 ay | CAC / Monthly ARPU |

### 6.5 Qualitative Metrics

- **App Store Rating:** 4.5+ yıldız (500+ review)
- **NPS (Net Promoter Score):** 50+
- **User Sentiment:** Social media pozitif comment yüzdesi

---

## 7. Competitive Analysis

### 7.1 BitLife vs. Yazgı

| Özellik | BitLife | Yazgı | Avantaj |
|---------|---------|-------|---------|
| **Dil** | İngilizce (+ 10 dil) | Türkçe | Yazgı |
| **Yaş Range** | 0-80+ | 0-18 | BitLife |
| **Event Volume** | 500+ | 150-200 | BitLife |
| **Customization** | Yüksek (cinsiyet, seksüelite) | Orta | BitLife |
| **Okul Sistemi** | Basit | Detaylı (ders seçim) | Yazgı |
| **Aile Sistemi** | Minimal | Rich (wealth/dynamic) | Yazgı |
| **Grafikleri** | Text + simple graphics | Pure text | BitLife |
| **Fiyat** | F2P (Heavy ads) | F2P + IAP | Yazgı |
| **Lokal Uyum** | Global focus | Türkiye fokus | Yazgı |
| **Çıkış Tarihi** | 2018 | 2026 | BitLife |

**Yazgı'nın Avantajları:**
- ✅ Türkçe ve kültürel uyum (ailenin dinamiği, okullar, işler)
- ✅ Daha detaylı okul/akademi sistemi
- ✅ Nüfuslu aile/NPC sistemi
- ✅ Enerji-based pacing (daha kısa oturum)
- ✅ Trend tabanlı monetizasyon

**BitLife'ın Avantajları:**
- ✅ 8 yıllık mevcut oyuncu tabanı
- ✅ 500+ event (vs. Yazgı'nın 150)
- ✅ Daha ileri customization
- ✅ Başlı başına oyun olarak kanıtlanmış

### 7.2 InstLife vs. Yazgı

| Özellik | InstLife | Yazgı | Avantaj |
|---------|----------|-------|---------|
| **Platform** | iOS/Web | React Native (iOS/Android/Web) | Yazgı |
| **Aktiviteler** | 20+ | 7 (+ Events) | InstLife |
| **Social Features** | Minimal | Öngörülen (achievement share) | Yazgı |
| **Monetization** | Premium only ($4.99) | F2P + IAP | Yazgı |
| **Event Sistem** | Statik | Dynamic + probabilistik | Yazgı |
| **Kariyerler** | 100+ | 15-20 | InstLife |

### 7.3 Market Position

**Yazgı = BitLife'ın Türkçe, daha akademik, kısa forma alternatifi**

```
Karmaşıklık
    ↑
    │        BitLife
    │        (Çok olay, detaylı)
    │
    │     Yazgı
    │  (Dengeli)
    │
    │     InstLife
    │  (Basit, sosyal)
    └───────────────────→ Türkçe Odaklanma
  
Yazgı'nın Niş: Türkçe konuşan, akademik harita tercih eden 16-30 yaş oyuncuları
```

---

## 8. 6-Month Roadmap

### Phase 1: Soft Launch (Ay 0-1)

**Hedefler:** Alpha testing, critical bug fixes, initial traction

**Deliverables:**
- ✅ Core game loop (HUB → EVENT → RESULT) tamamen çalışır
- ✅ 100+ unique events (early years, school years, teen years)
- ✅ 6 temel özellik (kalıtsal 6, edinilmiş 6)
- ✅ Okul sistemi ve rapor kartları
- ✅ Aile sistemi ve miras
- ✅ 3 save slot (no IAP yet)
- ✅ Temel reklam entegrasyonu (Unity Ads)

**Platform:** iOS Turkey App Store + Beta APK (Android testers)

**Marketing:**
- Reddit r/TurkishGaming, Discord sunucuları
- 5-10 Turkish gaming YouTuber (100K+ subs) → early access
- Local gaming forums (oyunciforum.net, etc.)

**Target Metrics:**
- 10K downloads
- 40% D1 retention
- 20% D7 retention
- 5 star rating

---

### Phase 2: Launch (Ay 1-2)

**Hedefler:** Full launch + monetization activation + content expansion

**Deliverables:**
- ✅ IAP system (premium traits, save slots, cosmetics)
- ✅ 150+ total events (+50 yeni)
- ✅ Achievement system (50 achievements)
- ✅ Leaderboard (money, grades, survival)
- ✅ Seasonal event #1 (Yeni Yıl Event Pack)
- ✅ UI/UX improvements basitleme
- ✅ Rewarded ad integration
- ✅ Analytics setup (Amplitude, Firebase)

**Marketing:**
- **Paid UA:** TikTok + Instagram ads (₺30K budget)
- **Influencer:** 20-30 Turkish streamers (500K-1M followers)
- **Press:** Gaming magazines (İndie Spotlight)
- **Organic:** Social media seeding (Instagram, Twitter, Discord)

**Target Metrics:**
- 100K downloads (Month 2)
- 35% D7 retention
- 12% D30 retention
- 2% conversion rate (IAP)
- $2-3K/day revenue (combined)

---

### Phase 3: Optimization (Ay 2-3)

**Hedefler:** Retention improvements, combat churn, feature polish

**Deliverables:**
- ✅ Daily/Weekly challenge system
- ✅ NPC relationship UI overhaul
- ✅ Event weight rebalancing (based on analytics)
- ✅ Romance branch expansion (new romance events)
- ✅ Skill tree visualization
- ✅ Battle Pass system (season 1)
- ✅ Bug fixes + performance optimization
- ✅ Deep linking (share endings → viral loop)

**Retention Focus:**
- Push notification A/B testing
- Day 7 challenge events (special reward)
- Implement seasonal rotation (every 2 weeks)

**Target Metrics:**
- 150K downloads
- 38% D7 retention (+3%)
- 18% D30 retention (+6%)
- 3.5% conversion rate
- 4.2+ app rating

---

### Phase 4: Expansion (Ay 3-4)

**Hedefler:** Cross-platform launch, new content verticals

**Deliverables:**
- ✅ Web version (vite + porting)
- ✅ 200+ total events
- ✅ 15+ career endings (detailed)
- ✅ Costume/cosmetic shop (avatar skins)
- ✅ Friendship NPC name import (invite friends)
- ✅ Gender/sexuality options (LGBTQ+ inclusion)
- ✅ Localization pass (accent-free, polish Turkish)
- ✅ Advanced analytics dashboard (internal)

**New Content:**
- Semester system (Spring, Fall events)
- Health crisis events (hospitalization, mental health)
- High school romance paths
- College admission branch (ending at 18)

**Target Metrics:**
- 200K downloads (300K if viral)
- 40% D7 retention
- 20% D30 retention
- 4-5% conversion rate (seasonal boost)
- ₺500K+ 4-month revenue

---

### Phase 5: Monetization Depth (Ay 4-5)

**Hedefler:** Revenue diversification, premium experience

**Deliverables:**
- ✅ Premium subscription (Monthly/Yearly)
- ✅ Cosmetics expansion (20+ item shop)
- ✅ Ad-free pass option
- ✅ Early access to seasonal content (subscriber-only)
- ✅ Subscription-only perks: +20% stat gains, daily bonus energy
- ✅ Battle Pass season 2
- ✅ Limited-time cosmetics (FOMO trigger)
- ✅ Referral program (₺50 referral reward)

**Community:**
- Official Discord server (1K+ members target)
- Reddit community management
- Fan art contest (monthly)
- Speedrun leaderboard (new category: "fastest to millionaire")

**Target Metrics:**
- 250K+ downloads
- 42% D7 retention
- 4-6% subscription conversion
- ₺100K+/month revenue (projected)
- 4.4+ rating maintained

---

### Phase 6: Polish & Future (Ay 5-6)

**Hedefler:** Game refinement, sustainable operations, next version planning

**Deliverables:**
- ✅ Performance optimization (load time < 3 sec)
- ✅ Accessibility improvements (dyslexia font, colorblind mode)
- ✅ Event refinement (playtest 50 events, rebalance)
- ✅ UI consistency pass
- ✅ Tutorial video (first-time experience)
- ✅ Monetization deep-dive analysis
- ✅ Community feedback integration
- ✅ "Yazgı 2.0" planning doc (next game + sequel ideas)

**Infrastructure:**
- Backend database (user progress, leaderboards)
- Cloud save system
- Anti-cheat (leaderboard validation)

**Post-Launch Plan:**
- Monthly content drops (10-15 events/month)
- Quarterly major updates (new feature)
- Community voting on next features
- Potential "Yazgı Universe" expansion (dating sim spinoff)

**Target Metrics:**
- 300K+ downloads (6-month mark)
- 35% D30 retention (sustainable)
- ₺1M+ 6-month gross revenue
- 4.5+ rating
- 50K+ DAU (target D30)

---

## 9. Risk Analysis & Mitigation

### Riskler

| Risk | Olasılık | Etki | Mitigation |
|------|----------|------|-----------|
| **Low D7 Retention** | Yüksek | Kayıp < $50K | Early A/B testing, daily challenges |
| **BitLife sebep rekabet** | Yüksek | Market genişlemesi yavaş | Lokalizasyon vurgusu, AI seeded events |
| **Ad CPM (Türkiye düşük)** | Orta | Revenue %30 azalması | Premium tier yükselişi, IAP focus |
| **Content dilution (500+ event)** | Düşük | Player confusion | Progressive unlock (age-locked events) |
| **Monetization backlash** | Düşük | Olumsuz reviews | F2P remains accessible, no P2W |

---

## 10. Appendices

### 10.1 Teknik Özellikler

- **Engine:** React Native (Expo) + TypeScript
- **Client:** iOS (React Native), Android (React Native), Web (React/Vite)
- **Backend (Future):** Node.js/Firebase (cloud save, leaderboards)
- **Database:** Firestore (user progress), Realtime DB (leaderboards)
- **Analytics:** Amplitude (event tracking), Firebase (crashes)
- **Ads:** Unity Ads (iOS/Android), AdSense (web)
- **IAP:** RevenueCat (cross-platform)

### 10.2 Sözlük

- **DAU:** Günlük Aktif Kullanıcı (Daily Active Users)
- **MAU:** Aylık Aktif Kullanıcı (Monthly Active Users)
- **D1/D7/D30:** 1., 7., 30. gün geri tutunma oranı
- **LTV:** Yaşam Boyu Değer (Life Time Value)
- **ARPU:** Kullanıcı Başına Ortalama Gelir (Average Revenue Per User)
- **CAC:** Kullanıcı Edinme Maliyeti (Customer Acquisition Cost)
- **IAP:** İçinde Satın Alma (In-App Purchase)
- **KPI:** Temel Performans Göstergesi (Key Performance Indicator)

### 10.3 Kaynaklar

- BitLife: https://www.bitlife.com
- InstLife: https://www.instlife.com
- Adjust Mobile Report 2025
- Sensor Tower: Turkish Mobile Gaming Market
- App Annie: Life Simulation Genre Trends

---

**Document Status:** Draft v1.0 - Ready for Stakeholder Review  
**Prepared by:** Game Design Team  
**Next Review:** Ay 1 Soft Launch sonrası

