
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stats, StatKey, Family, GameState, CareerResult, NPC, FamilyWealth, FamilyDynamic } from '../types';
import { TRAIT_DEFINITIONS } from '../data/traits';

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// --- YAŞLANMA ALGORİTMASI (GDD Bölüm 2.2) ---
// GDD Şartı: 0-7 yaş: Her 2 tur, 7-18 yaş: Her 5 tur
export const shouldAgeUp = (currentAge: number, turnCount: number): boolean => {
  if (currentAge < 7) {
    return turnCount % 2 === 0;
  } else if (currentAge < 18) {
    return turnCount % 5 === 0;
  }
  return false; // 18 yaşından sonra yaşlanma durur (oyun biter)
};

// --- AİLE SİSTEMİ BAŞLATMA (KRİTİK) ---
export const createRandomFamily = (): Family => {
  // Wealth dağılımı: %30 Poor, %50 Middle, %20 Rich
  const wealthRoll = Math.random();
  let wealth: FamilyWealth;
  if (wealthRoll < 0.3) {
    wealth = 'POOR';
  } else if (wealthRoll < 0.8) {
    wealth = 'MIDDLE';
  } else {
    wealth = 'RICH';
  }
  
  // Dynamic dağılımı: %40 Supportive, %35 Strict, %25 Chaotic
  const dynamicRoll = Math.random();
  let dynamic: FamilyDynamic;
  if (dynamicRoll < 0.4) {
    dynamic = 'SUPPORTIVE';
  } else if (dynamicRoll < 0.75) {
    dynamic = 'STRICT';
  } else {
    dynamic = 'CHAOTIC';
  }
  
  // Allowance: Wealth'e göre belirlenir
  let allowance = 0;
  switch (wealth) {
    case 'POOR':
      allowance = getRandomInt(5, 15);
      break;
    case 'MIDDLE':
      allowance = getRandomInt(20, 40);
      break;
    case 'RICH':
      allowance = getRandomInt(50, 100);
      break;
  }
  
  return { wealth, dynamic, allowance };
};

// --- KALITSAL ÖZELLİKLER (GENETIC TRAITS) ---
// GDD Şartı: Doğumda rastgele atanır (%5-15 şans)
export const assignGeneticTraits = (): string[] => {
  const geneticTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'GENETIC');
  const assignedTraits: string[] = [];
  
  // Her genetic trait için %5-15 şans ile atama
  geneticTraits.forEach(trait => {
    const chance = getRandomInt(5, 15);
    if (Math.random() * 100 < chance) {
      assignedTraits.push(trait.id);
    }
  });
  
  return assignedTraits;
};

// --- ENERJİ TÜKETİMİ SİSTEMİ ---
// GDD Şartı: Her aktivite -5 ila -20 enerji
export const calculateEnergyCost = (actionId: string, traitIds: string[]): number => {
  // Temel enerji maliyeti (aksiyon tipine göre)
  let baseCost = 10;
  
  // Aksiyon tipine göre maliyet
  if (actionId.includes('study')) baseCost = 15;
  else if (actionId.includes('sports')) baseCost = 20;
  else if (actionId.includes('work')) baseCost = 18;
  else if (actionId.includes('social')) baseCost = 8;
  else if (actionId.includes('coding') || actionId.includes('music') || actionId.includes('art')) baseCost = 12;
  else if (actionId.includes('rest') || actionId.includes('sleep')) baseCost = 5;
  
  // Trait multiplier'ı uygula
  const multiplier = getEnergyCostMultiplier(traitIds);
  
  return Math.floor(baseCost * multiplier);
};

// --- OKUL SİSTEMİ (RAPOR KARTI) ---
// GDD Şartı: Her 5 tur (7-18 yaş) rapor kartı
export const shouldGenerateReportCard = (currentAge: number, turnCount: number): boolean => {
  if (currentAge < 7 || currentAge >= 18) return false;
  return turnCount % 5 === 0;
};

// --- SAVE SYSTEM V3 (MULTI-SLOT) ---
// Legacy key kept for backward compatibility
export const SAVE_KEY = 'lifesim_save_data_v2';

// BAŞLANGIÇ VERİLERİNİ ÜRETEN FONKSİYONLAR
export const getInitialStats = (): Stats => {
    const health = 70;
    // GDD Şartı: Başlangıç enerjisi = 50 + (Health × 0.3)
    const energy = Math.floor(50 + (health * 0.3));
    return {
        health,
        intelligence: 0,
        charisma: 10,
        discipline: 0,
        money: 0,
        energy,
        familyRelation: 50
    };
};

