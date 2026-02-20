import { GameEvent } from '../types';

const ADDITIONAL_LATE_TEEN_EVENTS: GameEvent[] = [
  {
    id: 'lt_exam_pomodoro_reset',
    text: 'Deneme haftasinda odagini toparlamak icin Pomodoro plani deniyorsun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 3,
    choices: [
      { text: 'Programa sadik kal', effect: { discipline: 3, intelligence: 2, energy: -8 }, stressEffect: -6, feedback: 'Ritmin oturdu.' },
      { text: 'Plani birak', effect: { energy: -4 }, stressEffect: 5, feedback: 'Odagin yine dagildi.' },
    ],
  },
  {
    id: 'lt_exam_group_revision',
    text: 'Arkadaslarla toplu tekrar oturumu teklif edildi.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 3,
    choices: [
      { text: 'Katil ve soru coz', effect: { intelligence: 3, charisma: 2, energy: -10 }, gradeUpdates: { math: 3, science: 3 }, stressEffect: -4, feedback: 'Takimla daha iyi ilerledin.' },
      { text: 'Evde tek calis', effect: { discipline: 2, energy: -8 }, stressEffect: 2, feedback: 'Yalniz calisma modunda kaldin.' },
    ],
  },
  {
    id: 'lt_exam_mock_recovery',
    text: 'Son deneme beklenenden kotu geldi, toparlanma zamani.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 4,
    choices: [
      { text: 'Hata analizi yap', effect: { intelligence: 4, discipline: 3, energy: -12 }, stressEffect: -3, feedback: 'Zayif alanlarini net gordun.' },
      { text: 'Sonucu gorme', effect: { energy: -2 }, stressEffect: 7, feedback: 'Kisa rahatlama uzun strese dondu.' },
    ],
  },
  {
    id: 'lt_exam_library_lockin',
    text: 'Kutuphane maratonu icin sessiz bir masa buldun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 3,
    choices: [
      { text: 'Iki saat kesintisiz calis', effect: { intelligence: 3, discipline: 3, energy: -12 }, gradeUpdates: { turkish: 3, language: 3 }, stressEffect: 2, feedback: 'Verimli bir seans oldu.' },
      { text: 'Erken cik', effect: { energy: 4 }, stressEffect: -2, feedback: 'Kendini fazla zorlamadin.' },
    ],
  },
  {
    id: 'lt_exam_sleep_tradeoff',
    text: 'Gece tekrar mi, erken uyku mu ikileminde kaldin.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 4,
    choices: [
      { text: 'Erken uyu', effect: { health: 3, energy: 10 }, stressEffect: -8, feedback: 'Dinlenmis bir zihinle kalktin.' },
      { text: 'Sabahla', effect: { intelligence: 2, health: -4, energy: -14 }, stressEffect: 10, feedback: 'Kisa kazanc, agir yorgunluk.' },
    ],
  },
  {
    id: 'lt_exam_parent_expectation',
    text: 'Ailenin beklentisi yuksek, baskiyi hissediyorsun.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 4,
    choices: [
      { text: 'Acikca konus', effect: { familyRelation: 4, charisma: 2, energy: -6 }, stressEffect: -7, feedback: 'Baski bir miktar azaldi.' },
      { text: 'Icinde tut', effect: { discipline: 2, energy: -5 }, stressEffect: 8, feedback: 'Disaridan sakin, iceriden gerginsin.' },
    ],
  },
  {
    id: 'lt_exam_focus_walk',
    text: 'Sinav oncesi odaklanmak icin kisa yuruyus dusunuyorsun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Yuruyus yap', effect: { health: 2, energy: -4 }, stressEffect: -9, feedback: 'Nefesin ve odagin duzeldi.' },
      { text: 'Masada kal', effect: { intelligence: 1, energy: -3 }, stressEffect: 3, feedback: 'Calistim ama zihnim dolu.' },
    ],
  },
  {
    id: 'lt_exam_last_week_plan',
    text: 'Sinava son bir hafta; planin da plani gerekiyor.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 4,
    choices: [
      { text: 'Gunluk hedef listesi yap', effect: { discipline: 4, intelligence: 3, energy: -10 }, stressEffect: -4, feedback: 'Kritik haftayi yonettin.' },
      { text: 'Rastgele ilerle', effect: { energy: -6 }, stressEffect: 6, feedback: 'Kafandaki daginiklik artti.' },
    ],
  },
  {
    id: 'lt_career_shadow_day',
    text: 'Bir gunlugune bir profesyoneli gozlemleme firsati buldun.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 2,
    choices: [
      { text: 'Tum gun takip et', effect: { intelligence: 2, discipline: 2, charisma: 1, energy: -8 }, skillUpdates: { work_ethic: 2 }, stressEffect: -2, feedback: 'Meslek gercegini yakindan gordun.' },
      { text: 'Yarida ayril', effect: { energy: 3 }, stressEffect: 1, feedback: 'Firsatin bir kismini kacirdin.' },
    ],
  },
  {
    id: 'lt_career_portfolio_push',
    text: 'Staj basvurusu icin kisa bir portfolyo hazirlaman gerekiyor.',
    minAge: 16, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Projeleri duzenle', effect: { intelligence: 3, discipline: 3, energy: -10 }, skillUpdates: { coding: 2, design: 2 }, stressEffect: 3, feedback: 'Basvuru dosyan guclendi.' },
      { text: 'Eski haliyle gonder', effect: { energy: -2 }, stressEffect: 4, feedback: 'Riskli bir tercih yaptin.' },
    ],
  },
  {
    id: 'lt_career_teacher_reference',
    text: 'Ogretmenden referans mektubu istemeyi dusunuyorsun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Kibarca talep et', effect: { charisma: 2, discipline: 2, energy: -5 }, stressEffect: -1, feedback: 'Guvencen artan bir adim oldu.' },
      { text: 'Vazgec', effect: { energy: 1 }, stressEffect: 2, feedback: 'Guvensizlik seni geri tuttu.' },
    ],
  },
  {
    id: 'lt_career_networking_event',
    text: 'Kampuste mini kariyer bulusmasi duzenlendi.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Uc kisiyle tanis', effect: { charisma: 3, intelligence: 2, energy: -8 }, skillUpdates: { teamwork: 2 }, stressEffect: 2, feedback: 'Yeni baglantilar kurdun.' },
      { text: 'Sadece dinle', effect: { intelligence: 1, energy: -4 }, stressEffect: -1, feedback: 'Pasif ama guvenli bir katilim oldu.' },
    ],
  },
  {
    id: 'lt_career_internship_rejection',
    text: 'Staj basvurundan red cevabi geldi.',
    minAge: 16, maxAge: 18, rarity: 'RARE', difficulty: 4,
    choices: [
      { text: 'Geri bildirim iste', effect: { discipline: 3, intelligence: 2, energy: -6 }, stressEffect: -2, feedback: 'Red cevabini derse cevirdin.' },
      { text: 'Tamamen birak', effect: { energy: -3 }, stressEffect: 8, feedback: 'Moralin epey dustu.' },
    ],
  },
  {
    id: 'lt_career_internship_offer',
    text: 'Kucuk bir ekipten yaz staji teklifi geldi.',
    minAge: 16, maxAge: 18, rarity: 'RARE', difficulty: 4,
    choices: [
      { text: 'Teklifi kabul et', effect: { money: 120, discipline: 3, intelligence: 2, energy: -12 }, skillUpdates: { work_ethic: 3 }, stressEffect: 4, feedback: 'Ilk profesyonel adimini attin.' },
      { text: 'Sinava odaklanmak icin ertele', effect: { discipline: 2, energy: -5 }, stressEffect: -1, feedback: 'Onceliklerini netlestirdin.' },
    ],
  },
  {
    id: 'lt_career_public_speaking',
    text: 'Sinifta meslek hedefinle ilgili kisa bir sunum yapacaksin.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 3,
    choices: [
      { text: 'Hazirlikla cik', effect: { charisma: 3, discipline: 2, energy: -7 }, stressEffect: 3, feedback: 'Kendini daha net ifade ettin.' },
      { text: 'Dogaclama git', effect: { charisma: 1, energy: -4 }, stressEffect: 5, feedback: 'Kurtardin ama zorlandin.' },
    ],
  },
  {
    id: 'lt_identity_value_map',
    text: 'Kendi degerlerini yazip hayatinla karsilastirmaya karar verdin.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Detayli liste yap', effect: { discipline: 2, intelligence: 2, energy: -4 }, stressEffect: -6, feedback: 'Icine dair daha net bir harita cikti.' },
      { text: 'Ertesi haftaya birak', effect: { energy: 1 }, stressEffect: 2, feedback: 'Soru isaretleri duruyor.' },
    ],
  },
  {
    id: 'lt_identity_new_hobby',
    text: 'Yeni bir hobinin seni degistirebilecegini hissediyorsun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Deneme dersine git', effect: { charisma: 2, intelligence: 1, energy: -5 }, skillUpdates: { art: 2 }, stressEffect: -4, feedback: 'Yeni bir tarafini kesfettin.' },
      { text: 'Konfor alaninda kal', effect: { energy: 2 }, stressEffect: 1, feedback: 'Guvenli ama durağan kaldin.' },
    ],
  },
  {
    id: 'lt_identity_role_conflict',
    text: 'Evdeki beklentilerle okuldaki hedeflerin cakisiyor.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Oncelik sirasi belirle', effect: { discipline: 3, familyRelation: 2, energy: -6 }, stressEffect: -5, feedback: 'Cakismayi yonetilebilir hale getirdin.' },
      { text: 'Her seyi ayni anda yap', effect: { energy: -10, health: -2 }, stressEffect: 9, feedback: 'Yuk birikti.' },
    ],
  },
  {
    id: 'lt_identity_journal_reflection',
    text: 'Aynaya bakarken yazdiklarinla yuzlesiyorsun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Acik yaz', effect: { discipline: 2, charisma: 1, energy: -3 }, skillUpdates: { writing: 2 }, stressEffect: -7, feedback: 'Yazmak icini rahatlatti.' },
      { text: 'Bos sayfa birak', effect: { energy: 1 }, stressEffect: 2, feedback: 'Konu yine ertelendi.' },
    ],
  },
  {
    id: 'lt_identity_social_mask',
    text: 'Kalabalikta farkli, yalnizken farkli hissetmeye basladin.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Guvendigin biriyle konus', effect: { charisma: 2, familyRelation: 2, energy: -4 }, stressEffect: -8, feedback: 'Maske biraz indi.' },
      { text: 'Her seyi icinde tut', effect: { energy: -3 }, stressEffect: 6, feedback: 'Yuk hafiflemedi.' },
    ],
  },
  {
    id: 'lt_identity_gap_year_talk',
    text: 'Mezuniyet sonrasi yolun icin farkli bir yil plani fikri dogdu.',
    minAge: 16, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Arastirip planla', effect: { intelligence: 2, discipline: 2, energy: -5 }, stressEffect: -3, feedback: 'Belirsizlik azaldi.' },
      { text: 'Fikri kapat', effect: { discipline: 1, energy: -2 }, stressEffect: 3, feedback: 'Karar ertelendi.' },
    ],
  },
  {
    id: 'lt_love_mixed_signals',
    text: 'Hoslandigin kisiden karisik sinyaller aliyorsun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 3,
    choices: [
      { text: 'Net bir soru sor', effect: { charisma: 3, energy: -4 }, stressEffect: 4, feedback: 'Belirsizlik yerine netlik geldi.' },
      { text: 'Sinyalleri yorumlamaya devam et', effect: { energy: -3 }, stressEffect: 6, feedback: 'Belirsizlik uzadi.' },
    ],
  },
  {
    id: 'lt_love_friend_advice',
    text: 'En yakin arkadasin iliski konusunda fikrini acikca soyluyor.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Tavsiyeyi dinle', effect: { charisma: 2, familyRelation: 1, energy: -3 }, stressEffect: -3, feedback: 'Dis gorus iyi geldi.' },
      { text: 'Kendi bildigini yap', effect: { discipline: 1, energy: -2 }, stressEffect: 2, feedback: 'Bagimsiz ama riskli bir secim.' },
    ],
  },
  {
    id: 'lt_love_boundary_talk',
    text: 'Iliskide sinirlar ve beklentiler konusulmasi gerekiyor.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Acilikla konus', effect: { charisma: 3, discipline: 1, energy: -5 }, stressEffect: -2, feedback: 'Daha saglikli bir denge kuruldu.' },
      { text: 'Konuyu gecistir', effect: { energy: -3 }, stressEffect: 5, feedback: 'Sorun ertelendi.' },
    ],
  },
  {
    id: 'lt_love_long_text_night',
    text: 'Gece uzun bir mesaj yazip yazmamak arasinda kaldin.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Mesaji sadelestir', effect: { charisma: 2, discipline: 1, energy: -2 }, stressEffect: -1, feedback: 'Kendini net anlattin.' },
      { text: 'Duyguyla gonder', effect: { charisma: 1, energy: -4 }, stressEffect: 4, feedback: 'Sonucu beklemek yordu.' },
    ],
  },
  {
    id: 'lt_love_reconciliation_attempt',
    text: 'Ayrilik sonrasi yeniden konusma teklifi geldi.',
    minAge: 15, maxAge: 18, rarity: 'RARE', difficulty: 4,
    choices: [
      { text: 'Sakin bir bulusma ayarla', effect: { charisma: 2, discipline: 2, energy: -5 }, stressEffect: -4, feedback: 'Durumu olgunlukla yonettin.' },
      { text: 'Hemen reddet', effect: { discipline: 1, energy: -1 }, stressEffect: 1, feedback: 'Kendi sinirlarini korudun.' },
    ],
  },
  {
    id: 'lt_love_new_crush',
    text: 'Uzun zaman sonra tekrar birine karsi heyecan hissettin.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Nazik bir selamla basla', effect: { charisma: 2, energy: -2 }, stressEffect: 2, feedback: 'Yeni bir sayfa aralandi.' },
      { text: 'Sadece uzaktan izle', effect: { energy: -1 }, stressEffect: 1, feedback: 'Temkinli kalmayi sectin.' },
    ],
  },
  {
    id: 'lt_family_budget_meeting',
    text: 'Aile butce toplantisinda soz hakki verildi.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Planli bir oneride bulun', effect: { familyRelation: 4, discipline: 2, intelligence: 1, energy: -4 }, stressEffect: -3, feedback: 'Fikrin ciddiye alindi.' },
      { text: 'Sessiz kal', effect: { energy: -1 }, stressEffect: 2, feedback: 'Katki firsatini kacirdin.' },
    ],
  },
  {
    id: 'lt_family_house_rules_reset',
    text: 'Ev kurallari mezuniyet yaklasirken yeniden yaziliyor.',
    minAge: 16, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Ortak kural seti olustur', effect: { familyRelation: 5, charisma: 2, discipline: 2, energy: -6 }, stressEffect: -4, feedback: 'Evde guven duygusu artti.' },
      { text: 'Tepki goster', effect: { familyRelation: -7, energy: -3 }, stressEffect: 7, feedback: 'Gerilim tirmandi.' },
    ],
  },
  {
    id: 'lt_family_uni_city_conflict',
    text: 'Universite sehri secimi ailede fikir ayriligi yaratti.',
    minAge: 16, maxAge: 18, rarity: 'UNCOMMON', difficulty: 4,
    choices: [
      { text: 'Veriyle anlat', effect: { intelligence: 2, familyRelation: 3, charisma: 2, energy: -6 }, stressEffect: -2, feedback: 'Kararin daha anlasilir oldu.' },
      { text: 'Inat et', effect: { familyRelation: -6, energy: -2 }, stressEffect: 6, feedback: 'Iletisim zorlasti.' },
    ],
  },
  {
    id: 'lt_family_responsibility_share',
    text: 'Evde sorumluluk paylasimi yeniden dagitiliyor.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Duzenli gorev al', effect: { discipline: 2, familyRelation: 3, energy: -5 }, stressEffect: -2, feedback: 'Ev icinde guven kazandin.' },
      { text: 'Surekli ertele', effect: { familyRelation: -4, energy: -1 }, stressEffect: 3, feedback: 'Guven kaybi basladi.' },
    ],
  },
  {
    id: 'lt_family_weekend_argument',
    text: 'Hafta sonu cikis planin yine tartismaya dondu.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 3,
    choices: [
      { text: 'Saat planiyla anlas', effect: { familyRelation: 3, charisma: 2, energy: -3 }, stressEffect: -3, feedback: 'Orta yol bulundu.' },
      { text: 'Ani cikis yap', effect: { familyRelation: -5, energy: -2 }, stressEffect: 5, feedback: 'Tansiyon yukseldi.' },
    ],
  },
  {
    id: 'lt_family_trust_rebuild',
    text: 'Gecmis bir tartismadan sonra guveni yeniden kurma sansi dogdu.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Tutarlilik goster', effect: { familyRelation: 5, discipline: 2, energy: -4 }, stressEffect: -5, feedback: 'Iliski toparlanmaya basladi.' },
      { text: 'Bosver', effect: { familyRelation: -3, energy: -1 }, stressEffect: 2, feedback: 'Mesafe korundu.' },
    ],
  },
  {
    id: 'lt_finance_first_salary_plan',
    text: 'Ilk duzenli kazancin icin 50/30/20 planini duydun.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 2,
    choices: [
      { text: 'Plani uygula', effect: { money: 160, discipline: 2, intelligence: 1, energy: -3 }, skillUpdates: { business: 2 }, stressEffect: -3, feedback: 'Parani daha kontrollu yonettin.' },
      { text: 'Plansiz harca', effect: { money: 70, energy: -1 }, stressEffect: 3, feedback: 'Ay sonu zorlasti.' },
    ],
  },
  {
    id: 'lt_finance_emergency_fund',
    text: 'Acil durum birikimi fikri aklina yatti.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Kenar para ayir', effect: { money: 90, discipline: 2, energy: -2 }, stressEffect: -4, feedback: 'Beklenmedik gunler icin guvencen artti.' },
      { text: 'Hepsini bugun kullan', effect: { money: 40, charisma: 1, energy: -1 }, stressEffect: 2, feedback: 'Anlik keyif secimi yaptin.' },
    ],
  },
  {
    id: 'lt_finance_impulse_buy',
    text: 'Indirimde gereksiz ama cazip bir urun gordun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: '24 saat bekle', effect: { discipline: 2, money: 20, energy: -1 }, stressEffect: -1, feedback: 'Durup dusunmek ise yaradi.' },
      { text: 'Hemen satin al', effect: { money: -80, charisma: 1, energy: -1 }, stressEffect: 2, feedback: 'Sonra pismanlik geldi.' },
    ],
  },
  {
    id: 'lt_finance_side_hustle_start',
    text: 'Kucuk bir yan gelir fikri: online tasarim/soru cozum destegi.',
    minAge: 16, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Deneme sureci baslat', effect: { money: 110, discipline: 2, energy: -8 }, skillUpdates: { business: 2, work_ethic: 2 }, stressEffect: 3, feedback: 'Ilk musterini buldun.' },
      { text: 'Risk alma', effect: { energy: 2 }, stressEffect: -1, feedback: 'Stabil kaldin.' },
    ],
  },
  {
    id: 'lt_finance_debt_from_friend',
    text: 'Bir arkadasin kucuk bir borc istedi.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Yazili planla ver', effect: { money: -40, charisma: 2, discipline: 1, energy: -1 }, stressEffect: 1, feedback: 'Sinirlarini koruyarak destek oldun.' },
      { text: 'Hayir de', effect: { discipline: 1, energy: 0 }, stressEffect: -1, feedback: 'Mali dengeni korudun.' },
    ],
  },
  {
    id: 'lt_finance_savings_goal',
    text: 'Kendine 3 aylik bir birikim hedefi koydun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Hedef takip cizelgesi yap', effect: { money: 100, discipline: 3, energy: -2 }, stressEffect: -2, feedback: 'Hedef gorunur hale geldi.' },
      { text: 'Aklinda tut yeter', effect: { money: 40, energy: -1 }, stressEffect: 2, feedback: 'Takip zorlasti.' },
    ],
  },
  {
    id: 'lt_finance_scholarship_search',
    text: 'Burs arama portallarinda uzun bir aksam gecirdin.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Basvurulari tamamla', effect: { intelligence: 2, discipline: 2, money: 80, energy: -6 }, stressEffect: -2, feedback: 'Maddi nefes aldiracak bir adim attin.' },
      { text: 'Yarim birak', effect: { energy: -2 }, stressEffect: 3, feedback: 'Firsat penceresi daraldi.' },
    ],
  },
  {
    id: 'lt_finance_micro_investment',
    text: 'Kucuk tutarli yatirim uygulamasi dikkatini cekti.',
    minAge: 16, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Temel bilgiyi ogrenip basla', effect: { intelligence: 2, money: 60, energy: -3 }, stressEffect: 1, feedback: 'Riski anlayarak adim attin.' },
      { text: 'Arastirmadan gir', effect: { money: -40, energy: -2 }, stressEffect: 5, feedback: 'Dalgalanma moralini bozdu.' },
    ],
  },
];

