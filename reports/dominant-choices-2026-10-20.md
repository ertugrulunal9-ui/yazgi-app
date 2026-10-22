# Baskın seçenek raporu (2026-10-20)

Bu rapor yalnızca analizdir; `src/` ve `__tests__/` altında hiçbir dosya değiştirilmedi. Üreten betik: `scripts/content/dominant-choices-report.cjs` (bedel önerileri betiğin içindeki `SUGGESTIONS` tablosundadır). Yeniden üretmek için repo kökünden `node scripts/content/dominant-choices-report.cjs` çalıştırın.

## Oyuncuya etkisi

Baskın seçenekli bir olayda oyuncunun gerçek bir kararı yoktur: bir seçenek hiçbir istatistikte kaybetmeden diğerlerinden iyidir, oyuncu "doğru" olanı hemen bulur ve olay kartı bir karar anı olmaktan çıkıp ödül/ceza dağıtımına dönüşür. Bedelsiz (costless) olaylarda ise hiçbir seçenek bir şey kaybettirmez; seçimler arasındaki fark yalnızca ne kadar kazandığındır. Aşama 1 oynanış hedefi (seçimlerin anlamlı bir bedeli olması) için bu liste içerik turunun girdisidir.

## Tanımlar

- Vektör: `health`, `intelligence`, `charisma`, `discipline`, `money`, `familyRelation` (energy hariç) + 7. boyut `-stressEffect` (stres yükselmesi kötü sayılır).
- DOMINATED: bir A seçeneği, diğer her B seçeneğine karşı 7 boyutun hepsinde B'den küçük değil ve en az bir boyutta kesin büyük ise. "Tam baskın (strict)": A, diğer HER seçeneğe karşı en az bir boyutta kesin büyük (eşit vektörlü kardeş seçenek yok).
- COSTLESS: hiçbir seçeneğin 7 boyutta negatif değeri yok.
- Fonksiyon seçenekler `(ctx) => Choice` analiz dışı bırakıldı ve sayıldı. Bir olayda 2'den az statik seçenek kalıyorsa olay hiç değerlendirilmedi.
- Tablolardaki kısaltmalar: `hea` health, `int` intelligence, `cha` charisma, `dis` discipline, `mon` money, `fam` familyRelation, `str` yazarın girdiği `stressEffect` değeri (pozitif = stres artar = kötü, negatif = rahatlama). `[ene-5]` energy değeridir; vektöre girmez, bilgi içindir.
- Bir olay birden çok baskın seçenek içerirse (eşit vektörlü ikizler) marjı en büyük olan "baskın" olarak gösterilir. Yaş sütunu `minAge-maxAge`; rarity belirtilmemişse oyun `COMMON` sayar.

## 1. Özet

| Ölçü | Sayı | Oran |
|---|---:|---:|
| Havuzdaki toplam olay (`EVENTS`) | 470 | |
| Değerlendirilen olay (2+ statik seçenek) | 451 | 100% |
| Değerlendirilmeyen (2'den az statik seçenek) | 19 | |
| DOMINATED (baskın seçenek var) | 128 | 28.4% |
| - bunun "tam baskın (strict)" alt kümesi | 128 | 28.4% |
| - bunun 8 boyutta (energy dahil) da baskın olanı | 75 | 16.6% |
| - bunun baskın seçeneğinin energy'de bedeli olanı (7 boyutta baskın, energy'de ödünleşim var) | 53 | 11.8% |
| COSTLESS (hiçbir seçenekte negatif yok) | 101 | 22.4% |
| Hem DOMINATED hem COSTLESS | 39 | 8.6% |
| Atlanan fonksiyon seçenek (toplam) | 6 | |
| - fonksiyon seçeneği olan olay | 3 | |