export const getInitialGameState = (): GameState => {
    // Aile sistemi başlatma (KRİTİK)
    const family = createRandomFamily();
    
    // Kalıtsal özellikler (Genetic Traits) atama (YÜKSEK)
    const geneticTraits = assignGeneticTraits();
    
    // Başlangıç NPC'leri
    const npcs = generateNPCs();
    
    return {
        age: 0,
        turn: 1,
        phase: 'SETUP',
        currentEvent: null,
        pendingReportCard: false,
        lastResult: null,
        historyLog: [],
        family,
        maxEnergy: 100,
        schoolGrades: { math: 50, science: 50, language: 50 },
        skills: { coding: 0, music: 0, sports: 0, design: 0 },
        talent: 'NONE',
        streak: { actionId: null, count: 0 },
        traits: geneticTraits, // Genetic traits başlangıçta atanır
        traitProgress: {},
        actionCounts: {},
        actionHistory: [],
        eventChoiceHistory: [],
        memories: [],
        scheduledEvents: [],
        inventory: [],
        npcs, // Başlangıç NPC'leri
        selectedNpcId: null,
        innerThought: "",
        floatingTexts: [],
        totalTurns: 0,
        lastInteracted: {
            math: 0, science: 0, language: 0,
            coding: 0, music: 0, sports: 0, design: 0
        },
        recentEvents: [],
        unlockedAchievements: [],
        achievementProgress: {}
    };
};

// --- MULTI-SLOT SAVE SYSTEM INTEGRATION ---
// Current slot ID - defaults to Slot 1 for backwards compatibility
let currentSlotId: string = '1';

export const setCurrentSlotId = (slotId: string) => {
  currentSlotId = slotId;
};

export const getCurrentSlotId = (): string => {
  return currentSlotId;
};

export const getAsyncStorage = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to read value from async storage', e);
    return null;
  }
};

/**
 * Initialize save system (call once on app start)
 * Migrates legacy saves automatically
 */
export const initializeSaveSystem = async () => {
  try {
    const legacyData = await getAsyncStorage(SAVE_KEY);
    if (legacyData) {
      console.log('Legacy save data found. Migration will be handled by SaveManager.');
    }
    const SaveManager = (await import('../save/SaveManager')).default;
    await SaveManager.initialize();
    return true;
  } catch (error) {
    console.error("Save system initialization failed:", error);
    return false;
  }
};

/**
 * Save game to current slot (backwards compatible wrapper)
 */
export const saveGame = async (data: { stats: Stats, gameState: GameState, playerName: string }) => {
  try {
    const SaveManager = (await import('../save/SaveManager')).default;
    const success = await SaveManager.saveToSlot(
      currentSlotId,
      data.playerName,
      data.stats,
      data.gameState
    );
    return success;
  } catch (error) {
    console.error("Kaydederken hata oluştu:", error);
    return false;
  }
};

/**
 * Load game from current slot (backwards compatible wrapper)
 */
export const loadGame = async () => {
  try {
    const SaveManager = (await import('../save/SaveManager')).default;
    const saveData = await SaveManager.loadFromSlot(currentSlotId);
    return saveData;
  } catch (error) {
    console.error("Yüklerken hata oluştu:", error);
    return null;
  }
};

/**
 * Reset/delete current slot (backwards compatible wrapper)
 */
export const resetGameStorage = async () => {
  try {
    const SaveManager = (await import('../save/SaveManager')).default;
    const success = await SaveManager.deleteSlot(currentSlotId);
    return success;
  } catch (error) {
    console.error("Sıfırlarken hata oluştu:", error);
    return false;
  }
};

/**
 * Auto-save to dedicated auto-save slot
 */
export const autoSaveGame = async (data: { stats: Stats, gameState: GameState, playerName: string }) => {
  try {
    const SaveManager = (await import('../save/SaveManager')).default;
    const success = await SaveManager.autoSave(
      data.playerName,
      data.stats,
      data.gameState
    );
    return success;
  } catch (error) {
    console.error("Auto-save failed:", error);
    return false;
  }
};

