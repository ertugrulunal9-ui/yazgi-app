import { GameEvent } from '../types';

const ADDITIONAL_LATE_TEEN_EVENTS: GameEvent[] = [
  {
    id: 'lt_exam_pomodoro_reset',
    tags: ['exam', 'study', 'school', 'sınav'],
    text: 'Deneme haftasında odağını toparlamak için Pomodoro planı deniyorsun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 3,
    choices: [
      { text: 'Programa sadık kal', effect: { discipline: 3, intelligence: 2, energy: -8 }, stressEffect: -6, feedback: 'Ritmin oturdu.' },
      { text: 'Planı bırak', effect: { energy: -4 }, stressEffect: 5, feedback: 'Odağın yine dağıldı.' },
    ],
  },
  {
    id: 'lt_exam_group_revision',
    tags: ['exam', 'study', 'school'],
    text: 'Arkadaşlarla toplu tekrar oturumu teklif edildi.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 3,
    choices: [
      { text: 'Katıl ve soru çöz', effect: { intelligence: 3, charisma: 2, energy: -10 }, gradeUpdates: { math: 3, science: 3 }, stressEffect: -4, feedback: 'Takımla daha iyi ilerledin.' },
      { text: 'Evde tek çalış', effect: { discipline: 2, energy: -8 }, stressEffect: 2, feedback: 'Yalnız çalışma modunda kaldın.' },
    ],
  },
  {
    id: 'lt_exam_mock_recovery',
    tags: ['exam', 'study', 'school', 'sınav'],
    text: 'Son deneme beklenenden kötü geldi, toparlanma zamanı.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 4,
    choices: [
      { text: 'Hata analizi yap', effect: { intelligence: 4, discipline: 3, energy: -12 }, stressEffect: -3, feedback: 'Zayıf alanlarını net gördün.' },
      { text: 'Sonucu görme', effect: { energy: -2 }, stressEffect: 7, feedback: 'Kısa rahatlama uzun strese döndü.' },
    ],
  },
  {
    id: 'lt_exam_library_lockin',
    tags: ['exam', 'study', 'library', 'school'],
    text: 'Kütüphane maratonu için sessiz bir masa buldun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 3,
    choices: [
      { text: 'İki saat kesintisiz çalış', effect: { intelligence: 3, discipline: 3, energy: -12 }, gradeUpdates: { turkish: 3, language: 3 }, stressEffect: 2, feedback: 'Verimli bir seans oldu.' },
      { text: 'Erken çık', effect: { energy: 4 }, stressEffect: -2, feedback: 'Kendini fazla zorlamadın.' },
    ],
  },
  {
    id: 'lt_exam_sleep_tradeoff',
    tags: ['exam', 'study', 'school'],
    text: 'Gece tekrar mı, erken uyku mu ikileminde kaldın.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 4,
    choices: [
      { text: 'Erken uyu', effect: { health: 3, energy: 10 }, stressEffect: -8, feedback: 'Dinlenmiş bir zihinle kalktın.' },
      { text: 'Sabahla', effect: { intelligence: 2, health: -4, energy: -14 }, stressEffect: 10, feedback: 'Kısa kazanç, ağır yorgunluk.' },
    ],
  },
  {
    id: 'lt_exam_parent_expectation',
    tags: ['exam', 'school', 'family'],
    text: 'Ailenin beklentisi yüksek, baskıyı hissediyorsun.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 4,
    choices: [
      { text: 'Açıkça konuş', effect: { familyRelation: 4, charisma: 2, energy: -6 }, stressEffect: -7, feedback: 'Baskı bir miktar azaldı.' },
      { text: 'İçinde tut', effect: { discipline: 2, energy: -5 }, stressEffect: 8, feedback: 'Dışarıdan sakin, içeriden gerginsin.' },
    ],
  },
  {
    id: 'lt_exam_focus_walk',
    tags: ['exam', 'study', 'school'],
    text: 'Sınav öncesi odaklanmak için kısa yürüyüş düşünüyorsun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Yürüyüş yap', effect: { health: 2, energy: -4 }, stressEffect: -9, feedback: 'Nefesin ve odağın düzeldi.' },
      { text: 'Masada kal', effect: { intelligence: 1, energy: -3 }, stressEffect: 3, feedback: 'Çalıştım ama zihnim dolu.' },
    ],
  },
  {
    id: 'lt_exam_last_week_plan',
    tags: ['exam', 'study', 'school', 'sınav'],
    text: 'Sınava son bir hafta; planın da planı gerekiyor.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 4,
    choices: [
      { text: 'Günlük hedef listesi yap', effect: { discipline: 4, intelligence: 3, energy: -10 }, stressEffect: -4, feedback: 'Kritik haftayı yönettin.' },
      { text: 'Rastgele ilerle', effect: { energy: -6 }, stressEffect: 6, feedback: 'Kafandaki dağınıklık arttı.' },
    ],
  },
  {
    id: 'lt_career_shadow_day',
    tags: ['work', 'business'],
    text: 'Bir günlüğüne bir profesyoneli gözlemleme fırsatı buldun.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 2,
    choices: [
      { text: 'Tüm gün takip et', effect: { intelligence: 2, discipline: 2, charisma: 1, energy: -8 }, skillUpdates: { work_ethic: 2 }, stressEffect: -2, feedback: 'Meslek gerçeğini yakından gördün.' },
      { text: 'Yarıda ayrıl', effect: { energy: 3 }, stressEffect: 1, feedback: 'Fırsatın bir kısmını kaçırdın.' },
    ],
  },
  {
    id: 'lt_career_portfolio_push',
    tags: ['work', 'business'],
    text: 'Staj başvurusu için kısa bir portfolyo hazırlaman gerekiyor.',
    minAge: 16, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Projeleri düzenle', effect: { intelligence: 3, discipline: 3, energy: -10 }, skillUpdates: { coding: 2, design: 2 }, stressEffect: 3, feedback: 'Başvuru dosyan güçlendi.' },
      { text: 'Eski haliyle gönder', effect: { energy: -2 }, stressEffect: 4, feedback: 'Riskli bir tercih yaptın.' },
    ],
  },
  {
    id: 'lt_career_teacher_reference',
    tags: ['work', 'school'],
    text: 'Öğretmenden referans mektubu istemeyi düşünüyorsun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Kibarca talep et', effect: { charisma: 2, discipline: 2, energy: -5 }, stressEffect: -1, feedback: 'Güvencen artan bir adım oldu.' },
      { text: 'Vazgeç', effect: { energy: 1 }, stressEffect: 2, feedback: 'Güvensizlik seni geri tuttu.' },
    ],
  },
  {
    id: 'lt_career_networking_event',
    tags: ['work', 'business', 'social'],
    text: 'Kampüste mini kariyer buluşması düzenlendi.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Üç kişiyle tanış', effect: { charisma: 3, intelligence: 2, energy: -8 }, skillUpdates: { teamwork: 2 }, stressEffect: 2, feedback: 'Yeni bağlantılar kurdun.' },
      { text: 'Sadece dinle', effect: { intelligence: 1, energy: -4 }, stressEffect: -1, feedback: 'Pasif ama güvenli bir katılım oldu.' },
    ],
  },
  {
    id: 'lt_career_internship_rejection',
    tags: ['work', 'business'],
    text: 'Staj başvurundan red cevabı geldi.',
    minAge: 16, maxAge: 18, rarity: 'RARE', difficulty: 4,
    choices: [
      { text: 'Geri bildirim iste', effect: { discipline: 3, intelligence: 2, energy: -6 }, stressEffect: -2, feedback: 'Red cevabını derse çevirdin.' },
      { text: 'Tamamen bırak', effect: { energy: -3 }, stressEffect: 8, feedback: 'Moralin epey düştü.' },
    ],
  },
  {
    id: 'lt_career_internship_offer',
    tags: ['work', 'business'],
    text: 'Küçük bir ekipten yaz stajı teklifi geldi.',
    minAge: 16, maxAge: 18, rarity: 'RARE', difficulty: 4,
    choices: [
      { text: 'Teklifi kabul et', effect: { money: 120, discipline: 3, intelligence: 2, energy: -12 }, skillUpdates: { work_ethic: 3 }, stressEffect: 4, feedback: 'İlk profesyonel adımını attın.' },
      { text: 'Sınava odaklanmak için ertele', effect: { discipline: 2, energy: -5 }, stressEffect: -1, feedback: 'Önceliklerini netleştirdin.' },
    ],
  },
  {
    id: 'lt_career_public_speaking',
    tags: ['work', 'business', 'social'],
    text: 'Sınıfta meslek hedefinle ilgili kısa bir sunum yapacaksın.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 3,
    choices: [
      { text: 'Hazırlıkla çık', effect: { charisma: 3, discipline: 2, energy: -7 }, stressEffect: 3, feedback: 'Kendini daha net ifade ettin.' },
      { text: 'Doğaçlama git', effect: { charisma: 1, energy: -4 }, stressEffect: 5, feedback: 'Kurtardın ama zorlandın.' },
    ],
  },
  {
    id: 'lt_identity_value_map',
    tags: ['growth', 'identity'],
    text: 'Kendi değerlerini yazıp hayatınla karşılaştırmaya karar verdin.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Detaylı liste yap', effect: { discipline: 2, intelligence: 2, energy: -4 }, stressEffect: -6, feedback: 'İçine dair daha net bir harita çıktı.' },
      { text: 'Ertesi haftaya bırak', effect: { energy: 1 }, stressEffect: 2, feedback: 'Soru işaretleri duruyor.' },
    ],
  },
  {
    id: 'lt_identity_new_hobby',
    tags: ['creative', 'art'],
    text: 'Yeni bir hobinin seni değiştirebileceğini hissediyorsun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Deneme dersine git', effect: { charisma: 2, intelligence: 1, energy: -5 }, skillUpdates: { art: 2 }, stressEffect: -4, feedback: 'Yeni bir tarafını keşfettin.' },
      { text: 'Konfor alanında kal', effect: { energy: 2 }, stressEffect: 1, feedback: 'Güvenli ama durağan kaldın.' },
    ],
  },
  {
    id: 'lt_identity_role_conflict',
    tags: ['social', 'growth'],
    text: 'Evdeki beklentilerle okuldaki hedeflerin çakışıyor.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Öncelik sırası belirle', effect: { discipline: 3, familyRelation: 2, energy: -6 }, stressEffect: -5, feedback: 'Çakışmayı yönetilebilir hale getirdin.' },
      { text: 'Her şeyi aynı anda yap', effect: { energy: -10, health: -2 }, stressEffect: 9, feedback: 'Yük birikti.' },
    ],
  },
  {
    id: 'lt_identity_journal_reflection',
    tags: ['creative', 'yaz'],
    text: 'Aynaya bakarken yazdıklarınla yüzleşiyorsun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Açık yaz', effect: { discipline: 2, charisma: 1, energy: -3 }, skillUpdates: { writing: 2 }, stressEffect: -7, feedback: 'Yazmak içini rahatlattı.' },
      { text: 'Boş sayfa bırak', effect: { energy: 1 }, stressEffect: 2, feedback: 'Konu yine ertelendi.' },
    ],
  },
  {
    id: 'lt_identity_social_mask',
    tags: ['social', 'group'],
    text: 'Kalabalıkta farklı, yalnızken farklı hissetmeye başladın.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Güvendiğin biriyle konuş', effect: { charisma: 2, familyRelation: 2, energy: -4 }, stressEffect: -8, feedback: 'Maske biraz indi.' },
      { text: 'Her şeyi içinde tut', effect: { energy: -3 }, stressEffect: 6, feedback: 'Yük hafiflemedi.' },
    ],
  },
  {
    id: 'lt_identity_gap_year_talk',
    tags: ['school', 'study'],
    text: 'Mezuniyet sonrası yolun için farklı bir yıl planı fikri doğdu.',
    minAge: 16, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Araştırıp planla', effect: { intelligence: 2, discipline: 2, energy: -5 }, stressEffect: -3, feedback: 'Belirsizlik azaldı.' },
      { text: 'Fikri kapat', effect: { discipline: 1, energy: -2 }, stressEffect: 3, feedback: 'Karar ertelendi.' },
    ],
  },
  {
    id: 'lt_love_mixed_signals',
    tags: ['social', 'love', 'relationship'],
    text: 'Hoşlandığın kişiden karışık sinyaller alıyorsun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 3,
    choices: [
      { text: 'Net bir soru sor', effect: { charisma: 3, energy: -4 }, stressEffect: 4, feedback: 'Belirsizlik yerine netlik geldi.' },
      { text: 'Sinyalleri yorumlamaya devam et', effect: { energy: -3 }, stressEffect: 6, feedback: 'Belirsizlik uzadı.' },
    ],
  },
  {
    id: 'lt_love_friend_advice',
    tags: ['social', 'love', 'friend'],
    text: 'En yakın arkadaşın ilişki konusunda fikrini açıkça söylüyor.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Tavsiyeyi dinle', effect: { charisma: 2, familyRelation: 1, energy: -3 }, stressEffect: -3, feedback: 'Dış görüş iyi geldi.' },
      { text: 'Kendi bildiğini yap', effect: { discipline: 1, energy: -2 }, stressEffect: 2, feedback: 'Bağımsız ama riskli bir seçim.' },
    ],
  },
  {
    id: 'lt_love_boundary_talk',
    tags: ['social', 'love', 'relationship'],
    text: 'İlişkide sınırlar ve beklentiler konuşulması gerekiyor.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Açıklıkla konuş', effect: { charisma: 3, discipline: 1, energy: -5 }, stressEffect: -2, feedback: 'Daha sağlıklı bir denge kuruldu.' },
      { text: 'Konuyu geçiştir', effect: { energy: -3 }, stressEffect: 5, feedback: 'Sorun ertelendi.' },
    ],
  },
  {
    id: 'lt_love_long_text_night',
    tags: ['social', 'love', 'relationship'],
    text: 'Gece uzun bir mesaj yazıp yazmamak arasında kaldın.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Mesajı sadeleştir', effect: { charisma: 2, discipline: 1, energy: -2 }, stressEffect: -1, feedback: 'Kendini net anlattın.' },
      { text: 'Duyguyla gönder', effect: { charisma: 1, energy: -4 }, stressEffect: 4, feedback: 'Sonucu beklemek yordu.' },
    ],
  },
  {
    id: 'lt_love_reconciliation_attempt',
    tags: ['social', 'love', 'relationship'],
    text: 'Ayrılık sonrası yeniden konuşma teklifi geldi.',
    minAge: 15, maxAge: 18, rarity: 'RARE', difficulty: 4,
    choices: [
      { text: 'Sakin bir buluşma ayarla', effect: { charisma: 2, discipline: 2, energy: -5 }, stressEffect: -4, feedback: 'Durumu olgunlukla yönettin.' },
      { text: 'Hemen reddet', effect: { discipline: 1, energy: -1 }, stressEffect: 1, feedback: 'Kendi sınırlarını korudun.' },
    ],
  },
  {
    id: 'lt_love_new_crush',
    tags: ['social', 'love', 'relationship'],
    text: 'Uzun zaman sonra tekrar birine karşı heyecan hissettin.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Nazik bir selamla başla', effect: { charisma: 2, energy: -2 }, stressEffect: 2, feedback: 'Yeni bir sayfa aralandı.' },
      { text: 'Sadece uzaktan izle', effect: { energy: -1 }, stressEffect: 1, feedback: 'Temkinli kalmayı seçtin.' },
    ],
  },
  {
    id: 'lt_family_budget_meeting',
    tags: ['family', 'money', 'finance'],
    text: 'Aile bütçe toplantısında söz hakkı verildi.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Planlı bir öneride bulun', effect: { familyRelation: 4, discipline: 2, intelligence: 1, energy: -4 }, stressEffect: -3, feedback: 'Fikrin ciddiye alındı.' },
      { text: 'Sessiz kal', effect: { energy: -1 }, stressEffect: 2, feedback: 'Katkı fırsatını kaçırdın.' },
    ],
  },
  {
    id: 'lt_family_house_rules_reset',
    tags: ['family', 'social'],
    text: 'Ev kuralları mezuniyet yaklaşırken yeniden yazılıyor.',
    minAge: 16, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Ortak kural seti oluştur', effect: { familyRelation: 5, charisma: 2, discipline: 2, energy: -6 }, stressEffect: -4, feedback: 'Evde güven duygusu arttı.' },
      { text: 'Tepki göster', effect: { familyRelation: -7, energy: -3 }, stressEffect: 7, feedback: 'Gerilim tırmandı.' },
    ],
  },
  {
    id: 'lt_family_uni_city_conflict',
    tags: ['family', 'school', 'study'],
    text: 'Üniversite şehri seçimi ailede fikir ayrılığı yarattı.',
    minAge: 16, maxAge: 18, rarity: 'UNCOMMON', difficulty: 4,
    choices: [
      { text: 'Veriyle anlat', effect: { intelligence: 2, familyRelation: 3, charisma: 2, energy: -6 }, stressEffect: -2, feedback: 'Kararın daha anlaşılır oldu.' },
      { text: 'İnat et', effect: { familyRelation: -6, energy: -2 }, stressEffect: 6, feedback: 'İletişim zorlaştı.' },
    ],
  },
  {
    id: 'lt_family_responsibility_share',
    tags: ['family', 'social'],
    text: 'Evde sorumluluk paylaşımı yeniden dağıtılıyor.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Düzenli görev al', effect: { discipline: 2, familyRelation: 3, energy: -5 }, stressEffect: -2, feedback: 'Ev içinde güven kazandın.' },
      { text: 'Sürekli ertele', effect: { familyRelation: -4, energy: -1 }, stressEffect: 3, feedback: 'Güven kaybı başladı.' },
    ],
  },
  {
    id: 'lt_family_weekend_argument',
    tags: ['family', 'social'],
    text: 'Hafta sonu çıkış planın yine tartışmaya döndü.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 3,
    choices: [
      { text: 'Saat planıyla anlaş', effect: { familyRelation: 3, charisma: 2, energy: -3 }, stressEffect: -3, feedback: 'Orta yol bulundu.' },
      { text: 'Ani çıkış yap', effect: { familyRelation: -5, energy: -2 }, stressEffect: 5, feedback: 'Tansiyon yükseldi.' },
    ],
  },
  {
    id: 'lt_family_trust_rebuild',
    tags: ['family', 'social'],
    text: 'Geçmiş bir tartışmadan sonra güveni yeniden kurma şansı doğdu.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Tutarlılık göster', effect: { familyRelation: 5, discipline: 2, energy: -4 }, stressEffect: -5, feedback: 'İlişki toparlanmaya başladı.' },
      { text: 'Boşver', effect: { familyRelation: -3, energy: -1 }, stressEffect: 2, feedback: 'Mesafe korundu.' },
    ],
  },
  {
    id: 'lt_finance_first_salary_plan',
    tags: ['money', 'work', 'finance'],
    text: 'İlk düzenli kazancın için 50/30/20 planını duydun.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 2,
    choices: [
      { text: 'Planı uygula', effect: { money: 160, discipline: 2, intelligence: 1, energy: -3 }, skillUpdates: { business: 2 }, stressEffect: -3, feedback: 'Paranı daha kontrollü yönettin.' },
      { text: 'Plansız harca', effect: { money: 70, energy: -1 }, stressEffect: 3, feedback: 'Ay sonu zorlaştı.' },
    ],
  },
  {
    id: 'lt_finance_emergency_fund',
    tags: ['money', 'finance'],
    text: 'Acil durum birikimi fikri aklına yattı.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Kenar para ayır', effect: { money: 90, discipline: 2, energy: -2 }, stressEffect: -4, feedback: 'Beklenmedik günler için güvencen arttı.' },
      { text: 'Hepsini bugün kullan', effect: { money: 40, charisma: 1, energy: -1 }, stressEffect: 2, feedback: 'Anlık keyif seçimi yaptın.' },
    ],
  },
  {
    id: 'lt_finance_impulse_buy',
    tags: ['money', 'finance'],
    text: 'İndirimde gereksiz ama cazip bir ürün gördün.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: '24 saat bekle', effect: { discipline: 2, money: 20, energy: -1 }, stressEffect: -1, feedback: 'Durup düşünmek işe yaradı.' },
      { text: 'Hemen satın al', effect: { money: -80, charisma: 1, energy: -1 }, stressEffect: 2, feedback: 'Sonra pişmanlık geldi.' },
    ],
  },
  {
    id: 'lt_finance_side_hustle_start',
    tags: ['money', 'work', 'business', 'startup'],
    text: 'Küçük bir yan gelir fikri: online tasarım/soru çözüm desteği.',
    minAge: 16, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Deneme süreci başlat', effect: { money: 110, discipline: 2, energy: -8 }, skillUpdates: { business: 2, work_ethic: 2 }, stressEffect: 3, feedback: 'İlk müşterini buldun.' },
      { text: 'Risk alma', effect: { energy: 2 }, stressEffect: -1, feedback: 'Stabil kaldin.' },
    ],
  },
  {
    id: 'lt_finance_debt_from_friend',
    tags: ['money', 'finance', 'friend'],
    text: 'Bir arkadaşın küçük bir borç istedi.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Yazılı planla ver', effect: { money: -40, charisma: 2, discipline: 1, energy: -1 }, stressEffect: 1, feedback: 'Sınırlarını koruyarak destek oldun.' },
      { text: 'Hayir de', effect: { discipline: 1, energy: 0 }, stressEffect: -1, feedback: 'Mali dengeni korudun.' },
    ],
  },
  {
    id: 'lt_finance_savings_goal',
    tags: ['money', 'finance'],
    text: 'Kendine 3 aylık bir birikim hedefi koydun.',
    minAge: 15, maxAge: 18, rarity: 'COMMON', difficulty: 2,
    choices: [
      { text: 'Hedef takip çizelgesi yap', effect: { money: 100, discipline: 3, energy: -2 }, stressEffect: -2, feedback: 'Hedef görünür hale geldi.' },
      { text: 'Aklinda tut yeter', effect: { money: 40, energy: -1 }, stressEffect: 2, feedback: 'Takip zorlasti.' },
    ],
  },
  {
    id: 'lt_finance_scholarship_search',
    tags: ['school', 'study', 'money'],
    text: 'Burs arama portallarında uzun bir akşam geçirdin.',
    minAge: 15, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Başvuruları tamamla', effect: { intelligence: 2, discipline: 2, money: 80, energy: -6 }, stressEffect: -2, feedback: 'Maddi nefes aldıracak bir adım attın.' },
      { text: 'Yarım bırak', effect: { energy: -2 }, stressEffect: 3, feedback: 'Fırsat penceresi daraldı.' },
    ],
  },
  {
    id: 'lt_finance_micro_investment',
    tags: ['money', 'finance', 'yatirim'],
    text: 'Küçük tutarlı yatırım uygulaması dikkatini çekti.',
    minAge: 16, maxAge: 18, rarity: 'UNCOMMON', difficulty: 3,
    choices: [
      { text: 'Temel bilgiyi öğrenip başla', effect: { intelligence: 2, money: 60, energy: -3 }, stressEffect: 1, feedback: 'Riski anlayarak adım attın.' },
      { text: 'Araştırmadan gir', effect: { money: -40, energy: -2 }, stressEffect: 5, feedback: 'Dalgalanma moralini bozdu.' },
    ],
  },
];