export const LATE_TEEN_EVENTS: GameEvent[] = [
  {
    id: 'lt_yks_trial_night',
    text: 'YKS deneme sonucu beklediginden dusuk geldi. Masada sessizce tekrar programi yapiyorsun.',
    minAge: 15,
    maxAge: 18,
    rarity: 'COMMON',
    difficulty: 4,
    choices: [
      {
        text: 'Eksik konulari planla',
        effect: { intelligence: 4, discipline: 4, energy: -14 },
        gradeUpdates: { math: 6, science: 4 },
        stressEffect: 8,
        feedback: 'Planli bir tekrar listesi cikardin.',
      },
      {
        text: 'Bugunu dinlenerek kapat',
        effect: { energy: 10 },
        stressEffect: -12,
        feedback: 'Kisa bir ara zihnini toplamana yardim etti.',
      },
    ],
  },
  {
    id: 'lt_lgs_mentor_offer',
    text: 'Mahalleden bir abi/abla LGS-YKS surecinde mentor olabilecegini soyluyor.',
    minAge: 15,
    maxAge: 17,
    rarity: 'UNCOMMON',
    difficulty: 3,
    choices: [
      {
        text: 'Mentorlugu kabul et',
        effect: { intelligence: 3, discipline: 3, charisma: 1, energy: -10 },
        gradeUpdates: { math: 4, turkish: 4 },
        stressEffect: -6,
        feedback: 'Dogru yonlendirme motivasyonunu arttirdi.',
      },
      {
        text: 'Kendi basima devam et',
        effect: { discipline: 2, energy: -8 },
        stressEffect: 4,
        feedback: 'Daha bagimsiz ama daha zor bir yol sectin.',
      },
    ],
  },
  {
    id: 'lt_first_internship_call',
    text: 'Bir startup staj gorusmesi icin seni aradi. Heyecanla not defterine sarildin.',
    minAge: 16,
    maxAge: 18,
    rarity: 'UNCOMMON',
    difficulty: 4,
    choices: [
      {
        text: 'Gorusmeye hazirlan',
        effect: { intelligence: 3, charisma: 3, discipline: 2, energy: -15 },
        skillUpdates: { coding: 4, work_ethic: 3 },
        stressEffect: 7,
        feedback: 'Gorusmede guclu bir ilk izlenim biraktin.',
      },
      {
        text: 'Ertelensin diye mesaj at',
        effect: { energy: 8 },
        stressEffect: -5,
        feedback: 'Kendine zaman kazandin ama firsat riske girdi.',
      },
    ],
  },
  {
    id: 'lt_identity_crisis_week',
    text: 'Herkes senden bir sey bekliyor. Sen ise ne istedigini bulmaya calisiyorsun.',
    minAge: 15,
    maxAge: 18,
    rarity: 'COMMON',
    difficulty: 3,
    choices: [
      {
        text: 'Gunluk yazarak dusuncelerini netlestir',
        effect: { discipline: 3, intelligence: 2, charisma: 1, energy: -8 },
        skillUpdates: { writing: 3 },
        stressEffect: -10,
        feedback: 'Yazarak kendini daha iyi anladin.',
      },
      {
        text: 'Sosyal medyada oyalan',
        effect: { energy: -6 },
        stressEffect: 6,
        feedback: 'Kisa sureli kacis iyi geldi ama sorular duruyor.',
      },
    ],
  },
  {
    id: 'lt_first_love_confession',
    text: 'Uzun suredir hoslandigin kisiye mesaj yazip silmekten yoruldun.',
    minAge: 15,
    maxAge: 18,
    rarity: 'UNCOMMON',
    difficulty: 3,
    choices: [
      {
        text: 'Duygularini acikca yaz',
        effect: { charisma: 4, discipline: 1, energy: -6 },
        stressEffect: 10,
        feedback: 'Cesur bir adim attin; sonucu ne olursa olsun buyudun.',
      },
      {
        text: 'Arkadas olarak kal',
        effect: { charisma: 1, discipline: 1, energy: -3 },
        stressEffect: -2,
        feedback: 'Durumu sakin sekilde yonettin.',
      },
    ],
  },
  {
    id: 'lt_first_heartbreak',
    text: 'Bir mesajla iliskinizin bittigini ogrendin. Odadaki sessizlik agirlasti.',
    minAge: 15,
    maxAge: 18,
    rarity: 'RARE',
    difficulty: 4,
    choices: [
      {
        text: 'Destek almak icin yakinina anlat',
        effect: { charisma: 2, familyRelation: 3, energy: -6 },
        stressEffect: -15,
        feedback: 'Paylasmak yukunu hafifletti.',
      },
      {
        text: 'Icinde tut ve derslere gomul',
        effect: { discipline: 4, intelligence: 2, energy: -14 },
        gradeUpdates: { language: 3, math: 3 },
        stressEffect: 14,
        feedback: 'Disaridan guclusun ama iceride yoruldun.',
      },
    ],
  },
  {
    id: 'lt_family_independence_argument',
    text: 'Ailen eve donus saatini kisitliyor, sen ise daha fazla ozgurluk istiyorsun.',
    minAge: 15,
    maxAge: 18,
    rarity: 'COMMON',
    difficulty: 3,
    choices: [
      {
        text: 'Sakin bir sekilde kurallari yeniden konus',
        effect: { familyRelation: 4, charisma: 2, discipline: 2, energy: -8 },
        stressEffect: -6,
        feedback: 'Gerilim azaldi ve ortak bir yol bulundu.',
      },
      {
        text: 'Kapini carpip cik',
        effect: { familyRelation: -10, charisma: 1, energy: -4 },
        stressEffect: 12,
        feedback: 'Anlik rahatlama oldu ama iliski zorlandi.',
      },
    ],
  },
  {
    id: 'lt_budgeting_first_income',
    text: 'Part-time isten ilk maasin yatti. Harcamak mi biriktirmek mi?',
    minAge: 15,
    maxAge: 18,
    rarity: 'COMMON',
    difficulty: 2,
    choices: [
      {
        text: 'Butce yapip bir kismini biriktir',
        effect: { money: 180, discipline: 3, intelligence: 2, energy: -8 },
        skillUpdates: { business: 4 },
        stressEffect: -4,
        feedback: 'Kontrollu harcama aliskanligi kazandin.',
      },
      {
        text: 'Tamamini kendine harca',
        effect: { money: 60, charisma: 2, energy: -3 },
        stressEffect: 3,
        feedback: 'Anlik keyif guzel ama ay sonu zor olabilir.',
      },
    ],
  },
  {
    id: 'lt_career_fair_day',
    text: 'Okulda kariyer gunu var. Standlar, insanlar ve bir suru secenek seni bekliyor.',
    minAge: 15,
    maxAge: 18,
    rarity: 'UNCOMMON',
    difficulty: 2,
    choices: [
      {
        text: 'Uc farkli bolumle detayli gorus',
        effect: { intelligence: 3, charisma: 2, discipline: 2, energy: -10 },
        skillUpdates: { teamwork: 2, work_ethic: 2 },
        stressEffect: -3,
        feedback: 'Secenekler kafanda daha net oturdu.',
      },
      {
        text: 'Sadece yakin arkadaslarla dolas',
        effect: { charisma: 1, energy: -5 },
        stressEffect: 1,
        feedback: 'Rahat bir gun oldu ama bilgi kazanimin sinirli kaldi.',
      },
    ],
  },
  {
    id: 'lt_exam_week_burnout_signal',
    text: 'Sinav haftasi ortasinda uykusuzluk ve dalginlik belirginlesmeye basladi.',
    minAge: 15,
    maxAge: 18,
    rarity: 'UNCOMMON',
    difficulty: 5,
    reqStress: { min: 35 },
    choices: [
      {
        text: 'Bugunu hafiflet, uyku ve mola koy',
        effect: { health: 4, energy: 12 },
        stressEffect: -18,
        feedback: 'Ritmi duzenleyince verim geri geldi.',
      },
      {
        text: 'Aynen devam et',
        effect: { discipline: 3, intelligence: 2, health: -6, energy: -18 },
        stressEffect: 16,
        feedback: 'Kisa vadede ilerledin ama bedeli agir oldu.',
      },
    ],
  },
  {
    id: 'lt_memory_echo_regret',
    text: (ctx) => {
      const regretMemory = ctx.memories
        .filter(memory => memory.emotion === 'REGRET')
        .sort((a, b) => b.turnTimestamp - a.turnTimestamp)[0];

      if (regretMemory) {
        return `${regretMemory.age} yasinda yaptigin o secim yine aklina geliyor. "Ayni hatayi tekrar etme" diye kendine fisltiyorsun.`;
      }

      return 'Bazi anilar sessizce geri gelir ve sana yon verir.';
    },
    minAge: 15,
    maxAge: 18,
    rarity: 'RARE',
    difficulty: 3,
    reqMemory: {
      emotion: 'REGRET',
      minWeight: 'MEDIUM',
    },
    choices: [
      {
        text: 'Bu kez daha bilincli davran',
        effect: { discipline: 3, intelligence: 2, energy: -8 },
        stressEffect: -6,
        feedback: 'Gecmisin dersini bugune tasidin.',
      },
      {
        text: 'Dusunmeyi ertele ve kac',
        effect: { energy: -5, charisma: 1 },
        stressEffect: 7,
        feedback: 'Anlik kacis iyi geldi ama konu kapanmadi.',
      },
    ],
  },
  ...ADDITIONAL_LATE_TEEN_EVENTS,

  // --- DALLANMA EVENT'LERİ ---

  // arc_exam_resilience Stage 2 - Stratejik dal (patience >= 55)
  {
    id: 'lt_exam_strategic_reset',
    text: 'Sinav haftasi yorucu ama sen sogukkanlisin. Planlama yaparak ilerlemen gerektigini biliyorsun.',
    minAge: 15,
    maxAge: 18,
    rarity: 'UNCOMMON',
    difficulty: 4,
    isRepeatable: false,
    personalityCategory: 'GROWTH',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'exam_strategic_schedule',
        text: 'Detayli bir calisma programi yap',
        effect: { intelligence: 10, discipline: 10, energy: -15 },
        personalityEffects: [
          { axis: 'patience', change: 5 },
        ],
        stressEffect: 10,
        feedback: 'Her konuya saat verdim, molalari planladim. Sistem calisiyor.',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
      {
        id: 'exam_strategic_focus',
        text: 'Sadece zayif konulara odaklan',
        effect: { intelligence: 8, discipline: 5 },
        personalityEffects: [
          { axis: 'patience', change: 3 },
        ],
        stressEffect: 5,
        feedback: 'Her seyi bilmek zorunda degilim. Acik konulari kapatmak yeterli.',
      },
    ],
  },

  // arc_career_launch Stage 2 - Girisimci dal (openness >= 60)
  {
    id: 'lt_career_startup_idea',
    text: 'Kariyer fuarindan sonra kafanda bir is fikri var. Staj yerine kendi projeni mi yapsan?',
    minAge: 16,
    maxAge: 18,
    rarity: 'UNCOMMON',
    difficulty: 4,
    isRepeatable: false,
    personalityCategory: 'GROWTH',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'startup_build',
        text: 'Projeye basla!',
        effect: { intelligence: 8, charisma: 10, discipline: 5, money: -100 },
        personalityEffects: [
          { axis: 'courage', change: 8 },
          { axis: 'openness', change: 5 },
        ],
        skillUpdates: { coding: 3, business: 5 },
        stressEffect: 20,
        feedback: 'Gece gunduz calisan bir girisimci oldun. Fikrin kucuk ama potansiyel buyuk.',
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
      },
      {
        id: 'startup_plan',
        text: 'Once is plani hazirla',
        effect: { intelligence: 10, discipline: 8 },
        personalityEffects: [
          { axis: 'patience', change: 5 },
        ],
        skillUpdates: { business: 3 },
        stressEffect: 10,
        feedback: 'Pazar arastirmasi, maliyet analizi... Hayal gercege donusuyor, adim adim.',
      },
    ],
  },

  // arc_first_love Stage 2 - Iliskiyi derinlestirme dali (empathy >= 60)
  {
    id: 'lt_first_love_deepening',
    text: 'Itiraf ettin ve karsilik gordun! Ama iliski yeni, kisisel sinirlar ve beklentiler hala belirsiz...',
    minAge: 15,
    maxAge: 18,
    rarity: 'UNCOMMON',
    difficulty: 3,
    isRepeatable: false,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'love_deep_communicate',
        text: 'Acik acik konusun',
        effect: { charisma: 8, familyRelation: 3 },
        personalityEffects: [
          { axis: 'empathy', change: 5 },
          { axis: 'openness', change: 3 },
        ],
        stressEffect: 10,
        feedback: 'Zor bir konusma ama iliskiniz daha saglikli bir zemine oturdu.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        id: 'love_deep_slow',
        text: 'Yavas yavas, acele etme',
        effect: { charisma: 5, discipline: 3 },
        personalityEffects: [
          { axis: 'patience', change: 5 },
        ],
        stressEffect: 0,
        feedback: 'Her seyin zamani var. Yavas ilerliyorsunuz ama saglam.',
      },
    ],
  },

  // arc_family_independence Stage 2 - Diplomatik dal (patience >= 55)
  {
    id: 'lt_family_calm_negotiation',
    text: 'Aile toplantisi var. Bu kez kavga yerine sakin bir sekilde fikirlerini sunmaya karar verdin.',
    minAge: 15,
    maxAge: 18,
    rarity: 'UNCOMMON',
    difficulty: 3,
    isRepeatable: false,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'family_calm_propose',
        text: 'Somut oneriler sun',
        effect: { charisma: 10, familyRelation: 8, discipline: 5 },
        personalityEffects: [
          { axis: 'patience', change: 5 },
          { axis: 'courage', change: 3 },
        ],
        stressEffect: 10,
        feedback: 'Sakin bir dille konustun. Ailen dinledi, bazi kurallari gevsetmeye razi oldu.',
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
      },
      {
        id: 'family_calm_listen',
        text: 'Once onlari dinle, sonra konus',
        effect: { familyRelation: 10, charisma: 5, discipline: 3 },
        personalityEffects: [
          { axis: 'empathy', change: 5 },
          { axis: 'patience', change: 3 },
        ],
        stressEffect: 0,
        feedback: 'Dinlemek zor ama etkili oldu. Karsilikli anlayis buyuyor.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
    ],
  },
];