export const getStatCap = (age: number, statKey: StatKey, family?: Family | null, traitIds: string[] = []): number => {
  if (statKey === 'money') return Infinity;
  
  if (statKey === 'energy') {
      let energyCap = 100;
      if (family && family.wealth === 'POOR') energyCap = 90;
      if (traitIds.includes('BURNOUT_PRONE')) energyCap -= 15;
      if (traitIds.includes('ATHLETIC')) energyCap += 10;
      return energyCap;
  }

  if (statKey === 'familyRelation') return 100;

  let baseCap = 100;

  if (statKey === 'health' && traitIds.includes('SICKLY')) {
      return 60;
  }

  // Yaşa bağlı soft cap (Sınıf düzeyi mantığı)
  if (age < 7) baseCap = 30;       // Okul öncesi
  else if (age < 10) baseCap = 50; // İlkokul
  else if (age < 14) baseCap = 70; // Ortaokul
  else if (age < 18) baseCap = 90; // Lise
  else baseCap = 100;              // Yetişkin

  if (family) {
    if (family.wealth === 'RICH') {
        if (statKey === 'health') baseCap += 5;
        if (statKey === 'charisma') baseCap += 5;
    }
    if (family.wealth === 'POOR') {
        if (statKey === 'health') baseCap -= 10;
        if (statKey === 'intelligence') baseCap -= 5;
    }
    if (family.dynamic === 'STRICT') {
        if (statKey === 'discipline') baseCap += 10;
        if (statKey === 'charisma') baseCap -= 10;
    }
    if (family.dynamic === 'CHAOTIC') {
        if (statKey === 'discipline') baseCap -= 20;
    }
  }

  return clamp(baseCap, 25, 100);
};

export const getTraitMultiplier = (traitIds: string[], statKey: string): number => {
  let multiplier = 1.0;

  traitIds.forEach(id => {
    switch (id) {
      // --- GENETIC ---
      case 'GENIUS':
        if (['intelligence', 'math', 'science', 'language', 'coding', 'design'].includes(statKey)) multiplier += 0.3;
        break;
      case 'ATHLETIC':
        if (['sports', 'health'].includes(statKey)) multiplier += 0.3;
        break;
      case 'CHARISMATIC':
        if (['charisma', 'familyRelation'].includes(statKey)) multiplier += 0.3;
        break;
      case 'CLUMSY':
        if (['sports', 'coding', 'music', 'design'].includes(statKey)) multiplier -= 0.15;
        break;
      case 'SICKLY':
        if (['health', 'sports'].includes(statKey)) multiplier -= 0.1;
        break;

      // --- ACQUIRED POSITIVE ---
      case 'EMPATHETIC':
        if (['charisma', 'familyRelation'].includes(statKey)) multiplier += 0.25;
        break;
      case 'ORGANIZED':
        if (['discipline', 'math', 'science', 'language'].includes(statKey)) multiplier += 0.2;
        break;
      case 'BRAVE':
        if (['charisma', 'sports'].includes(statKey)) multiplier += 0.2;
        break;
      case 'DISCIPLINED':
        if (['discipline', 'intelligence', 'coding', 'math', 'science'].includes(statKey)) multiplier += 0.15;
        break;
      case 'AMBITIOUS':
        if (['money'].includes(statKey)) multiplier += 0.3;
        if (['intelligence'].includes(statKey)) multiplier += 0.1;
        break;
      case 'CREATIVE':
        if (['design', 'music'].includes(statKey)) multiplier += 0.3;
        if (['coding'].includes(statKey)) multiplier += 0.1;
        break;
      case 'BOOKWORM':
        if (['language', 'intelligence'].includes(statKey)) multiplier += 0.4;
        if (['sports'].includes(statKey)) multiplier -= 0.1;
        break;
      case 'SOCIAL_BUTTERFLY':
        if (['charisma', 'familyRelation'].includes(statKey)) multiplier += 0.25;
        if (['discipline'].includes(statKey)) multiplier -= 0.05;
        break;
      case 'ENTREPRENEUR':
        if (['money'].includes(statKey)) multiplier += 0.25;
        break;
      case 'HONEST':
        if (['familyRelation'].includes(statKey)) multiplier += 0.2;
        break;
      case 'NIGHT_OWL':
        if (['coding', 'music', 'design'].includes(statKey)) multiplier += 0.2;
        break;

      // --- ACQUIRED NEGATIVE/NEUTRAL ---
      case 'LAZY':
        if (['discipline', 'sports', 'money'].includes(statKey)) multiplier -= 0.2;
        break;
      case 'GAMER':
        if (['intelligence', 'coding', 'design'].includes(statKey)) multiplier += 0.15;
        if (['charisma', 'health'].includes(statKey)) multiplier -= 0.1; 
        break;
      case 'LONE_WOLF':
        if (['intelligence', 'coding', 'art'].includes(statKey)) multiplier += 0.15;
        if (['charisma', 'familyRelation'].includes(statKey)) multiplier -= 0.2;
        break;
      case 'REBELLIOUS':
        if (['discipline', 'familyRelation'].includes(statKey)) multiplier -= 0.2;
        if (['charisma'].includes(statKey)) multiplier += 0.1;
        break;
      case 'CHEATER':
        if (['discipline'].includes(statKey)) multiplier -= 0.15;
        break;
      case 'COWARD':
        if (['charisma'].includes(statKey)) multiplier -= 0.2;
        break;
      case 'PROCRASTINATOR':
        if (['discipline', 'math', 'science'].includes(statKey)) multiplier -= 0.1;
        break;
      case 'PRAGMATIC':
        if (['money', 'intelligence'].includes(statKey)) multiplier += 0.1;
        if (['familyRelation'].includes(statKey)) multiplier -= 0.1;
        break;
    }
  });

  return multiplier;
};

