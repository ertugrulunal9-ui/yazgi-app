import { GameEvent, EventContext, NPC, NPCRole } from '../types';

// =================================================================
// NPC SOSYAL EVENTLER
// Arkadaşlık, romantik ilişkiler, düşmanlık ve grup dinamikleri
// =================================================================

// Helper: Rastgele NPC seç
const getRandomNPC = (ctx: EventContext, role?: NPCRole): NPC | null => {
    const npcs = ctx.npcs || [];
    const filtered = role ? npcs.filter(n => n.role === role) : npcs;
    if (filtered.length === 0) return null;
    return filtered[Math.floor(Math.random() * filtered.length)];
};

// Helper: NPC ismi ile metin oluştur
const withNPCName = (text: string, npc: NPC | null, fallback: string = 'Birisi'): string => {
    return npc ? text.replace(/{name}/g, npc.name) : text.replace(/{name}/g, fallback);
};

export const NPC_EVENTS: GameEvent[] = [

    // =================================================================
    // ARKADAŞLIK EVENTLERİ
    // =================================================================

    {
        id: 'npc_new_classmate',
        tags: ['social', 'friend', 'npc', 'school'],
        text: (_ctx) => {
            const genderText = Math.random() > 0.5 ? 'bir erkek' : 'bir kız';
            return `Sınıfa yeni ${genderText} öğrenci geldi. Öğretmen onu senin yanına oturmasını söyledi. İlk izlenimin nasıl olacak?`;
        },
        minAge: 6,
        maxAge: 18,
        rarity: 'COMMON',
        isRepeatable: true,
        personalityCategory: 'SOCIAL',
        choices: [
            {
                text: '🤝 Kendimi tanıt ve sohbet et',
                effect: { charisma: 3 },
                feedback: 'Yeni arkadaşınla güzel bir sohbet yaptın. İlk adım atılmış oldu!',
                personalityEffects: [{ axis: 'openness', change: 3 }],
                npcRelationChange: 15,
            },
            {
                text: '📖 Sessizce ders çalışmaya devam et',
                effect: { intelligence: 2 },
                feedback: 'Derslere odaklandın ama yeni arkadaşlık fırsatını kaçırdın.',
                personalityEffects: [{ axis: 'openness', change: -2 }],
            },
            {
                text: '🙄 Onu görmezden gel',
                effect: { discipline: 1 },
                feedback: 'Kendi işine baktın. Belki sonra konuşursunuz.',
                personalityEffects: [{ axis: 'empathy', change: -3 }],
            },
        ],
    },

    {
        id: 'npc_homework_together',
        tags: ['study', 'school', 'friend', 'npc'],
        text: (ctx) => {
            const npc = getRandomNPC(ctx, 'FRIEND') || getRandomNPC(ctx, 'ACQUAINTANCE');
            return withNPCName('{name} senden ödev konusunda yardım istedi. "Şu matematik konusunu hiç anlamadım, bana anlatır mısın?"', npc);
        },
        minAge: 7,
        maxAge: 18,
        rarity: 'COMMON',
        isRepeatable: true,
        reqStats: { intelligence: 40 },
        choices: [
            {
                text: '📚 Sabırla anlat',
                effect: { intelligence: 2, charisma: 3 },
                feedback: 'Konuyu anlatırken sen de daha iyi öğrendin. Arkadaşın minnettar!',
                personalityEffects: [{ axis: 'patience', change: 3 }, { axis: 'empathy', change: 2 }],
                npcRelationChange: 10,
            },
            {
                text: '📝 Ödevini direkt yap',
                effect: { discipline: -3 },
                feedback: 'Ödevini yaptın ama bu onu tembelliğe alıştıracak...',
                npcRelationChange: 5,
                personalityEffects: [{ axis: 'conformity', change: -2 }],
            },
            {
                text: '🙅 "Vaktim yok" de',
                effect: { discipline: 2 },
                feedback: 'Kendi çalışmana odaklandın ama arkadaşın bozuldu.',
                npcRelationChange: -10,
                personalityEffects: [{ axis: 'empathy', change: -3 }],
            },
        ],
    },

    {
        id: 'npc_friend_fight',
        tags: ['social', 'friend', 'npc'],
        text: (ctx) => {
            const npc = getRandomNPC(ctx, 'FRIEND') || getRandomNPC(ctx, 'BEST_FRIEND');
            return withNPCName('{name} ile tartıştınız. Sebebi bile tam hatırlamıyorsun ama ikisini de çok kırdınız. Şimdi ne yapacaksın?', npc);
        },
        minAge: 8,
        maxAge: 18,
        rarity: 'UNCOMMON',
        personalityCategory: 'CONFLICT',
        choices: [
            {
                text: '🤝 Özür dile ve barış',
                effect: { charisma: 2 },
                feedback: 'Özür dilemek zor ama arkadaşlığınız daha da güçlendi.',
                personalityEffects: [{ axis: 'courage', change: 3 }, { axis: 'empathy', change: 3 }],
                npcRelationChange: 15,
                stressEffect: -10,
            },
            {
                text: '⏰ Biraz zaman ver',
                effect: {},
                feedback: 'Bazen mesafe yakınlaştırır. Birkaç gün sonra her şey normale döndü.',
                personalityEffects: [{ axis: 'patience', change: 3 }],
                npcRelationChange: -5,
            },
            {
                text: '😤 Haklı olduğunda ısrar et',
                effect: { discipline: 2 },
                feedback: 'Haklı olabilirsin ama inatçılık arkadaşlığa zarar verdi.',
                personalityEffects: [{ axis: 'conformity', change: -5 }],
                npcRelationChange: -20,
                stressEffect: 10,
            },
        ],
    },

    {
        id: 'npc_secret_sharing',
        tags: ['social', 'friend', 'npc'],
        text: (ctx) => {
            const npc = getRandomNPC(ctx, 'FRIEND') || getRandomNPC(ctx, 'BEST_FRIEND');
            return withNPCName('{name} sana bir sır verdi: "Bunu sadece sana söylüyorum, kimseye söyleme..." Başkalarına mı anlatacaksın?', npc);
        },
        minAge: 10,
        maxAge: 18,
        rarity: 'UNCOMMON',
        personalityCategory: 'MORAL',
        choices: [
            {
                text: '🤐 Sırrını sakla',
                effect: { discipline: 2 },
                feedback: 'Güvenilir bir arkadaş olduğunu kanıtladın.',
                personalityEffects: [{ axis: 'empathy', change: 5 }],
                npcRelationChange: 20,
                grantTraits: ['HONEST'],
            },
            {
                text: '👥 Sadece bir kişiye söyle',
                effect: { charisma: 1 },
                feedback: 'Bir kişi... iki kişi... ve sır yayıldı. Arkadaşın öğrenirse çok kırılacak.',
                personalityEffects: [{ axis: 'empathy', change: -5 }],
                npcRelationChange: -15,
                futureEvents: [
                    { trigger: 'TURNS', turnsLater: 3, eventId: 'npc_secret_revealed', priority: 'NORMAL' }
                ],
            },
            {
                text: '📢 Herkese anlat',
                effect: { charisma: -5 },
                feedback: 'Dedikodu kralı/kraliçesi oldun ama güven kalmadı.',
                personalityEffects: [{ axis: 'empathy', change: -10 }],
                npcRelationChange: -40,
                grantTraits: ['GOSSIPER'],
            },
        ],
    },

    {
        id: 'npc_secret_revealed',
        tags: ['social', 'friend', 'npc'],
        text: (ctx) => {
            const npc = getRandomNPC(ctx, 'FRIEND');
            return withNPCName('{name} senin sırrını yaydığını öğrendi. Yüzüne bile bakmıyor. "Sana nasıl güvendim?" diye bağırdı.', npc);
        },
        minAge: 10,
        maxAge: 18,
        rarity: 'UNCOMMON',
        personalityCategory: 'CONFLICT',
        choices: [
            {
                text: '😢 Özür dile ve açıkla',
                effect: { charisma: -2 },
                feedback: 'Özür diledin ama güven bir kere kırıldı. Zaman gerekecek.',
                npcRelationChange: 5,
                stressEffect: 15,
            },
            {
                text: '🤷 "Abartma" de',
                effect: {},
                feedback: 'Umursamaz tavrın arkadaşlığı bitirdi.',
                npcRelationChange: -30,
                personalityEffects: [{ axis: 'empathy', change: -5 }],
            },
        ],
    },

    {
        id: 'npc_group_formation',
        tags: ['social', 'group', 'npc'],
        text: (ctx) => {
            const friends = (ctx.npcs || []).filter(n => n.role === 'FRIEND' || n.role === 'BEST_FRIEND');
            if (friends.length < 2) {
                return 'Birkaç arkadaşın bir araya gelip takılmak istiyor. "Sürekli beraber takılsak mı? Bir grup kuralım!" diyorlar.';
            }
            return `${friends[0].name}, ${friends[1].name} ve sen bir araya gelip konuşuyorsunuz. "Sürekli beraber takılsak mı? Bir grup kuralım!" diyorlar.`;
        },
        minAge: 10,
        maxAge: 18,
        rarity: 'UNCOMMON',
        personalityCategory: 'SOCIAL',
        choices: [
            {
                text: '🎉 Harika fikir! Gruba katıl',
                effect: { charisma: 5 },
                feedback: 'Artık bir grubun var! Teneffüslerde hep berabersiniz.',
                personalityEffects: [{ axis: 'openness', change: 5 }],
                npcRelationChange: 15,
            },
            {
                text: '🤔 Düşüneyim biraz',
                effect: {},
                feedback: 'Acele etmedin ama belki fırsatı kaçırırsın.',
                personalityEffects: [{ axis: 'patience', change: 3 }],
            },
            {
                text: '🚶 Ben yalnız takılmayı tercih ederim',
                effect: { discipline: 2 },
                feedback: 'Bağımsız kalmayı seçtin. Bazıları bunu garip buldu.',
                personalityEffects: [{ axis: 'openness', change: -5 }],
                npcRelationChange: -10,
            },
        ],
    },

    // =================================================================
    // ROMANTİK İLİŞKİ EVENTLERİ
    // =================================================================

    {
        id: 'npc_first_crush',
        tags: ['social', 'love', 'relationship', 'npc'],
        text: (_ctx) => {
            const gender = Math.random() > 0.5;
            const name = gender ? 'Ayşe' : 'Mehmet';
            return `Sınıfta birini fark etmeye başladın. ${name}... O güldüğünde kalbinin hızlandığını hissediyorsun. Acaba o da farkında mı?`;
        },
        minAge: 12,
        maxAge: 18,
        rarity: 'UNCOMMON',
        personalityCategory: 'SOCIAL',
        choices: [
            {
                text: '💕 Yaklaşmaya çalış',
                effect: { charisma: 3 },
                feedback: 'Yanına yaklaştın ve "Merhaba" dedin. Kalbin çarpar ama gülümsedi!',
                personalityEffects: [{ axis: 'courage', change: 5 }],
                npcRelationChange: 10,
            },
            {
                text: '👀 Uzaktan izle',
                effect: {},
                feedback: 'Sadece bakakaldın... Cesaret edemedim ama belki başka zaman.',
                personalityEffects: [{ axis: 'courage', change: -3 }],
                stressEffect: 5,
            },
            {
                text: '📝 Mektup yaz',
                effect: { intelligence: 2 },
                feedback: 'Duygularını kağıda döktün. Vermeye cesaret edecek misin?',
                personalityEffects: [{ axis: 'patience', change: 3 }],
                futureEvents: [
                    { trigger: 'TURNS', turnsLater: 2, eventId: 'npc_love_letter_decision', priority: 'NORMAL' }
                ],
            },
        ],
    },

    {
        id: 'npc_love_letter_decision',
        tags: ['social', 'love', 'relationship', 'npc'],
        text: 'Yazdığın mektup çantanda bekliyor. Vermeye cesaret edecek misin yoksa yırtacak mısın?',
        minAge: 12,
        maxAge: 18,
        rarity: 'UNCOMMON',
        personalityCategory: 'SOCIAL',
        choices: [
            {
                text: '💌 Mektubu ver',
                effect: { charisma: 3 },
                feedback: 'Eli titreyerek mektubu uzattın. Gülümsedi ve "Teşekkürler, okuyacağım" dedi!',
                personalityEffects: [{ axis: 'courage', change: 10 }],
                npcRelationChange: 15,
                stressEffect: -10,
            },
            {
                text: '🗑️ Mektubu yırt',
                effect: { discipline: 2 },
                feedback: 'Mektubu yırttın. Bazı şeyler söylenmeden kalır...',
                personalityEffects: [{ axis: 'courage', change: -5 }],
                stressEffect: 5,
            },
        ],
    },

    {
        id: 'npc_confession',
        tags: ['social', 'love', 'relationship', 'npc'],
        text: (ctx) => {
            const npc = getRandomNPC(ctx, 'CRUSH');
            if (!npc) {
                return 'Hoşlandığın kişi teneffüste seni köşeye çekti. "Seninle konuşmam lazım..." diyor.';
            }
            return `${npc.name} teneffüste seni köşeye çekti. "Seninle konuşmam lazım..." diyor. Kalbin hızlandı.`;
        },
        minAge: 13,
        maxAge: 18,
        rarity: 'RARE',
        reqNPCRole: 'CRUSH',
        personalityCategory: 'SOCIAL',
        choices: [
            {
                text: '❤️ "Ben de senden hoşlanıyorum"',
                effect: { charisma: 5 },
                feedback: 'İkiniz de gülümsüyorsunuz. Artık bir çiftsiniz!',
                personalityEffects: [{ axis: 'courage', change: 5 }, { axis: 'openness', change: 5 }],
                npcRelationChange: 30,
                stressEffect: -20,
            },
            {
                text: '😰 "Bilmiyorum, düşünmem lazım"',
                effect: {},
                feedback: 'Panikledin ve kaçtın. Ama bu konuşma bitmedi...',
                personalityEffects: [{ axis: 'courage', change: -3 }],
                stressEffect: 10,
            },
            {
                text: '💔 "Sadece arkadaş olarak görüyorum"',
                effect: { discipline: 2 },
                feedback: 'Dürüst oldun ama karşı taraf çok üzüldü.',
                personalityEffects: [{ axis: 'empathy', change: 3 }, { axis: 'courage', change: 3 }],
                npcRelationChange: -20,
            },
        ],
    },

    {
        id: 'npc_jealousy',
        tags: ['social', 'love', 'relationship', 'npc'],
        text: (ctx) => {
            const partner = getRandomNPC(ctx, 'PARTNER') || getRandomNPC(ctx, 'CRUSH');
            if (!partner) {
                return 'Sevgilin başka biriyle çok fazla vakit geçiriyor. Seni kıskandırıyor mu?';
            }
            return `${partner.name}'ı başka biriyle gülerken gördün. İçinde bir kıskançlık hissi uyandı.`;
        },
        minAge: 13,
        maxAge: 18,
        rarity: 'UNCOMMON',
        personalityCategory: 'CONFLICT',
        choices: [
            {
                text: '😤 Kavga çıkar',
                effect: { charisma: -3 },
                feedback: 'Kıskançlık kontrolden çıktı. Büyük bir tartışma yaşandı.',
                personalityEffects: [{ axis: 'patience', change: -5 }],
                npcRelationChange: -20,
                stressEffect: 15,
            },
            {
                text: '🗣️ Sakin bir şekilde konuş',
                effect: { charisma: 3 },
                feedback: 'Duygularını ifade ettin ve karşı taraf anlayış gösterdi.',
                personalityEffects: [{ axis: 'courage', change: 3 }, { axis: 'patience', change: 3 }],
                npcRelationChange: 5,
            },
            {
                text: '🙈 Görmezden gel',
                effect: { discipline: 2 },
                feedback: 'Hiç tepki vermedin ama içinde bu kalacak mı?',
                personalityEffects: [{ axis: 'patience', change: 2 }],
                stressEffect: 10,
            },
        ],
    },

    {
        id: 'npc_breakup',
        tags: ['social', 'love', 'relationship', 'npc'],
        text: (ctx) => {
            const partner = getRandomNPC(ctx, 'PARTNER');
            if (!partner) {
                return 'Sevgilin seninle konuşmak istiyor. Yüzünden bir şeylerin yanlış gittiği belli...';
            }
            return `${partner.name} seni kenara çekti. "Seninle konuşmam lazım... Bence bu ilişki yürümüyor." diyor.`;
        },
        minAge: 13,
        maxAge: 18,
        rarity: 'RARE',
        reqNPCRole: 'PARTNER',
        personalityCategory: 'CONFLICT',
        choices: [
            {
                text: '😢 Kabul et ve ağla',
                effect: { charisma: -2 },
                feedback: 'Ayrılık acı verdi ama bazen yollar ayrılır.',
                personalityEffects: [{ axis: 'empathy', change: 3 }],
                npcRelationChange: -30,
                stressEffect: 25,
            },
            {
                text: '😠 "Ben de zaten bitirmek istiyordum"',
                effect: {},
                feedback: 'Gurur yapmak işe yaramaz ama en azından daha az incinmiş görünüyorsun.',
                personalityEffects: [{ axis: 'courage', change: -3 }],
                npcRelationChange: -40,
                stressEffect: 15,
            },
            {
                text: '🙏 "Bir şans daha ver"',
                effect: { charisma: 2 },
                feedback: 'Yalvardın ama karar verilmişti. Belki ileride yeniden...',
                personalityEffects: [{ axis: 'patience', change: 3 }],
                npcRelationChange: -20,
                stressEffect: 20,
            },
        ],
    },

    // =================================================================
    // DÜŞMANLIK EVENTLERİ
    // =================================================================

    {
        id: 'npc_bully_encounter',
        tags: ['social', 'npc', 'group'],
        text: 'Okulda bir grup seni köşeye sıkıştırdı. "Cep harçlığını ver yoksa..." diye tehdit ediyorlar.',
        minAge: 8,
        maxAge: 15,
        rarity: 'UNCOMMON',
        personalityCategory: 'CONFLICT',
        choices: [
            {
                text: '💪 Karşı koy',
                effect: { health: -5, discipline: 3 },
                feedback: 'Dayak yedin ama pes etmedin. Bir daha rahat rahat yaklaşamayacaklar.',
                personalityEffects: [{ axis: 'courage', change: 10 }, { axis: 'conformity', change: -5 }],
                stressEffect: 15,
            },
            {
                text: '💰 Parayı ver',
                effect: { money: -20 },
                feedback: 'Parayı verdin ve gittiler. Ama bu bitmedi...',
                personalityEffects: [{ axis: 'courage', change: -5 }],
                stressEffect: 20,
                futureEvents: [
                    { trigger: 'TURNS', turnsLater: 5, eventId: 'npc_bully_return', priority: 'NORMAL' }
                ],
            },
            {
                text: '🏃 Kaç',
                effect: { health: 2 },
                feedback: 'Hızlıca kaçtın! Ama okulda yüzün kalmadı.',
                personalityEffects: [{ axis: 'courage', change: -3 }],
                npcRelationChange: -10,
            },
            {
                text: '👨‍🏫 Öğretmene söyle',
                effect: { charisma: -2 },
                feedback: 'Öğretmen zorbaları cezalandırdı ama "gammazlama" damgası yedin.',
                personalityEffects: [{ axis: 'conformity', change: 5 }],
                stressEffect: 5,
            },
        ],
    },

    {
        id: 'npc_bully_return',
        tags: ['social', 'npc', 'group'],
        text: 'Zorbalar yine karşına çıktı. "Daha fazla para istiyoruz!" diyorlar. Bu sefer daha agresifler.',
        minAge: 8,
        maxAge: 15,
        rarity: 'UNCOMMON',
        personalityCategory: 'CONFLICT',
        choices: [
            {
                text: '💪 Bu sefer direniş!',
                effect: { health: -10, discipline: 5 },
                feedback: 'Sert bir kavga çıktı. Yaralandın ama onlar da. Bir daha gelmeyecekler.',
                personalityEffects: [{ axis: 'courage', change: 15 }],
                grantTraits: ['BRAVE'],
                stressEffect: 10,
            },
            {
                text: '👨‍👩‍👧 Ailene anlat',
                effect: { familyRelation: 5 },
                feedback: 'Ailen okula geldi ve ciddi bir toplantı yapıldı. Zorbalar uzaklaştırıldı.',
                personalityEffects: [{ axis: 'courage', change: 3 }],
                stressEffect: -10,
            },
        ],
    },

    {
        id: 'npc_rivalry_start',
        tags: ['social', 'npc', 'group'],
        text: (ctx) => {
            const acquaintance = getRandomNPC(ctx, 'ACQUAINTANCE');
            if (!acquaintance) {
                return 'Sınıfta biriyle sürekli bir rekabet var. Her sınavda, her konuda karşı karşıya geliyorsunuz.';
            }
            return `${acquaintance.name} ile aranızda bir rekabet başladı. O senden iyi olmak istiyor, sen ondan.`;
        },
        minAge: 10,
        maxAge: 18,
        rarity: 'UNCOMMON',
        personalityCategory: 'CONFLICT',
        choices: [
            {
                text: '🏆 Rekabeti kabul et',
                effect: { intelligence: 2, discipline: 2 },
                feedback: 'Rekabet seni daha çok çalışmaya itti. Belki bu iyi bir şey.',
                personalityEffects: [{ axis: 'courage', change: 3 }],
                npcRelationChange: -10,
            },
            {
                text: '🤝 Barış teklif et',
                effect: { charisma: 3 },
                feedback: 'Rekabet yerine arkadaşlık. Birlikte daha güçlüsünüz!',
                personalityEffects: [{ axis: 'empathy', change: 5 }],
                npcRelationChange: 15,
            },
            {
                text: '🔥 Onu ezmeye çalış',
                effect: { discipline: -2 },
                feedback: 'Düşmanlık büyüdü. Bu savaş bitmedi.',
                personalityEffects: [{ axis: 'empathy', change: -5 }],
                npcRelationChange: -25,
                stressEffect: 10,
            },
        ],
    },

    {
        id: 'npc_gossip_about_you',
        tags: ['social', 'npc', 'friend'],
        text: (ctx) => {
            const rival = getRandomNPC(ctx, 'RIVAL') || getRandomNPC(ctx);
            if (!rival) {
                return 'Arkandan kötü söz söylendiğini duydun. Birisi hakkında dedikodu yayıyor.';
            }
            return `${rival.name}'ın senin hakkında kötü şeyler söylediğini duydun. "O tam bir sahtekar" demiş.`;
        },
        minAge: 10,
        maxAge: 18,
        rarity: 'UNCOMMON',
        personalityCategory: 'CONFLICT',
        choices: [
            {
                text: '😡 Yüzleş',
                effect: { charisma: 2 },
                feedback: 'Karşısına geçip "Neden böyle yapıyorsun?" dedin. Suratı kızardı.',
                personalityEffects: [{ axis: 'courage', change: 5 }],
                npcRelationChange: -15,
                stressEffect: 10,
            },
            {
                text: '🙄 Aldırma',
                effect: { discipline: 2 },
                feedback: 'Dedikodu kendiliğinden söner. Tepki vermemek en iyisi.',
                personalityEffects: [{ axis: 'patience', change: 5 }],
            },
            {
                text: '🗣️ Sen de onun hakkında dedikodu yay',
                effect: { charisma: -3 },
                feedback: 'Misliyle karşılık verdin. Ama şimdi ikisini de güvenilmez buluyorlar.',
                personalityEffects: [{ axis: 'empathy', change: -5 }],
                npcRelationChange: -20,
                stressEffect: 5,
            },
        ],
    },

    // =================================================================
    // GRUP DİNAMİĞİ EVENTLERİ
    // =================================================================

    {
        id: 'npc_group_exclusion',
        tags: ['social', 'group', 'npc'],
        text: 'Teneffüste grubun seni çağırmadan bir yere gitti. Dışlandığını hissediyorsun. Acaba bir şey mi oldu?',
        minAge: 10,
        maxAge: 18,
        rarity: 'UNCOMMON',
        personalityCategory: 'SOCIAL',
        choices: [
            {
                text: '😢 Üzül ve evde ağla',
                effect: { health: -3 },
                feedback: 'Evde yalnız ağladın. Belki yarın her şey normale döner.',
                personalityEffects: [{ axis: 'openness', change: -3 }],
                stressEffect: 20,
            },
            {
                text: '🗣️ Arkadaşlarına sor',
                effect: { charisma: 2 },
                feedback: '"Yanlış anladın, acele ettik" dediler. Belki haklılar...',
                personalityEffects: [{ axis: 'courage', change: 3 }],
                npcRelationChange: 5,
            },
            {
                text: '🚶 Yeni arkadaşlar edin',
                effect: { charisma: 3 },
                feedback: 'Başka insanlarla takılmaya başladın. Belki daha iyi bir grup bulursun.',
                personalityEffects: [{ axis: 'openness', change: 5 }],
            },
        ],
    },

    {
        id: 'npc_group_leader_challenge',
        tags: ['social', 'group', 'npc'],
        text: 'Grubun lideri olan arkadaşın son zamanlarda herkesin üzerinde baskı kuruyor. Bazıları senden "bir şey yap" bekliyor.',
        minAge: 12,
        maxAge: 18,
        rarity: 'RARE',
        personalityCategory: 'CONFLICT',
        choices: [
            {
                text: '👑 Liderliği üstlen',
                effect: { charisma: 5, discipline: -2 },
                feedback: 'Grubun yeni lideri oldun! Ama eski lider artık senin düşmanın.',
                personalityEffects: [{ axis: 'courage', change: 5 }, { axis: 'conformity', change: -5 }],
                npcRelationChange: -30,
            },
            {
                text: '🤝 Liderle konuş',
                effect: { charisma: 3 },
                feedback: 'İkisi arasında yapıcı bir konuşma geçti. İşler düzeldi.',
                personalityEffects: [{ axis: 'empathy', change: 5 }],
                npcRelationChange: 10,
            },
            {
                text: '🚶 Gruptan ayrıl',
                effect: { discipline: 2 },
                feedback: 'Drama istemiyorsun. Sessizce uzaklaştın.',
                personalityEffects: [{ axis: 'conformity', change: -3 }],
                npcRelationChange: -15,
            },
        ],
    },

    {
        id: 'npc_new_friend_opportunity',
        tags: ['social', 'friend', 'npc'],
        text: (_ctx) => {
            const hobbies = ['müzik dinlerken', 'kitap okurken', 'oyun oynarken'];
            const hobby = hobbies[Math.floor(Math.random() * hobbies.length)];
            return `Bahçede ${hobby} birini gördün ve ortak ilgi alanınız olduğunu fark ettin. Konuşacak mısın?`;
        },
        minAge: 8,
        maxAge: 18,
        rarity: 'COMMON',
        isRepeatable: true,
        personalityCategory: 'SOCIAL',
        choices: [
            {
                text: '🗣️ Merhaba de ve konuş',
                effect: { charisma: 3 },
                feedback: 'Harika bir sohbet geçti! Yeni bir potansiyel arkadaş.',
                personalityEffects: [{ axis: 'openness', change: 5 }],
                npcRelationChange: 20,
            },
            {
                text: '👀 Sadece gülümse ve geç',
                effect: {},
                feedback: 'Gülümsedin, o da gülümsedi. Belki başka zaman konuşursunuz.',
                personalityEffects: [{ axis: 'courage', change: -2 }],
            },
            {
                text: '🚶 Hiç fark etme, yürü',
                effect: { discipline: 1 },
                feedback: 'Kendi işine baktın. Kim bilir kim kayboldu.',
                personalityEffects: [{ axis: 'openness', change: -3 }],
            },
        ],
    },

    {
        id: 'npc_friend_needs_help',
        tags: ['social', 'friend', 'npc'],
        text: (ctx) => {
            const friend = getRandomNPC(ctx, 'FRIEND') || getRandomNPC(ctx, 'BEST_FRIEND');
            if (!friend) {
                return 'Yakın bir arkadaşın zor bir dönemden geçiyor. Ailesinde sorunlar varmış. Sana açıldı.';
            }
            return `${friend.name} sana açıldı. "Evde işler çok kötü, kimseyle konuşamıyorum..." diyor, gözleri dolu.`;
        },
        minAge: 10,
        maxAge: 18,
        rarity: 'UNCOMMON',
        personalityCategory: 'MORAL',
        choices: [
            {
                text: '🤗 Dinle ve destek ol',
                effect: { charisma: 5 },
                feedback: 'Sadece dinledin ve yanında olduğunu hissettirdin. Bazen en iyi yardım budur.',
                personalityEffects: [{ axis: 'empathy', change: 10 }],
                npcRelationChange: 25,
                grantTraits: ['EMPATHETIC'],
            },
            {
                text: '💡 Çözüm öner',
                effect: { intelligence: 2 },
                feedback: 'Pratik çözümler sundun. Belki işe yarar, belki yaramaz...',
                personalityEffects: [{ axis: 'empathy', change: 3 }],
                npcRelationChange: 10,
            },
            {
                text: '🙄 "Herkesin sorunları var" de',
                effect: {},
                feedback: 'Empati kuramadın. Arkadaşın daha da kapandı.',
                personalityEffects: [{ axis: 'empathy', change: -10 }],
                npcRelationChange: -20,
            },
        ],
    },
];
