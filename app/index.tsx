
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar, Modal } from 'react-native';
import { EVENTS, FALLBACK_EVENT } from '../src/data/events';
import { getRandomGeneticTraits } from '../src/data/traits';
import { getStatCap, updateStats, createRandomNPC } from '../src/utils/gameUtils';

// Simple ReportCard Component for Mobile
const ReportCard = ({ visible, grades, onClose, playerName, age }: { visible: boolean; grades: any; onClose: () => void; playerName: string; age: number }) => {
  if (!visible) return null;
  const avg = Math.round((grades.math + grades.science + grades.language) / 3);
  const status = avg >= 85 ? "ONUR BELGESİ" : avg >= 70 ? "TEŞEKKÜR" : avg >= 60 ? "GEÇTİ" : "KALDI";
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#161616', borderRadius: 20, padding: 25, width: '100%', borderWidth: 1, borderColor: '#333' }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 }}>📜 YIL SONU KARNESİ</Text>
          <Text style={{ color: '#888', fontSize: 12, textAlign: 'center', marginBottom: 20 }}>{playerName} • {age} Yaş</Text>
          <View style={{ marginBottom: 20 }}>
            <GradeRow label="Matematik" score={grades.math} />
            <GradeRow label="Fen Bilgisi" score={grades.science} />
            <GradeRow label="Yabancı Dil" score={grades.language} />
          </View>
          <View style={{ backgroundColor: avg >= 60 ? '#22c55e' : '#ef4444', padding: 15, borderRadius: 10, marginBottom: 20 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>Ortalama: {avg}</Text>
            <Text style={{ color: '#fff', fontSize: 14, textAlign: 'center' }}>{status}</Text>
          </View>
          <TouchableOpacity style={{ backgroundColor: '#3b82f6', padding: 15, borderRadius: 10 }} onPress={onClose}>
            <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>TAMAM</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const GradeRow = ({ label, score }: { label: string; score: number }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#222', padding: 12, borderRadius: 8, marginBottom: 8 }}>
    <Text style={{ color: '#aaa', fontSize: 14 }}>{label}</Text>
    <Text style={{ color: score >= 60 ? '#22c55e' : '#ef4444', fontSize: 14, fontWeight: 'bold' }}>{score}</Text>
  </View>
);

const emptyStats = {
  health: 0, intelligence: 0, charisma: 0, discipline: 0, energy: 0, money: 0, familyRelation: 0, karma: 50
};

export default function Game() {
  const [phase, setPhase] = useState('SETUP');
  const [activeTab, setActiveTab] = useState('MAIN');
  const [playerName, setPlayerName] = useState('');
  const [age, setAge] = useState(0);
  const [turn, setTurn] = useState(1);
  const [stats, setStats] = useState<any>(emptyStats);
  const [grades, setGrades] = useState({ math: 30, science: 30, language: 30 });
  const [usedEventIds, setUsedEventIds] = useState<string[]>([]);
  const [history, setHistory] = useState([{ message: 'Yazgı başlıyor...', type: 'neutral' }]);
  const [npcs, setNpcs] = useState<any[]>([]);
  const [traits, setTraits] = useState<any[]>([]);
  const [inventory, setInventory] = useState<string[]>([]);
  
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultFeedback, setResultFeedback] = useState('');
  const [lastChanges, setLastChanges] = useState<any>(null);
  const [showReportCard, setShowReportCard] = useState(false);

  const addLog = (message: string) => {
    setHistory(prev => [{ message, type: 'neutral' }, ...prev].slice(0, 15));
  };

  const handleStartGame = () => {
    if (!playerName.trim()) return;
    const initialTraits = getRandomGeneticTraits(1);
    setTraits(initialTraits || []);
    setStats({
        health: initialTraits.some(t=>t.id==='sickly') ? 40 : 90,
        intelligence: 10, charisma: 10, discipline: 10, energy: 100, money: 0, familyRelation: 70, karma: 50
    });
    setGrades({ math: 30, science: 30, language: 30 });
    setNpcs([createRandomNPC(), createRandomNPC()]);
    setAge(0);
    setTurn(1);
    setPhase('PLAYING');
    setTimeout(() => triggerEvent(0), 500);
  };

  const advanceTurn = () => {
    let nextTurn = turn + 1;
    let nextAge = age;

    if (nextTurn > 4) {
        nextTurn = 1; 
        nextAge = age + 1; 
        if (nextAge >= 18) { setPhase('ENDING'); return; }
        setAge(nextAge);
        if (nextAge >= 7) setShowReportCard(true);
        else triggerEvent(nextAge);
    } else {
        triggerEvent(nextAge);
    }
    
    setTurn(nextTurn);
    setStats((prev: any) => ({ ...prev, energy: 100 }));
    setActiveTab('MAIN');
  };

  const triggerEvent = (targetAge: number) => {
    const candidates = EVENTS.filter(e => targetAge >= e.minAge && targetAge <= e.maxAge && !usedEventIds.includes(e.id));
    const selected = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : FALLBACK_EVENT;
    setUsedEventIds(prev => [...prev, selected.id]);
    setCurrentEvent(selected);
    setShowResult(false);
    setShowEventModal(true);
  };

  const updateGameStats = (effect?: any, gradeUpdates?: any) => {
    if (effect) {
      setStats((prev: any) => updateStats(prev, effect, age, null, traits.map(t => t.id)));
    }
    if (gradeUpdates) {
        setGrades((prev: any) => {
            const newGrades = { ...prev };
            Object.keys(gradeUpdates).forEach(key => {
                if (key in newGrades) (newGrades as any)[key] = Math.min(100, Math.max(0, (newGrades as any)[key] + gradeUpdates[key]));
            });
            return newGrades;
        });
    }
  };

  const handleAction = (cost: number, effect: any, msg: string, options: any = {}) => {
    const { gradeUpdates = null } = options;
    if (stats.energy < cost) { addLog("⚠️ Enerjin bitti!"); return; }
    updateGameStats({ ...effect, energy: -cost }, gradeUpdates);
    addLog(msg);
  };

  const getFinalVerdict = () => {
    const { intelligence, karma, money } = stats;
    const avgGrade = (grades.math + grades.science + grades.language) / 3;
    if (karma > 85 && avgGrade > 90) return { title: "Nobel Adayı Bir Dahi", desc: "Hem çok zekisin hem de altın gibi bir kalbin var. Dünya seni konuşacak." };
    if (avgGrade > 95) return { title: "Akademik Efsane", desc: "Okul hayatın boyunca hiçbir sınavda takılmadın. Geleceğin profesörü sensin." };
    if (karma < 20 && money > 5000) return { title: "Acımasız Milyarder", desc: "Zirveye çıkarken çok kalp kırdın ama artık en tepedesin." };
    return { title: "Kendi Yolunu Arayan Gezgin", desc: "18 yıllık maraton bitti. Şimdi kendi kanatlarınla uçma vakti." };
  };

  if (phase === 'ENDING') {
    const verdict = getFinalVerdict();
    return (
      <SafeAreaView style={styles.gameContainer}>
        <View style={styles.endingCard}>
          <Text style={styles.emoji}>🌅</Text>
          <Text style={styles.title}>YOLUN SONU</Text>
          <Text style={styles.subtitle}>18 yıllık yazgın şekillendi, {playerName}.</Text>
          <View style={styles.finalStatsBox}>
             <Text style={styles.finalVerdictTitle}>Kaderin:</Text>
             <Text style={styles.finalVerdictText}>{verdict.title}</Text>
             <Text style={styles.finalVerdictDesc}>{verdict.desc}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => setPhase('SETUP')}>
            <Text style={styles.buttonText}>YENİ BİR HAYAT</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.gameContainer}>
      <StatusBar barStyle="light-content" />
      <ReportCard visible={showReportCard} grades={grades} onClose={() => setShowReportCard(false)} playerName={playerName} age={age} />
      
      {phase === 'SETUP' ? (
        <View style={styles.card}>
          <Text style={styles.emoji}>👁️</Text>
          <Text style={styles.title}>YAZGI</Text>
          <TextInput style={styles.input} placeholder="İsim Gir..." placeholderTextColor="#666" value={playerName} onChangeText={setPlayerName} />
          <TouchableOpacity style={styles.button} onPress={handleStartGame}><Text style={styles.buttonText}>BAŞLA</Text></TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{playerName}</Text>
              <Text style={styles.headerSubtitle}>{age} Yaş • {turn}/4. Dönem</Text>
            </View>
            <View style={styles.gradeHeader}>
                <Text style={styles.gradeLabel}>ORTALAMA</Text>
                <Text style={styles.gradeValue}>{Math.round((grades.math + grades.science + grades.language)/3)}</Text>
            </View>
            <TouchableOpacity style={styles.ageButton} onPress={advanceTurn}><Text style={styles.ageButtonText}>{turn === 4 ? "YILI BİTİR" : "TUR ATLA"}</Text></TouchableOpacity>
          </View>

          <View style={styles.traitsSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {traits.map((t, i) => (
                <View key={i} style={styles.traitBadge}><Text style={styles.traitText}>✨ {t.name}</Text></View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.statsGrid}>
            <StatBox label="❤️ Sağ" value={stats.health} color="#ef4444" age={age} statKey="health" />
            <StatBox label="🧠 Zek" value={stats.intelligence} color="#3b82f6" age={age} statKey="intelligence" />
            <StatBox label="⚡ Ene" value={stats.energy} color="#eab308" age={age} statKey="energy" />
            <StatBox label="💰 Par" value={stats.money} color="#22c55e" age={age} statKey="money" showRaw />
            <StatBox label="🎭 Kar" value={stats.charisma} color="#ec4899" age={age} statKey="charisma" />
            <StatBox label="🛡️ Dis" value={stats.discipline} color="#8b5cf6" age={age} statKey="discipline" />
          </View>

          <View style={styles.mainArea}>
            {activeTab === 'MAIN' ? (
              <View style={styles.menuGrid}>
                {age < 7 && (
                  <>
                    <MenuButton icon="🧸" title="Oyna" color="#3b82f6" onPress={() => handleAction(10, {health: 2, charisma: 1}, "Oynadın.")} />
                    <MenuButton icon="👀" title="Keşfet" color="#10b981" onPress={() => handleAction(15, {intelligence: 2}, "Etrafı keşfettin.")} />
                    <MenuButton icon="🤗" title="Kucak" color="#ec4899" onPress={() => handleAction(5, {familyRelation: 10, karma: 2}, "Ailenle bağ kurdun.")} />
                  </>
                )}
                {age >= 7 && <MenuButton icon="📚" title="Eğitim" color="#8b5cf6" onPress={() => setActiveTab('EDUCATION')} />}
                {age >= 5 && <MenuButton icon="🏀" title="Spor" color="#f97316" onPress={() => setActiveTab('SPORT')} />}
                {age >= 12 && <MenuButton icon="👥" title="Sosyal" color="#f59e0b" onPress={() => setActiveTab('SOCIAL')} />}
                <MenuButton icon="🎒" title="Arkadaşlar" color="#6366f1" onPress={() => setActiveTab('FRIENDS')} />
                <MenuButton icon="💼" title="Çanta" color="#64748b" onPress={() => setActiveTab('INV')} />
              </View>
            ) : (
              <View style={styles.subMenuContainer}>
                <View style={styles.subMenuHeader}>
                    <Text style={styles.subMenuTitle}>{activeTab}</Text>
                    <TouchableOpacity onPress={() => setActiveTab('MAIN')}><Text style={styles.backBtn}>← GERİ</Text></TouchableOpacity>
                </View>
                <ScrollView style={{flex:1}}>
                    {activeTab === 'EDUCATION' && (
                        <>
                            <ActionRow name="Ders Çalış (Genel)" cost={25} onPress={() => handleAction(25, {intelligence: 1, discipline: 1}, "Tüm derslere biraz göz attın.", {gradeUpdates: {math: 2, science: 2, language: 2}})} />
                            <ActionRow name="Matematik Odaklan" cost={30} onPress={() => handleAction(30, {intelligence: 2}, "Problem çözmekten beynin yandı.", {gradeUpdates: {math: 8, science: -2}})} />
                            <ActionRow name="Özel Ders (100 💰)" cost={40} onPress={() => { if(stats.money >= 100) handleAction(40, {intelligence: 5}, "Hocadan çok şey kaptın.", {gradeUpdates: {math: 15, science: 15, language: 15}, money: -100}); else addLog("❌ Paran yetmiyor!"); }} />
                        </>
                    )}
                    {activeTab === 'FRIENDS' && npcs.map((npc, i) => (
                        <View key={i} style={styles.npcRow}><Text style={styles.npcName}>{npc.name} ({npc.role})</Text><Text style={styles.npcRelation}>%{npc.relationship}</Text></View>
                    ))}
                    {activeTab === 'INV' && (inventory.length > 0 ? inventory.map((item, i) => <View key={i} style={styles.npcRow}><Text style={styles.npcName}>{item}</Text></View>) : <Text style={styles.logText}>Çantan boş.</Text>)}
                </ScrollView>
              </View>
            )}
          </View>
          <View style={styles.logArea}><ScrollView>{history.map((item, index) => (<Text key={index} style={[styles.logText, index === 0 && {color: '#fff'}]}>• {item.message}</Text>))}</ScrollView></View>
        </>
      )}

      <Modal visible={showEventModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {!showResult ? (
              <>
                <Text style={styles.eventText}>{currentEvent?.text}</Text>
                <View style={styles.choiceContainer}>
                  {currentEvent?.choices?.map((choice: any, idx: number) => (
                    <TouchableOpacity key={idx} style={styles.choiceButton} onPress={() => { 
                        const filteredEffect = { ...choice.effect };
                        delete filteredEffect.karma;
                        setLastChanges(filteredEffect); 
                        updateGameStats(choice.effect, choice.gradeUpdates); 
                        setResultFeedback(choice.feedback); 
                        setShowResult(true); 
                    }}><Text style={choice.text.length > 30 ? styles.choiceButtonTextSmall : styles.choiceButtonText}>{choice.text}</Text></TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.resultTitle}>Sonuç</Text><Text style={styles.resultText}>{resultFeedback}</Text>
                <View style={styles.changeList}>{lastChanges && Object.keys(lastChanges).map((key: any) => (<Text key={key} style={[styles.changeItem, {color: lastChanges[key] >= 0 ? '#22c55e' : '#ef4444'}]}>{lastChanges[key] >= 0 ? '+' : ''}{lastChanges[key]} {key.toUpperCase()}</Text>))}</View>
                <TouchableOpacity style={styles.continueButton} onPress={() => {setShowEventModal(false); setShowResult(false);}}><Text style={styles.continueButtonText}>DEVAM ET</Text></TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const StatBox = ({ label, value, color, showRaw, age, statKey }: any) => {
  const cap = getStatCap(age, statKey, null, []);
  return (
    <View style={styles.statBox}>
      <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom: 3}}><Text style={styles.statLabel}>{label}</Text><Text style={[styles.statValue, {color}]}>{Math.round(value)}{!showRaw && `/${cap}`}</Text></View>
      <View style={styles.barBackground}>
        <View style={[styles.barForeground, { width: `${Math.min((value/cap)*100, 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const ActionRow = ({ name, cost, onPress }: any) => (
  <TouchableOpacity style={styles.actionRow} onPress={onPress}><Text style={styles.actionRowTitle}>{name}</Text><Text style={styles.actionRowCost}>{cost} ⚡</Text></TouchableOpacity>
);

const MenuButton = ({ icon, title, color, onPress }: any) => (
  <TouchableOpacity style={[styles.menuBtn, { backgroundColor: color + '15', borderColor: color + '40' }]} onPress={onPress}><Text style={styles.menuIcon}>{icon}</Text><Text style={[styles.menuTitle, { color }]}>{title}</Text></TouchableOpacity>
);

const styles = StyleSheet.create({
  gameContainer: { flex: 1, backgroundColor: '#0a0a0a', padding: 15 },
  card: { backgroundColor: '#161616', padding: 40, borderRadius: 30, width: '90%', alignSelf: 'center', marginTop: '20%', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  endingCard: { backgroundColor: '#161616', padding: 30, borderRadius: 30, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  emoji: { fontSize: 80, marginBottom: 20 },
  title: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 30 },
  input: { width: '80%', backgroundColor: '#111', color: '#fff', padding: 18, borderRadius: 20, marginBottom: 20, textAlign: 'center', fontSize: 18 },
  button: { backgroundColor: '#3b82f6', paddingVertical: 18, paddingHorizontal: 60, borderRadius: 20, width: '100%' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 20, textAlign: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#fff' },
  headerSubtitle: { fontSize: 10, color: '#eab308', fontWeight: 'bold' },
  gradeHeader: { alignItems: 'center' },
  gradeLabel: { color: '#555', fontSize: 8, fontWeight: 'bold' },
  gradeValue: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  ageButton: { backgroundColor: '#22c55e', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  ageButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 9 },
  traitsSection: { height: 35, marginBottom: 10 },
  traitBadge: { backgroundColor: '#1e1e1e', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#333' },
  traitText: { color: '#eab308', fontSize: 10, fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
  statBox: { width: '32%', backgroundColor: '#111', padding: 6, borderRadius: 10, marginBottom: 6, borderWidth: 1, borderColor: '#222' },
  statLabel: { color: '#555', fontSize: 8, fontWeight: 'bold' },
  statValue: { fontSize: 8, fontWeight: 'bold' },
  barBackground: { height: 2, backgroundColor: '#222', borderRadius: 1, overflow: 'hidden' },
  barForeground: { height: '100%' },
  mainArea: { flex: 3, marginBottom: 10 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 10 },
  menuBtn: { width: '30%', aspectRatio: 1, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  menuIcon: { fontSize: 20, marginBottom: 2 },
  menuTitle: { fontSize: 7, fontWeight: 'bold', textTransform: 'uppercase' },
  subMenuContainer: { flex: 1, backgroundColor: '#111', borderRadius: 25, padding: 15, borderWidth: 1, borderColor: '#222' },
  subMenuHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
  subMenuTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  backBtn: { color: '#3b82f6', fontSize: 12, fontWeight: 'bold' },
  npcRow: { backgroundColor: '#161616', padding: 15, borderRadius: 15, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  npcName: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  npcRelation: { color: '#eab308', fontSize: 12 },
  actionRow: { backgroundColor: '#161616', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  actionRowTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  actionRowCost: { color: '#eab308', fontWeight: 'bold', fontSize: 10 },
  logArea: { flex: 1, backgroundColor: '#111', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: '#1a1a1a' },
  logText: { color: '#444', fontSize: 10, marginBottom: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#161616', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: '#333', width: '100%' },
  eventText: { color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 25, lineHeight: 26 },
  choiceContainer: { gap: 10 },
  choiceButton: { backgroundColor: '#222', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#333' },
  choiceButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  choiceButtonTextSmall: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 12 },
  resultTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  resultText: { color: '#ccc', fontSize: 16, textAlign: 'center', marginBottom: 20, lineHeight: 24 },
  changeList: { backgroundColor: '#000', padding: 15, borderRadius: 15, marginBottom: 25, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  changeItem: { fontSize: 11, fontWeight: '900' },
  continueButton: { backgroundColor: '#3b82f6', padding: 18, borderRadius: 15 },
  continueButtonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  finalStatsBox: { backgroundColor: '#222', padding: 20, borderRadius: 20, width: '100%', marginBottom: 20, alignItems: 'center' },
  finalVerdictTitle: { color: '#eab308', fontSize: 14, fontWeight: 'bold', marginBottom: 5 },
  finalVerdictText: { color: '#fff', fontSize: 22, fontWeight: '900', textAlign: 'center', marginBottom: 10 },
  finalVerdictDesc: { color: '#aaa', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  summaryText: { color: '#ccc', fontSize: 14, fontWeight: 'bold' }
});