export const getEnergyCostMultiplier = (traitIds: string[]): number => {
  let multiplier = 1.0;
  
  // Genetic
  if (traitIds.includes('ATHLETIC')) multiplier -= 0.15; 
  if (traitIds.includes('SICKLY')) multiplier += 0.15;

  // Acquired
  if (traitIds.includes('LAZY')) multiplier += 0.25;
  if (traitIds.includes('DISCIPLINED')) multiplier -= 0.15;
  if (traitIds.includes('ORGANIZED')) multiplier -= 0.10;
  if (traitIds.includes('BURNOUT_PRONE')) multiplier += 0.20;
  if (traitIds.includes('LONE_WOLF')) multiplier -= 0.05; 
  if (traitIds.includes('PROCRASTINATOR')) multiplier += 0.10;

  return multiplier;
};

// GÜNCELLENMİŞ STAT KAZANIM FORMÜLÜ (Azalan Getiri)
export const calculateStatGain = (currentValue: number, baseGain: number, cap: number = 100): number => {
  if (baseGain <= 0) return baseGain;

  // 1. Cap'in %70'inin altındaysa: TAM PUAN (Hızlı Gelişim)
  if (currentValue < cap * 0.7) {
    return baseGain;
  } 
  // 2. Cap'e yaklaştıysa: YARI PUAN (Zorlaşan Dersler)
  else if (currentValue < cap) {
    return Math.ceil(baseGain * 0.5);
  } 
  // 3. Cap'i aştıysa: MİNİMUM PUAN (Sınırı zorlamak çok zor)
  else {
    return Math.ceil(baseGain * 0.2); // Genelde 1 puan
  }
};

export const updateStats = (currentStats: Stats, changes: Partial<Stats>, age: number = 18, family: Family | null = null, traitIds: string[] = []): Stats => {
  const newStats = { ...currentStats };
  
  (Object.keys(changes) as StatKey[]).forEach((key) => {
    if (changes[key] !== undefined) {
      let changeVal = changes[key] || 0;
      const dynamicCap = getStatCap(age, key, family, traitIds);
      
      if (changeVal > 0 && key !== 'money' && key !== 'energy') {
          changeVal = calculateStatGain(newStats[key], changeVal, dynamicCap);
      }

      let newValue = newStats[key] + changeVal;
      let minLimit = 0;
      if (key === 'money') minLimit = -500;
      
      newStats[key] = clamp(newValue, minLimit, dynamicCap + 10); // Soft Cap'i biraz aşmaya izin ver
    }
  });

  return newStats;
};

export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const hasItem = (inventory: string[], itemId: string): boolean => {
    return inventory.includes(itemId);
};

// ... (NPC FUNCTIONS REMAIN UNCHANGED)
const maleNames = ["Ahmet", "Mehmet", "Can", "Burak", "Emre", "Kerem", "Mert", "Deniz", "Volkan", "Cem", "Arda", "Efe", "Bora", "Sinan"];
const femaleNames = ["Ayşe", "Zeynep", "Elif", "Melis", "Ceren", "Selin", "Ece", "Derya", "Sena", "Ezgi", "Buse", "Gizem", "İrem", "Gamze"];