Not: energy ödünleşimi olan 53 olay betiğin 7 boyutlu tanımına göre "baskın" sayılır ama oyuncu için gerçek bir bedel (energy) vardır; içerik turunda önceliği daha düşüktür (ama sıralama istendiği gibi yalnızca yaş ve rarity'ye göre yapıldı). Bedel önerilerinin çoğu betiğin saydığı 7 boyuttaki alanlara yazıldı; yalnızca `energy` ile çözülenler bölüm 3'te `[energy]` ile işaretli.

Fonksiyon seçeneği olan olaylar (3): `goal_chain_stage1_discovery` (0 statik + 2 fonksiyon, değerlendirilmedi), `goal_chain_stage2_first_competition` (0 statik + 2 fonksiyon, değerlendirilmedi), `goal_chain_stage3_grand_final` (0 statik + 2 fonksiyon, değerlendirilmedi).

### Kaynak dosyaya göre kırılım

Atıf, olay kimliğinin `src/data/*.ts` içinde `id: '...'` veya `EventBuilder('...')` olarak geçtiği ilk dosyaya göre yapıldı.

| Dosya | Olay | Dominated | % | Costless | % | İkisi birden |
|---|---:|---:|---:|---:|---:|---:|
| lateTeenEvents.ts | 56 | 32 | 57.1% | 0 | 0.0% | 0 |
| npcQuestlineEvents.ts | 27 | 20 | 74.1% | 10 | 37.0% | 6 |
| memoryGatedEvents.ts | 25 | 16 | 64.0% | 12 | 48.0% | 9 |
| earlyConsequenceEvents.ts | 48 | 15 | 31.3% | 39 | 81.3% | 11 |
| personalityEvents.ts | 32 | 9 | 28.1% | 9 | 28.1% | 5 |
| npcCheckInEvents.ts | 20 | 7 | 35.0% | 7 | 35.0% | 3 |
| cliffhangerEvents.ts | 8 | 6 | 75.0% | 2 | 25.0% | 1 |
| moralDilemmaEvents.ts | 44 | 5 | 11.4% | 0 | 0.0% | 0 |
| relationshipMilestoneEvents.ts | 11 | 5 | 45.5% | 3 | 27.3% | 1 |
| butterflyEffectEvents.ts | 10 | 3 | 30.0% | 4 | 40.0% | 1 |
| socialGroupEvents.ts | 4 | 3 | 75.0% | 3 | 75.0% | 2 |
| turkishEvents.ts | 62 | 2 | 3.2% | 2 | 3.2% | 0 |
| ageSpecificEvents.ts | 51 | 2 | 3.9% | 3 | 5.9% | 0 |
| npcEvents.ts | 19 | 2 | 10.5% | 4 | 21.1% | 0 |
| economicRecoveryEvents.ts | 6 | 1 | 16.7% | 1 | 16.7% | 0 |
| goalSpecificEvents.ts | 15 | 0 | 0.0% | 0 | 0.0% | 0 |
| familyArcEvents.ts | 13 | 0 | 0.0% | 2 | 15.4% | 0 |

### Gözlemler

- Baskın olayların 21 tanesinde (16.4%) kaybeden seçenek tamamen boştur (7 boyutta hep 0: "görmezden gel", "sessiz kal", "ertele" tipi pasif seçenek). Bu kalıpta oyuncu hiçbir şey kaybetmeden ödül alan seçeneği seçer; pasif seçeneğe küçük bir fayda vermek de çözüm olabilir, ama bu rapor yalnızca baskın seçeneğe bedel önerir.
- Baskın olayların 112 tanesinde (87.5%) baskın seçeneğin hiçbir negatif değeri yoktur (7 boyutta hiçbir şey kaybettirmez); bedel eklenecek seçenek çoğunlukla "doğru/iyi" seçenektir.
- Yaş kuşağına göre baskın olay sayısı (`minAge`): 0-5 yaş 6/55, 6-10 yaş 44/160, 11-14 yaş 32/134, 15-18 yaş 46/102.
- Yoğunlaşma: `lateTeenEvents.ts`, `npcQuestlineEvents.ts`, `memoryGatedEvents.ts` ve `cliffhangerEvents.ts` baskın oranı en yüksek dosyalardır; `earlyConsequenceEvents.ts` ise en çok bedelsiz (costless) olay içeren dosyadır. İçerik turunu dosya bazında yapmak bedel dilini tutarlı tutmaya yardım edebilir.

## 2. Öncelikli 40 baskın olay

Sıralama: önce düşük `minAge` (erken oyun etkisi), sonra `COMMON` < `UNCOMMON` < `RARE`, sonra baskınlık marjı (büyükten küçüğe), sonra kimlik. "Baskın" sütunu kazanan seçeneği, "Baskın olunan" sütunu ona karşı kesin kaybeden seçenekleri gösterir. Eşit vektörlü ikiz seçenek varsa "(eşit: ...)" ile belirtilir. `F` işareti: olayda atlanan fonksiyon seçenek var (analiz eksik olabilir). `G` işareti: baskın seçenek bir koşula (`reqStats`, `reqFamily`, `reqNPCRole` vb.) bağlı, yani her oyuncu görmeyebilir. `C` işareti: seçeneklerde `conditionalOutcomes` var (olasılıklı ek sonuçlar vektöre dahil değil). `K` işareti: olay aynı zamanda COSTLESS (bölüm 4b listesinde bu yüzden tekrar edilmez).

| # | Olay | Dosya | Yaş | Rarity | Baskın seçenek | Baskın olunan seçenek(ler) | Vektörler |
|---:|---|---|---|---|---|---|---|
| 1 | `tr_ilk_dogum_gunu`<br>G | ageSpecificEvents.ts | 3-6 | UNCOMMON | `dogum_paylas`: Olsun, pastadan ver | `dogum_uzul`: Neden getirmedi? | **dogum_paylas** cha+8 fam+3 str+5<br>dogum_uzul cha-3 str+10 |
| 2 | `mem_satisfaction_sharing`<br>K | memoryGatedEvents.ts | 3-6 | UNCOMMON | `share_yes`: Oyuncağını paylaş | `share_no`: Bu sefer paylaşma | **share_yes** cha+4<br>share_no (boş) |
| 3 | `mem_fear_overcome` | memoryGatedEvents.ts | 4-7 | UNCOMMON | `fear_face`: Korkuyla yüzleş | `fear_retreat`: Geri çekil | **fear_face** hea+3 str-8<br>fear_retreat str+3 |
| 4 | `mem_guilt_apology` | memoryGatedEvents.ts | 4-7 | UNCOMMON | `guilt_apologize`: Özür dile | `guilt_avoid`: Görmezden gel | **guilt_apologize** cha+5 str-5<br>guilt_avoid str+3 |
| 5 | `pers_uyku_saati`<br>G | personalityEvents.ts | 5-12 | COMMON | `uyku_yat`: Tamam anne, iyi geceler | `uyku_kac`: Gizlice oyun oyna<br>`uyku_pazarlik`: 10 dakika daha? | **uyku_yat** hea+10 fam+5 str-5 [ene+20]<br>uyku_kac hea-5 fam-5 str+5 [ene-10]<br>uyku_pazarlik fam-2 [ene+5] |
| 6 | `mem_regret_second_chance` | memoryGatedEvents.ts | 5-8 | UNCOMMON | `regret_fix`: Bu sefer doğrusunu yap | `regret_repeat`: Aynı şeyi yap | **regret_fix** cha+2 dis+4 str-3<br>regret_repeat str+5 |
| 7 | `dilemma_oyuncak_calma`<br>G | moralDilemmaEvents.ts | 6-10 | UNCOMMON | `oyuncak_birak`: Yerine koy, doğru olan bu | `oyuncak_al`: Cebine koy, kimse görmedi | **oyuncak_birak** dis+10 str+10<br>oyuncak_al cha-5 dis-15 str+15 |
| 8 | `milestone_friendship_lost` | relationshipMilestoneEvents.ts | 6-18 | UNCOMMON | `#1`: 🤷 Hayat böyle | `#0`: 😢 Üzül | **#1** dis+2 str+5<br>#0 hea-3 str+15 |
| 9 | `tr_sinav_gunu`<br>G | turkishEvents.ts | 7-18 | COMMON | `sinav_sakin`: Sakin ol ve yap | `sinav_panik`: Panik yap<br>`sinav_kopya`: Kopya çek | **sinav_sakin** int+5 dis+5 str+15<br>sinav_panik hea-5 int-5 str+25<br>sinav_kopya int-5 dis-15 str+30 |
| 10 | `pers_yeni_sinif`<br>G | personalityEvents.ts | 7-16 | UNCOMMON | `sinif_sosyal`: Herkesle tanış! | `sinif_cesur`: İlk sen merhaba de<br>`sinif_bekle`: Birinin sana gelmesini bekle | **sinif_sosyal** cha+15 str-5 [ene-25]<br>sinif_cesur cha+12 str+25 [ene-20]<br>sinif_bekle cha-5 str+15 |
| 11 | `mem_friendship_guilt_repair`<br>K | memoryGatedEvents.ts | 7-11 | UNCOMMON | `friend_repair`: Yanına git ve konuş | `friend_ignore`: Görmezden gel | **friend_repair** cha+5 str-4<br>friend_ignore (boş) |
| 12 | `mem_school_pride_challenge`<br>K | memoryGatedEvents.ts | 7-11 | UNCOMMON | `school_answer`: Parmağını kaldır | `school_silent`: Sessiz kal | **school_answer** int+4 cha+3<br>school_silent (boş) |
| 13 | `econ_poor_scholarship_offer` | economicRecoveryEvents.ts | 8-17 | UNCOMMON | `econ_scholarship_careful_apply`: Başvuruyu özenle hazırla | `econ_scholarship_last_minute`: Son gece acele bir dosya gönder | **econ_scholarship_careful_apply** int+3 dis+2 mon+120 fam+2 str+4 [ene-4]<br>econ_scholarship_last_minute int+1 dis-1 mon+65 str+9 [ene-2] |
| 14 | `cliff_family_news_reveal` | cliffhangerEvents.ts | 8-16 | UNCOMMON | `#0`: 🎉 "Harika! Abi/abla olacağım!" | `#1`: 😰 "Ya dikkat bana azalırsa?" | **#0** cha+10<br>#1 cha-3 |
| 15 | `npcq_friend_secret_share` | npcQuestlineEvents.ts | 8-18 | UNCOMMON | `#0`: 🤫 "Söz veriyorum, güvenebilirsin bana" | `#1`: 😬 "Bu çok ağır... başka birine de söylemeli misin?"<br>`#2`: 🙄 "Herkesin derdi var, çok büyütme" | **#0** cha+5<br>#1 (boş)<br>#2 cha-2 |
| 16 | `npcq_friend_family_visit`<br>K | npcQuestlineEvents.ts | 8-18 | UNCOMMON | `#0`: 😊 Ailesiyle sıcak bir sohbet kur | `#1`: 📱 Utanıyorum, telefonuma bakayım | **#0** cha+9<br>#1 (boş) |
| 17 | `mem_group_project_guilt`<br>K | memoryGatedEvents.ts | 8-12 | UNCOMMON | `group_lead`: Grubu yönet ve çalış | `group_slack`: Yine başkalarına bırak | **group_lead** int+3 cha+3 dis+2<br>group_slack (boş) |
| 18 | `npcq_friend_shared_crisis` | npcQuestlineEvents.ts | 8-18 | UNCOMMON | `#2`: 🕵️ Gizlice gerçeği araştır | `#0`: 🛡️ "Ben şahit oldum, yanlış anlıyorsunuz!"<br>`#1`: 😰 Karışma, uzak dur | **#2** int+2 cha+1<br>#0 cha+1<br>#1 cha-3 |
| 19 | `cliff_npc_secret_reveal` | cliffhangerEvents.ts | 8-18 | UNCOMMON | `#1`: 💪 "Uzak da olsak arkadaş kalırız" | `#0`: 😢 "Hayır... gitme" | **#1** cha+1<br>#0 cha-6 |
| 20 | `npcq_rival_aftermath` | npcQuestlineEvents.ts | 8-18 | UNCOMMON | `#0`: 🤝 Elini uzat: "İyi yarışmaydı ki" | `#1`: 😤 Yandan geçer gibi yap — hiçbir şey söyleme | **#0** cha+6<br>#1 cha-1 |
| 21 | `pers_balanced_new_student`<br>K | personalityEvents.ts | 8-13 | UNCOMMON | `new_student_approach`: Yanına git | `new_student_wait`: Bekle, o sana gelsin | **new_student_approach** cha+4<br>new_student_wait (boş) |
| 22 | `cliff_npc_secret_promise` | cliffhangerEvents.ts | 8-18 | UNCOMMON | `#0`: 🤔 "Tamam, merak ettim!" | `#1`: 😤 "Şimdi söyle, bekleyemem" | **#0** cha+2<br>#1 cha-1 |
| 23 | `cliff_family_announcement` | cliffhangerEvents.ts | 8-16 | UNCOMMON | `#1`: 😊 "Iyi haber mi?" | `#0`: 😰 "Ne oldu? Söyleyin..." | **#1** (boş)<br>#0 cha-2 |
| 24 | `npcq_rival_group_sides`<br>K | npcQuestlineEvents.ts | 8-18 | UNCOMMON | `#0`: 🤝 "Bu saçmalık, taraf falan yok" | `#1`: 💪 Kendi grubunu güçlendirmek için uğraş | **#0** cha+4<br>#1 cha+2 |
| 25 | `milestone_enemy_made` | relationshipMilestoneEvents.ts | 8-18 | RARE | `#1`: 💪 "Korkumuyorum!" | `#0`: 😰 Tedirgin ol | **#1** dis+3 str+10<br>#0 hea-3 str+15 |
| 26 | `npcq_rival_showdown` | npcQuestlineEvents.ts | 8-18 | RARE | `#1`: 🤝 Fair play — iyi bir yarışma olsun | `#0`: 🏆 Her şeyini ver — kazanmak için | **#1** cha+5<br>#0 hea-3 cha+3 |
| 27 | `tr_sir_saklama` | ageSpecificEvents.ts | 9-11 | COMMON | `sir_sakla`: Asla söylemem, söz verdim | `sir_soyle`: Söyle, o da arkadaşın sonuçta | **sir_sakla** cha+3 dis+5 str+5<br>sir_soyle cha-5 dis-5 str+10 |
| 28 | `npc_checkin_friend_study_02`<br>K | npcCheckInEvents.ts | 9-18 | COMMON | `#0`: Beraber çalışalım | `#1`: Notlarımı yollarım<br>`#2`: Vaktim yok de | **#0** int+2 dis+1<br>#1 int+1<br>#2 dis+1 |
| 29 | `early_toy_keep_boundaries_echo` | earlyConsequenceEvents.ts | 9-9 | UNCOMMON | `toy_keep_echo_boundary`: Önce sormasını sakin biçimde iste | `toy_keep_echo_grab`: Kalemleri elinden çekip al | **toy_keep_echo_boundary** cha+3 dis+3 str-3 [ene-3]<br>toy_keep_echo_grab cha-3 dis+1 str+4 |
| 30 | `mem_teacher_conflict_regret`<br>K | memoryGatedEvents.ts | 9-12 | UNCOMMON | `teacher_help`: Yardım et | `teacher_refuse`: Reddet | **teacher_help** cha+4 dis+2<br>teacher_refuse (boş) |
| 31 | `pers_balanced_mediator`<br>K | personalityEvents.ts | 9-14 | UNCOMMON | `balanced_mediate`: Arabulucu ol | `balanced_stay_out`: Karışma | **balanced_mediate** cha+5<br>balanced_stay_out (boş) |
| 32 | `pers_korkunc_film`<br>G | personalityEvents.ts | 10-16 | COMMON | `film_heyecan`: Tabii, korkulu filmler harika! | `film_izle`: İzle, korkma<br>`film_red`: Korku filmi izlemem | **film_heyecan** cha+10 str-10 [ene-15]<br>film_izle hea-5 cha+8 str+20<br>film_red cha-5 str-5 [ene+10] |
| 33 | `npc_checkin_friend_problem_03` | npcCheckInEvents.ts | 10-18 | COMMON | `#0`: Dinlemeyi teklif et | `#1`: Kısa bir moral mesajı gönder<br>`#2`: Konuyu değiştir | **#0** cha+2 fam+1 str-3<br>#1 cha+1<br>#2 str+4 |
| 34 | `social_group_best_friend_plan`<br>K | socialGroupEvents.ts | 10-18 | COMMON | `best_friend_create_group`: Ders grubu kur | `best_friend_postpone_group`: Fikri ertele | **best_friend_create_group** int+3 dis+2<br>best_friend_postpone_group (boş) [ene+2] |
| 35 | `tr_bayram_sabahi`<br>G | turkishEvents.ts | 10-18 | UNCOMMON | `bayram_social_butterfly`: Herkesi kucakla, sohbet et! | `bayram_full_respect`: Tüm büyüklerin elini öp (Zor - İçe kapanık için)<br>`bayram_minimal`: Sadece anne-babayı öp, köşede otur<br>`bayram_sleep`: Uyumaya devam et | **bayram_social_butterfly** cha+10 mon+150 fam+20 str-10 [ene-20]<br>bayram_full_respect cha+5 mon+100 fam+15 str+15<br>bayram_minimal mon+30 fam+5 str-5 [ene+10]<br>bayram_sleep fam-15 str+5 [ene+30] |
| 36 | `npc_group_exclusion` | npcEvents.ts | 10-18 | UNCOMMON | `#2`: 🚶 Yeni arkadaşlar edin | `#0`: 😢 Üzül ve evde ağla<br>`#1`: 🗣️ Arkadaşlarına sor | **#2** cha+3<br>#0 hea-3 str+20<br>#1 cha+2 |
| 37 | `npc_secret_revealed` | npcEvents.ts | 10-18 | UNCOMMON | `#1`: 🤷 "Abartma" de | `#0`: 😢 Özür dile ve açıkla | **#1** (boş)<br>#0 cha-2 str+15 |
| 38 | `npcq_rival_enemy` | npcQuestlineEvents.ts | 10-18 | UNCOMMON | `#0`: 🧘 Bırak — nefret seni tüketiyor | `#1`: 💀 "Bu bitmedi..." | **#0** hea+2 cha+3<br>#1 cha-5 |
| 39 | `butterfly_friend_farewell_silent_echo` | butterflyEffectEvents.ts | 10-10 | UNCOMMON | `friend_silent_echo_reach_out`: Ailesinden iletişim adresini iste | `friend_silent_echo_avoid`: Fotoğrafı yerine koy | **friend_silent_echo_reach_out** cha+3 dis+2 [ene-5]<br>friend_silent_echo_avoid cha-1 dis+1 str+4 |
| 40 | `pers_balanced_family_talk`<br>K | personalityEvents.ts | 10-16 | UNCOMMON | `family_honest_opinion`: Düşünceni açıkça söyle | `family_agree`: "Siz bilirsiniz" de | **family_honest_opinion** cha+3 fam+5<br>family_agree fam+2 |

`*` rarity alanı veride yok; oyun varsayılanı `COMMON` uygulanır.

## 3. Bedel önerileri (ilk 40 olay)

Her öneri, baskın seçeneğe eklenecek küçük bir bedeldir ve hikâye mantığını korumaya çalışır; hiçbir seçenek silinmez. Betik her öneriyi baskın seçeneğin vektörüne uygulayıp olayda artık hiçbir seçeneğin diğerlerine baskın olmadığını doğrular. Sonuç: 40/40 öneri baskınlığı kırıyor; bunların 34 tanesi 7 boyutlu bayrağı da kaldırıyor (`[7B]`), 6 tanesi yalnızca `energy` bedeli (`[energy]`): oyuncu için gerçek bir bedel, ama bu betiğin 7 boyutlu tanımı energy'yi saymadığı için olay yeniden çalıştırmada yine "dominated" görünür (energy dahil 8 boyutta baskınlık kırılmış olur).

Değerler yazarın girdiği ham sayıdır (`stressEffect +4` = stres 4 artar, kötü). Başlangıç istatistikleri düşüktür (health 25, charisma 5, intelligence/discipline/money 0) ve değerler 0'da kırpılır; bu yüzden küçük çocuk olaylarında `money`, `intelligence`, `discipline` bedelleri pratikte etkisiz kalır. Erken yaş olaylarında bu yüzden `stressEffect`, `health`, `familyRelation` ve `energy` tercih edildi.

1. `tr_ilk_dogum_gunu` / `dogum_paylas`: `health -2` [7B] - Herkese pasta dağıtırken sen de fazla yedin, karnın ağrıdı; paylaşmanın küçük bir bedeli olur.
2. `mem_satisfaction_sharing` / `share_yes`: `stressEffect +2` [7B] - Oyuncağı elinden bırakmak ilk anda içini burkar; paylaşma kolay bir iyilik olmaz.
3. `mem_fear_overcome` / `fear_face`: `energy -8` [energy] - Korkuyla yüzleşmek seni yorar; cesaretin enerji harcatması hikâyeye uyar.
4. `mem_guilt_apology` / `guilt_apologize`: `energy -5` [energy] - Özür dilemek için cesaret toplamak yorucudur.
5. `pers_uyku_saati` / `uyku_yat`: `charisma -2` [7B] - Erken yatınca arkadaşlarla oyun/sohbet saatini kaçırırsın; uslu olmanın sosyal bedeli.
6. `mem_regret_second_chance` / `regret_fix`: `energy -6` [energy] - Eski hatayı düzeltmek emek ister; doğru olanı yapmak ücretsiz değildir.
7. `dilemma_oyuncak_calma` / `oyuncak_birak`: `energy -5` [energy] - Cazibeye direnmek iradeni yorar; dürüst seçimin yükü hissedilir.
8. `milestone_friendship_lost` / `#1`: `charisma -2` [7B] - Umursamaz görünmek sosyal çevrede seni soğuk biri gibi gösterir ("içinde bir şey eksik" metniyle uyumlu).
9. `tr_sinav_gunu` / `sinav_sakin`: `energy -6` [energy] - Sakin kalıp sınavın boyunca odaklanmak zihinsel enerji harcar.
10. `pers_yeni_sinif` / `sinif_sosyal`: `discipline -3` [7B] - Gün boyu herkesle sohbet etmek ders odağını dağıtır.
11. `mem_friendship_guilt_repair` / `friend_repair`: `stressEffect +5` [7B] - Barışmak için yanına gitme anı gergindir; sonuç güzel ama ilk adım rahat değil.
12. `mem_school_pride_challenge` / `school_answer`: `stressEffect +3` [7B] - Parmak kaldırınca bütün sınıfın sana bakması heyecan ve gerginlik yaratır.
13. `econ_poor_scholarship_offer` / `econ_scholarship_careful_apply`: `health -2` [7B] - Özenli dosya için geceleri evrak hazırlarken uykusuz kalırsın; ödül büyük, bedeli sağlıkta.
14. `cliff_family_news_reveal` / `#0`: `stressEffect +4` [7B] - Abi/abla olma sorumluluğu ("büyük sorumluluk") sevinçle birlikte kaygı da getirir.
15. `npcq_friend_secret_share` / `#0`: `stressEffect +4` [7B] - Söz verdiğin sırrı taşımak seni geren bir yük olur.
16. `npcq_friend_family_visit` / `#0`: `stressEffect +3` [7B] - Arkadaşının ailesiyle ilk sohbet heyecanlı ve gergin bir sınavdır.
17. `mem_group_project_guilt` / `group_lead`: `stressEffect +5` [7B] - Grubun yükünü üstlenmek seni sorumluluk baskısı altında bırakır.
18. `npcq_friend_shared_crisis` / `#2`: `stressEffect +4` [7B] - Gizlice kanıt toplamak sinir bozucudur; yakalanma korkusu gerilim yaratır.
19. `cliff_npc_secret_reveal` / `#1`: `stressEffect +4` [7B] - Gülümseyerek vedalaşıp kendi üzüntünü bastırmak içeride gerilim bırakır.
20. `npcq_rival_aftermath` / `#0`: `stressEffect +3` [7B] - Rakibe elini uzatmak gurur yutmayı gerektirir.
21. `pers_balanced_new_student` / `new_student_approach`: `stressEffect +3` [7B] - Yabancıyla ilk konuşma kısa ama gergin bir andır.
22. `cliff_npc_secret_promise` / `#0`: `stressEffect +3` [7B] - Merakla bekleyip "yarın" cevabını kabullenmek ("merak içinde kaldın") gerginlik bırakır.
23. `cliff_family_announcement` / `#1`: `stressEffect +2` [7B] - Cevapsız kalan "iyi haber mi?" sorusu merak ve huzursuzluk yaratır.
24. `npcq_rival_group_sides` / `#0`: `stressEffect +3` [7B] - Tarafsız kalmak iki grubun da tepkisini göğüslemeyi gerektirir.
25. `milestone_enemy_made` / `#1`: `charisma -2` [7B] - Meydan okuyan tavır seni çatışmacı biri diye etiketletir.
26. `npcq_rival_showdown` / `#1`: `discipline -2` [7B] - Fair play seçince kazanma hırsındaki keskinlik biraz körelir (all-in seçeneğin karşılığı).
27. `tr_sir_saklama` / `sir_sakla`: `energy -6` [energy] - Diğer arkadaşın soruları karşısında sözünü tutmak sürekli direnç ve çaba ister.
28. `npc_checkin_friend_study_02` / `#0`: `stressEffect +2` [7B] - Ortak çalışma takvimi ve beklentisi küçük bir zaman baskısı getirir.
29. `early_toy_keep_boundaries_echo` / `toy_keep_echo_boundary`: `health -2` [7B] - Sakin kalmaya çalışırken içine atılan gerginlik karın ağrısı gibi bedene yansır (energy -3 bedeli zaten var).
30. `mem_teacher_conflict_regret` / `teacher_help`: `stressEffect +3` [7B] - Öğretmenle arayı düzeltmeye yaklaşmak ilk anda gergin bir adımdır.
31. `pers_balanced_mediator` / `balanced_mediate`: `stressEffect +4` [7B] - İki kavgalı arkadaşın arasında kalmak insanı geren bir iştir.
32. `pers_korkunc_film` / `film_heyecan`: `discipline -3` [7B] - Film maratonu uyku ve ders düzenini bozar; eğlencenin bedeli düzen kaybı.
33. `npc_checkin_friend_problem_03` / `#0`: `familyRelation -2` [7B] - Uzun dinleme yüzünden eve geç kalırsın, ailen sitem eder.
34. `social_group_best_friend_plan` / `best_friend_create_group`: `stressEffect +3` [7B] - Ders grubunu kurmak plan ve sorumluluk yükü getirir (ertelemenin energy +2 avantajı zaten var).
35. `tr_bayram_sabahi` / `bayram_social_butterfly`: `health -3` [7B] - Bütün gün şeker, baklava ve ikram yemek midene dokunur (energy -20 bedeli zaten var).
36. `npc_group_exclusion` / `#2`: `money -10` [7B] - Yeni gruba girmek için kantinde ısmarlayıp çevreye uymaya çalışırsın.
37. `npc_secret_revealed` / `#1`: `charisma -4` [7B] - Umursamaz tavır ("arkadaşlığı bitirdi") sınıfta güvenilmez biri olarak anılmana yol açar.
38. `npcq_rival_enemy` / `#0`: `stressEffect +3` [7B] - Öfkeyi bırakmak gururu yutmayı gerektirir, kolay bir karar değildir.
39. `butterfly_friend_farewell_silent_echo` / `friend_silent_echo_reach_out`: `stressEffect +5` [7B] - Yıllar sonra ilk adımı atmak cesaret ister; mesajı gönderene kadar içini yer (energy -5 zaten var).
40. `pers_balanced_family_talk` / `family_honest_opinion`: `stressEffect +3` [7B] - Açıkça fikrini söylemek, aileyle gerginlik riskini göze almaktır.

## 4. Tam liste (ilk 40 dışında kalanlar)

### 4a. Diğer DOMINATED olaylar (88)

**lateTeenEvents.ts** (32): `lt_lgs_mentor_offer`, `lt_identity_crisis_week`, `lt_family_independence_argument`, `lt_career_fair_day`, `lt_exam_pomodoro_reset`, `lt_exam_mock_recovery`, `lt_exam_last_week_plan`, `lt_career_shadow_day`, `lt_career_portfolio_push`, `lt_career_teacher_reference`, `lt_career_internship_rejection`, `lt_career_public_speaking`, `lt_identity_value_map`, `lt_identity_new_hobby`, `lt_identity_role_conflict`, `lt_identity_journal_reflection`, `lt_identity_social_mask`, `lt_identity_gap_year_talk`, `lt_love_mixed_signals`, `lt_love_boundary_talk`, `lt_love_long_text_night`, `lt_love_reconciliation_attempt`, `lt_family_budget_meeting`, `lt_family_house_rules_reset`, `lt_family_uni_city_conflict`, `lt_family_responsibility_share`, `lt_family_weekend_argument`, `lt_family_trust_rebuild`, `lt_finance_first_salary_plan`, `lt_finance_savings_goal`, `lt_finance_scholarship_search`, `lt_finance_micro_investment`

**earlyConsequenceEvents.ts** (14): `early_window_hide_accountability_echo`, `social_media_presence_echo`, `social_media_secret_echo`, `school_project_leadership_echo`, `school_project_report_echo`, `exclusion_stand_echo`, `middle_school_prepare_echo`, `hobby_sport_echo`, `hobby_art_echo`, `bullying_witness_intervene_echo`, `bullying_witness_ignore_echo`, `phone_conflict_echo`, `teacher_unfair_voice_echo`, `science_fair_patience_echo`

**npcQuestlineEvents.ts** (13): `npcq_friend_loyalty_test`, `npcq_friend_drift_apart`, `npcq_romance_first_spark`, `npcq_romance_jealousy_jealous`, `npcq_romance_family_reaction`, `npcq_romance_mature_breakup`, `npcq_rival_peace_offer`, `npcq_rival_escalation`, `npcq_betray_first_doubt`, `npcq_betray_gossip_heard`, `npcq_betray_confrontation`, `npcq_betray_reaction_manipulative`, `npcq_betray_reaction_regret`

**memoryGatedEvents.ts** (8): `mem_regret_chain_moral`, `mem_betrayal_trust`, `mem_creative_expression`, `mem_family_conflict_growth`, `mem_regret_last_chance`, `mem_friendship_satisfaction_deep`, `mem_guilt_confession`, `mem_exam_stress_pride`

**npcCheckInEvents.ts** (5): `npc_checkin_crush_invite_01`, `npc_checkin_crush_signal_02`, `npc_checkin_crush_mixed_03`, `npc_checkin_partner_plan_02`, `npc_checkin_enemy_boundary_03`

**moralDilemmaEvents.ts** (4): `dilemma_bully_karma`, `dilemma_vazo_gercek`, `dilemma_dedikodu_sonuc`, `dilemma_loyalty_test`

**personalityEvents.ts** (3): `pers_balanced_leadership`, `pers_balanced_moral_gray`, `pers_balanced_conflict_resolve`

**relationshipMilestoneEvents.ts** (3): `milestone_first_crush_feelings`, `milestone_new_relationship`, `milestone_heartbreak`

**butterflyEffectEvents.ts** (2): `butterfly_post_divorce_adaptation`, `butterfly_school_change_embraced_echo`

**cliffhangerEvents.ts** (2): `cliff_fate_turning_point`, `cliff_mysterious_letter`

**socialGroupEvents.ts** (2): `social_group_internal_conflict`, `social_group_club_competition`

### 4b. COSTLESS olaylar (89; ilk 40 dışındakiler, DOMINATED olanlar dahil)

**earlyConsequenceEvents.ts** (39): `early_toy_share_cooperation_echo`, `early_night_fear_support_echo`, `early_night_fear_courage_echo`, `early_art_original_voice_echo`, `early_art_safe_pattern_echo`, `school_new_friend_reunion_echo`, `school_exam_pride_echo`, `school_exam_recovery_echo`, `social_media_boundary_echo`, `school_project_leadership_echo`, `school_project_report_echo`, `exclusion_stand_echo`, `exclusion_belong_echo`, `middle_school_open_echo`, `middle_school_fear_echo`, `middle_school_prepare_echo`, `hobby_music_echo`, `hobby_coding_echo`, `hobby_sport_echo`, `hobby_art_echo`, `friend_conflict_repair_echo`, `bullying_witness_intervene_echo`, `bullying_witness_report_echo`, `bullying_witness_ignore_echo`, `phone_wait_echo`, `phone_conflict_echo`, `phone_bargain_echo`, `study_pressure_plan_echo`, `study_pressure_cram_echo`, `study_pressure_together_echo`, `teacher_unfair_voice_echo`, `teacher_unfair_silence_echo`, `teacher_unfair_support_echo`, `body_change_questions_echo`, `body_change_avoid_echo`, `body_change_research_echo`, `science_fair_demo_echo`, `science_fair_patience_echo`, `science_fair_last_minute_echo`

**npcQuestlineEvents.ts** (8): `npcq_friend_loyalty_test`, `npcq_romance_first_date`, `npcq_romance_jealousy_loyal`, `npcq_rival_first_challenge`, `npcq_rival_peace_offer`, `npcq_betray_first_doubt`, `npcq_betray_investigation`, `npcq_betray_reaction_regret`

**memoryGatedEvents.ts** (7): `mem_pride_confidence`, `mem_honesty_reward`, `mem_betrayal_trust`, `mem_creative_expression`, `mem_career_pride_vision`, `mem_regret_last_chance`, `mem_friendship_satisfaction_deep`

**npcCheckInEvents.ts** (6): `npc_checkin_friend_game_04`, `npc_checkin_bestfriend_late_01`, `npc_checkin_bestfriend_memory_03`, `npc_checkin_crush_invite_01`, `npc_checkin_crush_signal_02`, `npc_checkin_rival_teamup_03`

**personalityEvents.ts** (6): `pers_balanced_allrounder`, `pers_balanced_leadership`, `pers_balanced_hobby_dilemma`, `pers_balanced_competition`, `pers_balanced_career_talk`, `pers_balanced_conflict_resolve`

**butterflyEffectEvents.ts** (4): `butterfly_friend_moving_away`, `butterfly_university_or_work`, `butterfly_friend_farewell_open_echo`, `butterfly_school_change_embraced_echo`

**npcEvents.ts** (4): `npc_new_classmate`, `npc_group_formation`, `npc_new_friend_opportunity`, `npc_friend_needs_help`

**ageSpecificEvents.ts** (3): `tr_milli_mac_cocuk`, `tr_hayali_arkadas`, `tr_yatmadan_hikaye`

**relationshipMilestoneEvents.ts** (3): `milestone_new_friendship`, `milestone_bff_promise`, `milestone_new_relationship`

**cliffhangerEvents.ts** (2): `cliff_mysterious_letter`, `cliff_letter_meetup`

**familyArcEvents.ts** (2): `fam_supportive_calm_foundation`, `fam_evo_strict_softening`

**socialGroupEvents.ts** (2): `social_group_popular_invite`, `social_group_club_competition`

**turkishEvents.ts** (2): `tr_ilk_kelime`, `tr_aile_yemegi`

**economicRecoveryEvents.ts** (1): `econ_poor_breakthrough_moment`