export const LATE_TEEN_EVENTS: GameEvent[] = [
  {
    id: 'lt_yks_trial_night',
    tags: ['exam', 'study', 'school', 'yks', 'sinav'],
    text: 'YKS deneme sonucu beklediğinden düşük geldi. Masada sessizce tekrar programı yapıyorsun.',
    minAge: 15,
    maxAge: 18,
    rarity: 'COMMON',
    difficulty: 4,
    choices: [
      {
        text: 'Eksik konuları planla',
        effect: { intelligence: 4, discipline: 4, energy: -14 },
        gradeUpdates: { math: 6, science: 4 },
        stressEffect: 8,
        feedback: 'Planlı bir tekrar listesi çıkardın.',
      },
      {
        text: 'Bugunu dinlenerek kapat',
        effect: { energy: 10 },
        stressEffect: -12,
        feedback: 'Kısa bir ara zihnini toplamana yardım etti.',
      },
    ],
  },
  {
    id: 'lt_lgs_mentor_offer',
    tags: ['exam', 'school', 'study'],
    text: 'Mahalleden bir abi/abla LGS-YKS sürecinde mentor olabileceğini söylüyor.',
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
    tags: ['work', 'business'],
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
    tags: ['social', 'growth'],
    text: 'Herkes senden bir şey bekliyor. Sen ise ne istediğini bulmaya çalışıyorsun.',
    minAge: 15,
    maxAge: 18,
    rarity: 'COMMON',
    difficulty: 3,
    choices: [
      {
        text: 'Günlük yazarak düşüncelerini netleştir',
        effect: { discipline: 3, intelligence: 2, charisma: 1, energy: -8 },
        skillUpdates: { writing: 3 },
        stressEffect: -10,
        feedback: 'Yazarak kendini daha iyi anladın.',
      },
      {
        text: 'Sosyal medyada oyalan',
        effect: { energy: -6 },
        stressEffect: 6,
        feedback: 'Kısa süreli kaçış iyi geldi ama sorular duruyor.',
      },
    ],
  },
  {
    id: 'lt_first_love_confession',
    tags: ['social', 'love', 'relationship'],
    text: 'Uzun süredir hoşlandığın kişiye mesaj yazıp silmekten yoruldun.',
    minAge: 15,
    maxAge: 18,
    rarity: 'UNCOMMON',
    difficulty: 3,
    choices: [
      {
        text: 'Duygularını açıkça yaz',
        effect: { charisma: 4, discipline: 1, energy: -6 },
        stressEffect: 10,
        feedback: 'Cesur bir adım attın; sonucu ne olursa olsun büyüdün.',
      },
      {
        text: 'Arkadaş olarak kal',
        effect: { charisma: 1, discipline: 1, energy: -3 },
        stressEffect: -2,
        feedback: 'Durumu sakin şekilde yönettin.',
      },
    ],
  },
  {
    id: 'lt_first_heartbreak',
    tags: ['social', 'love', 'relationship'],
    text: 'Bir mesajla ilişkinizin bittiğini öğrendin. Odadaki sessizlik ağırlaştı.',
    minAge: 15,
    maxAge: 18,
    rarity: 'RARE',
    difficulty: 4,
    choices: [
      {
        text: 'Destek almak için yakınına anlat',
        effect: { charisma: 2, familyRelation: 3, energy: -6 },
        stressEffect: -15,
        feedback: 'Paylaşmak yükünü hafifletti.',
      },
      {
        text: 'İçinde tut ve derslere gömül',
        effect: { discipline: 4, intelligence: 2, energy: -14 },
        gradeUpdates: { language: 3, math: 3 },
        stressEffect: 14,
        feedback: 'Dışarıdan güçlüsün ama içeride yoruldun.',
      },
    ],
  },
  {
    id: 'lt_family_independence_argument',
    tags: ['family', 'social'],
    text: 'Ailen eve dönüş saatini kısıtlıyor, sen ise daha fazla özgürlük istiyorsun.',
    minAge: 15,
    maxAge: 18,
    rarity: 'COMMON',
    difficulty: 3,
    choices: [
      {
        text: 'Sakin bir şekilde kuralları yeniden konuş',
        effect: { familyRelation: 4, charisma: 2, discipline: 2, energy: -8 },
        stressEffect: -6,
        feedback: 'Gerilim azaldı ve ortak bir yol bulundu.',
      },
      {
        text: 'Kapını çarpıp çık',
        effect: { familyRelation: -10, charisma: 1, energy: -4 },
        stressEffect: 12,
        feedback: 'Anlık rahatlama oldu ama ilişki zorlandı.',
      },
    ],
  },
  {
    id: 'lt_budgeting_first_income',
    tags: ['money', 'work', 'finance'],
    text: 'Part-time işten ilk maaşın yattı. Harcamak mı biriktirmek mi?',
    minAge: 15,
    maxAge: 18,
    rarity: 'COMMON',
    difficulty: 2,
    choices: [
      {
        text: 'Bütçe yapıp bir kısmını biriktir',
        effect: { money: 180, discipline: 3, intelligence: 2, energy: -8 },
        skillUpdates: { business: 4 },
        stressEffect: -4,
        feedback: 'Kontrollü harcama alışkanlığı kazandın.',
      },
      {
        text: 'Tamamını kendine harca',
        effect: { money: 60, charisma: 2, energy: -3 },
        stressEffect: 3,
        feedback: 'Anlık keyif güzel ama ay sonu zor olabilir.',
      },
    ],
  },
  {
    id: 'lt_career_fair_day',
    tags: ['work', 'business'],
    text: 'Okulda kariyer günü var. Standlar, insanlar ve bir sürü seçenek seni bekliyor.',
    minAge: 15,
    maxAge: 18,
    rarity: 'UNCOMMON',
    difficulty: 2,
    choices: [
      {
        text: 'Üç farklı bölümle detaylı görüş',
        effect: { intelligence: 3, charisma: 2, discipline: 2, energy: -10 },
        skillUpdates: { teamwork: 2, work_ethic: 2 },
        stressEffect: -3,
        feedback: 'Seçenekler kafanda daha net oturdu.',
      },
      {
        text: 'Sadece yakın arkadaşlarla dolaş',
        effect: { charisma: 1, energy: -5 },
        stressEffect: 1,
        feedback: 'Rahat bir gün oldu ama bilgi kazanımın sınırlı kaldı.',
      },
    ],
  },
  {
    id: 'lt_exam_week_burnout_signal',
    tags: ['exam', 'study', 'school', 'sinav'],
    text: 'Sınav haftası ortasında uykusuzluk ve dalgınlık belirginleşmeye başladı.',
    minAge: 15,
    maxAge: 18,
    rarity: 'UNCOMMON',
    difficulty: 5,
    reqStress: { min: 35 },
    choices: [
      {
        text: 'Bugünü hafiflet, uyku ve mola koy',
        effect: { health: 4, energy: 12 },
        stressEffect: -18,
        feedback: 'Ritmi düzenleyince verim geri geldi.',
      },
      {
        text: 'Aynen devam et',
        effect: { discipline: 3, intelligence: 2, health: -6, energy: -18 },
        stressEffect: 16,
        feedback: 'Kısa vadede ilerledin ama bedeli ağır oldu.',
      },
    ],
  },
  {
    id: 'lt_memory_echo_regret',
    tags: ['growth', 'social'],
    text: (ctx) => {
      const regretMemory = ctx.memories
        .filter(memory => memory.emotion === 'REGRET')
        .sort((a, b) => b.turnTimestamp - a.turnTimestamp)[0];

      if (regretMemory) {
        return `${regretMemory.age} yaşında yaptığın o seçim yine aklına geliyor. "Aynı hatayı tekrar etme" diye kendine fısıldıyorsun.`;
      }

      return 'Bazı anılar sessizce geri gelir ve sana yön verir.';
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
        text: 'Bu kez daha bilinçli davran',
        effect: { discipline: 3, intelligence: 2, energy: -8 },
        stressEffect: -6,
        feedback: 'Geçmişin dersini bugüne taşıdın.',
      },
      {
        text: 'Düşünmeyi ertele ve kaç',
        effect: { energy: -5, charisma: 1 },
        stressEffect: 7,
        feedback: 'Anlık kaçış iyi geldi ama konu kapanmadı.',
      },
    ],
  },
  ...ADDITIONAL_LATE_TEEN_EVENTS,

  // --- DALLANMA EVENT'LERİ ---

  // arc_exam_resilience Stage 2 - Stratejik dal (patience >= 55)
  {
    id: 'lt_exam_strategic_reset',
    tags: ['exam', 'study', 'school', 'sinav'],
    text: 'Sınav haftası yorucu ama sen soğukkanlısın. Planlama yaparak ilerlemenin gerektiğini biliyorsun.',
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
        text: 'Detaylı bir çalışma programı yap',
        effect: { intelligence: 10, discipline: 10, energy: -15 },
        personalityEffects: [
          { axis: 'patience', change: 5 },
        ],
        stressEffect: 10,
        feedback: 'Her konuya saat verdim, molaları planladım. Sistem çalışıyor.',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
      {
        id: 'exam_strategic_focus',
        text: 'Sadece zayıf konulara odaklan',
        effect: { intelligence: 8, discipline: 5 },
        personalityEffects: [
          { axis: 'patience', change: 3 },
        ],
        stressEffect: 5,
        feedback: 'Her şeyi bilmek zorunda değilim. Açık konuları kapatmak yeterli.',
      },
    ],
  },

  // arc_career_launch Stage 2 - Girisimci dal (openness >= 60)
  {
    id: 'lt_career_startup_idea',
    tags: ['work', 'business', 'startup'],
    text: 'Kariyer fuarından sonra kafanda bir iş fikri var. Staj yerine kendi projeni mi yapsam?',
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
        text: 'Projeye başla!',
        effect: { intelligence: 8, charisma: 10, discipline: 5, money: -100 },
        personalityEffects: [
          { axis: 'courage', change: 8 },
          { axis: 'openness', change: 5 },
        ],
        skillUpdates: { coding: 3, business: 5 },
        stressEffect: 20,
        feedback: 'Gece gündüz çalışan bir girişimci oldun. Fikrin küçük ama potansiyel büyük.',
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
      },
      {
        id: 'startup_plan',
        text: 'Önce iş planı hazırla',
        effect: { intelligence: 10, discipline: 8 },
        personalityEffects: [
          { axis: 'patience', change: 5 },
        ],
        skillUpdates: { business: 3 },
        stressEffect: 10,
        feedback: 'Pazar araştırması, maliyet analizi... Hayal gerçeğe dönüşüyor, adım adım.',
      },
    ],
  },

  // arc_first_love Stage 2 - Iliskiyi derinlestirme dali (empathy >= 60)
  {
    id: 'lt_first_love_deepening',
    tags: ['social', 'love', 'relationship'],
    text: 'İtiraf ettin ve karşılık gördün! Ama ilişki yeni, kişisel sınırlar ve beklentiler hâlâ belirsiz...',
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
        text: 'Açık açık konuşun',
        effect: { charisma: 8, familyRelation: 3 },
        personalityEffects: [
          { axis: 'empathy', change: 5 },
          { axis: 'openness', change: 3 },
        ],
        stressEffect: 10,
        feedback: 'Zor bir konuşma ama ilişkiniz daha sağlıklı bir zemine oturdu.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        id: 'love_deep_slow',
        text: 'Yavaş yavaş, acele etme',
        effect: { charisma: 5, discipline: 3 },
        personalityEffects: [
          { axis: 'patience', change: 5 },
        ],
        stressEffect: 0,
        feedback: 'Her şeyin zamanı var. Yavaş ilerliyorsunuz ama sağlam.',
      },
    ],
  },

  // arc_family_independence Stage 2 - Diplomatik dal (patience >= 55)
  {
    id: 'lt_family_calm_negotiation',
    tags: ['family', 'social'],
    text: 'Aile toplantısı var. Bu kez kavga yerine sakin bir şekilde fikirlerini sunmaya karar verdin.',
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
        text: 'Somut öneriler sun',
        effect: { charisma: 10, familyRelation: 8, discipline: 5 },
        personalityEffects: [
          { axis: 'patience', change: 5 },
          { axis: 'courage', change: 3 },
        ],
        stressEffect: 10,
        feedback: 'Sakin bir dille konuştun. Ailen dinledi, bazı kuralları gevşetmeye razı oldu.',
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
      },
      {
        id: 'family_calm_listen',
        text: 'Önce onları dinle, sonra konuş',
        effect: { familyRelation: 10, charisma: 5, discipline: 3 },
        personalityEffects: [
          { axis: 'empathy', change: 5 },
          { axis: 'patience', change: 3 },
        ],
        stressEffect: 0,
        feedback: 'Dinlemek zor ama etkili oldu. Karşılıklı anlayış büyüyor.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
    ],
  },
];