export const createRandomNPC = (): NPC => {
    const gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE';
    const list = gender === 'MALE' ? maleNames : femaleNames;
    const name = list[getRandomInt(0, list.length - 1)];
    const id = `npc_${Date.now()}_${getRandomInt(0, 999)}`;

    return {
        id,
        name,
        role: 'ACQUAINTANCE',
        relationship: getRandomInt(10, 30),
        romance: 0,
        gender
    };
};

export const generateNPCs = (): NPC[] => {
    return [createRandomNPC(), createRandomNPC()];
};

export const getSocialEndResult = (npcs: NPC[]): string => {
    const partners = npcs.filter(n => n.role === 'PARTNER');
    const bestFriends = npcs.filter(n => n.role === 'BEST_FRIEND');
    const friends = npcs.filter(n => n.role === 'FRIEND');
    const rivals = npcs.filter(n => n.role === 'RIVAL' || n.role === 'ENEMY');

    let result = "";
    if (partners.length > 0) result += `❤️ ${partners[0].name} ile evlendin ve mutlu bir yuva kurdun. `;
    else result += "💔 Gerçek aşkı bulamadan yılları devirdin. ";

    if (bestFriends.length > 0) result += `🤝 ${bestFriends[0].name} ile kardeşten öte oldunuz. `;
    else if (friends.length > 0) result += `👥 Arkadaş çevren genişti ama kimseyle çok derinleşmedin. `;

    if (rivals.length > 0) result += `⚔️ ${rivals[0].name} ile hala kanlı bıçaklısınız. `;

    return result;
};

// ... (CAREER RESULT REMAINS UNCHANGED)
export const calculateCareerResult = (gameState: GameState, stats: Stats): CareerResult => {
  const { schoolGrades, skills } = gameState;

  if (skills.sports > 90) return { title: "Milli Sporcu", description: "Yıllar süren antrenmanların karşılığını aldın. Olimpiyatlara hazırlanıyorsun!", emoji: "🥇", type: "LEGENDARY", familyReaction: "Baban: 'Benim aslan oğlum/kızım!' diyor." };
  if (skills.music > 85) return { title: "Rockstar / Virtüöz", description: "Konservatuarı dereceyle bitirdin. Albümlerin yok satıyor.", emoji: "🎸", type: "LEGENDARY", familyReaction: "Annen her konserine geliyor." };
  if (schoolGrades.math > 80 && schoolGrades.science > 80 && stats.discipline > 60) return { title: "Tıp Fakültesi", description: "Ülkenin en prestijli Tıp Fakültesini kazandın.", emoji: "🩺", type: "SUCCESS", familyReaction: "Ailen herkese 'Çocuğumuz Doktor olacak' diye hava atıyor." };
  if (schoolGrades.math > 70 && skills.coding > 70) return { title: "Yazılım Mühendisliği", description: "Kodlama yeteneğin seni teknoloji dünyasına taşıdı.", emoji: "💻", type: "SUCCESS", familyReaction: "Ailen 'Bütün gün bilgisayar başındaydı ama işe yaradı' diyor." };
  if (schoolGrades.language > 80 && stats.intelligence > 70) return { title: "Hukuk Fakültesi", description: "Keskin zekan ve hitabetinle Hukuk kazandın.", emoji: "⚖️", type: "SUCCESS", familyReaction: "Baban: 'Artık davalarımıza sen bakarsın' diyor." };
  if (stats.money > 2000) return { title: "Özel Üni - İşletme", description: "Notların parlak değildi ama ailenin imkanlarıyla İşletme kazandın.", emoji: "🎓", type: "NORMAL", familyReaction: "Ailen: 'Diploma diplomadır' diyor." };
  if (stats.intelligence > 50 && stats.discipline > 50) return { title: "İktisat / Kamu Yönetimi", description: "Ortalama bir puanla bir üniversite kazandın.", emoji: "bg-gray-200", type: "NORMAL", familyReaction: "Ailen: 'En azından bir yer kazandı' diyor." };

  return { title: "Mezuna Kaldın / İşsiz", description: "Sınav sonucun beklediğin gibi gelmedi.", emoji: "💀", type: "FAILURE", familyReaction: "Evde derin bir sessizlik var." };
};

// --- TRAIT LOGIC ---
export const checkTraitFormation = (
    actionId: string | null,
    choiceId: string | null,
    state: GameState,
    currentStats: Stats
): {
    newTraits: string[];
    removedTraits: string[];
    updatedProgress: GameState['traitProgress'];
    unlockMessage?: string;
    progressUpdates: string[]; // NEW: Returns which traits made progress
} => {
    let newTraits: string[] = [];
    let removedTraits: string[] = [];
    let updatedProgress = { ...state.traitProgress };
    let unlockMessage: string | undefined = undefined;
    let progressUpdates: string[] = [];

    // Filter relevant ACQUIRED traits that are NOT yet owned
    const potentialTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'ACQUIRED' && t.formation && !state.traits.includes(t.id));

    potentialTraits.forEach(trait => {
        const formation = trait.formation!;
        
        // 1. Age Check
        if (state.age < formation.ageWindow[0] || state.age > formation.ageWindow[1]) return;

        // Initialize progress if not exists
        if (!updatedProgress[trait.id]) {
            updatedProgress[trait.id] = { 
                points: 0, 
                required: formation.pointsRequired || 5, // Default backup 
                firstTriggeredAge: state.age, 
                isLocked: false 
            };
        }

        // Skip if locked
        if (updatedProgress[trait.id].isLocked) return;

        // 2. Check Triggers & Calculate Points
        let triggered = false;
        let pointsToAdd = 0;

        formation.triggers.forEach(trigger => {
            let matched = false;
            // Action Trigger
            if (trigger.type === 'ACTION' && actionId) {
              if (trigger.pattern && actionId.startsWith(trigger.pattern)) matched = true;
              if (trigger.actionId && actionId === trigger.actionId) matched = true;
            }
            // Event Choice Logic
            if (trigger.type === 'EVENT_CHOICE') {
              if (choiceId && trigger.pattern && choiceId === trigger.pattern) matched = true;
              if (trigger.eventId && state.currentEvent?.id === trigger.eventId) {
                if (trigger.choice == null || (choiceId && choiceId === String(trigger.choice))) {
                  matched = true;
                }
              }
            }
            // Logic for Stats (Thresholds)
            if (trigger.type === 'STAT_THRESHOLD') {
              if (trigger.statCondition) {
                const statVal = currentStats[trigger.statCondition.stat as StatKey];
                if (trigger.statCondition.operator === '>' && statVal > trigger.statCondition.value) matched = true;
                if (trigger.statCondition.operator === '<' && statVal < trigger.statCondition.value) matched = true;
              } else if (trigger.statKey && typeof trigger.threshold === 'number') {
                const statVal = currentStats[trigger.statKey];
                if (statVal >= trigger.threshold) matched = true;
              }
            }

            if (matched) {
                triggered = true;
                pointsToAdd += (trigger.count || 1); // Aggregate points from all matching triggers
            }
        });

        // 3. Logic & Multipliers
        if (triggered) {
            let multiplier = 1.0;
            
            // Age Difficulty: Harder to change after 14
            if (state.age >= 14) {
                multiplier = 0.5;
            }

            // Synergy Bonus: +1 point if player has synergistic traits
            const hasSynergy = trait.synergies?.some(s => state.traits.includes(s));
            if (hasSynergy) {
                pointsToAdd += 1; 
            }

            // Apply points
            updatedProgress[trait.id].points += pointsToAdd * multiplier;
            
            // Add to UI feedback list (avoid duplicates)
            if (!progressUpdates.includes(trait.name)) {
                progressUpdates.push(trait.name);
            }
            
            // 4. Check Unlock
            if (updatedProgress[trait.id].points >= updatedProgress[trait.id].required) {
                newTraits.push(trait.id);
                unlockMessage = trait.name; // Keep mainly for single message logic if needed
                updatedProgress[trait.id].isLocked = true; 

                // 5. Handle Conflicts
                if (trait.conflicts) {
                    trait.conflicts.forEach(conflictId => {
                        if (state.traits.includes(conflictId)) {
                            removedTraits.push(conflictId);
                            // Also clear progress for the conflicting trait if it existed (it shouldn't if already owned, but good safety)
                            if (updatedProgress[conflictId]) delete updatedProgress[conflictId];
                        }
                    });
                }
                
                // Clear progress for the newly acquired trait to save space
                delete updatedProgress[trait.id];
            }
        }
    });

    return { newTraits, removedTraits, updatedProgress, unlockMessage, progressUpdates };
};
