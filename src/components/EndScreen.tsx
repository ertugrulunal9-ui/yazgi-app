import React, { useEffect, useMemo } from 'react';
import { GameState, Stats } from '../types';
import { calculateCareerResult, getSocialEndResult } from '../utils/gameUtils';
import { getTrait } from '../data/traits';
import { monetizationService } from '../services/monetization';
import { buildLifeReflection, KeyDecision } from '../utils/memoryLogic';
import { getPersonalityArchetype, getArchetypeDescription } from '../utils/personalitySystem';

interface EndScreenProps {
  stats: Stats;
  gameState: GameState;
  playerName: string;
  onRestart: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({ stats, gameState, playerName, onRestart }) => {
  const result = calculateCareerResult(gameState, stats);
  const socialResult = getSocialEndResult(gameState.npcs);
  const lifeReflection = useMemo(() =>
    buildLifeReflection(gameState.memories ?? [], gameState.personality),
    [gameState.memories, gameState.personality]
  );
  const archetype = useMemo(() => getPersonalityArchetype(gameState.personality), [gameState.personality]);
  const archetypeDesc = useMemo(() => getArchetypeDescription(archetype), [archetype]);

  // Show interstitial ad on game over (if not premium)
  useEffect(() => {
    const showAd = async () => {
      const hasRemoveAds = await monetizationService.hasProduct('remove_ads');
      if (!hasRemoveAds) {
        await monetizationService.showInterstitialAd();
      }
    };
    showAd();
  }, []);

  const getResultColor = () => {
    switch (result.type) {
      case 'LEGENDARY': return 'bg-gradient-to-br from-amber-400 to-yellow-600 border-yellow-300';
      case 'SUCCESS': return 'bg-gradient-to-br from-emerald-500 to-teal-700 border-emerald-400';
      case 'NORMAL': return 'bg-gradient-to-br from-blue-500 to-indigo-700 border-blue-400';
      case 'FAILURE': return 'bg-gradient-to-br from-gray-600 to-gray-800 border-gray-500';
    }
  };

  return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 md:p-8 animate-fade-in surface-base overflow-y-auto">
            <div className="max-w-3xl w-full ui-modal rounded-3xl overflow-hidden">
        
                <div className="surface-base p-8 text-center border-b border-default">
                    <div className="text-sm uppercase tracking-[0.3em] text-secondary font-bold mb-2">YOLCULUĞUN SONU</div>
                    <h1 className="text-4xl md:text-5xl font-black mb-2">{playerName}</h1>
                    <div className="text-secondary text-lg">18 Yaşında, Hayata Atılıyor...</div>
        </div>

        <div className={`p-8 md:p-12 text-center text-white relative border-b-4 ${getResultColor()}`}>
           <div className="text-8xl mb-6 filter drop-shadow-xl animate-bounce-slow">{result.emoji}</div>
           <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tight drop-shadow-md">{result.title}</h2>
           <p className="text-lg md:text-xl opacity-90 font-medium max-w-2xl mx-auto leading-relaxed">
             {result.description}
           </p>
           {result.personalityNarrative && (
             <p className="text-base opacity-75 mt-3 max-w-xl mx-auto italic">
               {result.personalityNarrative}
             </p>
           )}
           {result.memoryInfluence && (
             <p className="text-sm opacity-60 mt-2 max-w-xl mx-auto">
               {result.memoryInfluence}
             </p>
           )}
        </div>

           <div className="surface-overlay p-6 border-b border-default text-center">
               <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                <span>❤️</span> Sosyal Durum
            </h3>
            <p className="text-purple-200 font-medium">{socialResult || "Kimseyle derin bir bağ kuramadan mezun oldun."}</p>
        </div>

        {/* KİM OLDUN? - Kişilik Arketipi */}
        <div className="surface-overlay p-6 border-b border-default">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>🪞</span> Kim Oldun?
            </h3>
            <p className="font-medium mb-3">{archetypeDesc}</p>
            <div className="grid grid-cols-5 gap-2">
                <PersonalityBar label="Açıklık" value={gameState.personality.openness} />
                <PersonalityBar label="Cesaret" value={gameState.personality.courage} />
                <PersonalityBar label="Empati" value={gameState.personality.empathy} />
                <PersonalityBar label="Sabır" value={gameState.personality.patience} />
                <PersonalityBar label="Uyum" value={gameState.personality.conformity} />
            </div>
        </div>

        {/* HAYAT YOLCULUĞUN - Timeline */}
        {lifeReflection.keyDecisions.length > 0 && (
        <div className="surface-overlay p-6 border-b border-default">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                <span>📖</span> Hayat Yolculuğun
            </h3>
            <div className="space-y-3">
                {lifeReflection.keyDecisions.map((decision, index) => (
                    <TimelineItem key={`${decision.eventId}-${index}`} decision={decision} />
                ))}
            </div>
            <p className="mt-4 text-secondary italic text-sm text-center">
                {lifeReflection.summaryNarrative}
            </p>
        </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            
            <div className="p-8 border-b md:border-b-0 md:border-r border-default surface-overlay">
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span>💬</span> Aile Tepkisi
                    </h3>
                    <div className="surface-raised p-4 rounded-xl border border-default italic relative">
                        <span className="absolute -top-3 -left-2 text-4xl text-secondary opacity-50">"</span>
                        {result.familyReaction}
                        <span className="absolute -bottom-6 -right-2 text-4xl text-secondary opacity-50">"</span>
                    </div>
                </div>
                {result.influences?.length ? (
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span>{String.fromCodePoint(0x1F393)}</span> Akademik Etki
                        </h3>
                        <div className="space-y-2">
                            {result.influences.map((item, index) => (
                                <div key={`${item}-${index}`} className="surface-raised p-3 rounded-xl border border-default text-sm text-secondary">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

                <div>
                    <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span>🧬</span> Kazanılan Özellikler
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {gameState.traits.length > 0 ? gameState.traits.map(t => {
                            const trait = getTrait(t);
                            return (
                                <span key={t} className={`px-3 py-1 rounded text-xs font-bold ${
                                    trait?.type === 'POSITIVE' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' :
                                    trait?.type === 'NEGATIVE' ? 'bg-rose-900/50 text-rose-400 border border-rose-800' :
                                    'bg-gray-800 text-gray-300 border border-gray-700'
                                }`}>
                                    {trait?.name}
                                </span>
                            )
                        }) : (
                            <span className="text-secondary text-sm italic">Hiçbir özellik kazanılmadı.</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-8 surface-overlay">
                 <h3 className="text-sm font-bold text-secondary uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span>📊</span> İstatistik Özeti
                </h3>
                <div className="space-y-4">
                    <StatRow label="Zeka" value={stats.intelligence} color="text-blue-400" />
                    <StatRow label="Disiplin" value={stats.discipline} color="text-purple-400" />
                    <StatRow label="Karizma" value={stats.charisma} color="text-pink-400" />
                    <StatRow label="Para" value={stats.money} color="text-green-400" isCurrency />
                    <StatRow label="Mutluluk" value={stats.health} color="text-red-400" />
                </div>

                <div className="mt-8 pt-6 border-t border-default">
                    <h4 className="text-xs font-bold text-secondary uppercase mb-2">En İyi Yetenek</h4>
                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                        {gameState.skills.coding >= gameState.skills.music && gameState.skills.coding >= gameState.skills.sports ? (
                            <>💻 Yazılım: <span className="text-cyan-400">{gameState.skills.coding}</span></>
                        ) : gameState.skills.music >= gameState.skills.sports ? (
                            <>🎸 Müzik: <span className="text-pink-400">{gameState.skills.music}</span></>
                        ) : (
                             <>⚽ Spor: <span className="text-orange-400">{gameState.skills.sports}</span></>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <div className="p-8 surface-base text-center border-t border-default">
            <button 
                onClick={onRestart}
                className={`pressable px-8 py-4 rounded-xl font-bold text-lg shadow-xl ${
                    result.type === 'FAILURE' ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'surface-raised border border-default'
                }`}
            >
                🔄 Yeni Bir Hayata Başla
            </button>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value, color, isCurrency }: any) => (
    <div className="flex justify-between items-center p-3 surface-base rounded-lg border border-default">
        <span className="text-secondary font-medium">{label}</span>
        <span className={`font-mono font-bold text-lg ${color}`}>
            {Math.round(value)}{isCurrency && ' TL'}
        </span>
    </div>
);

const EMOTION_ICONS: Record<string, string> = {
  PRIDE: '⭐',
  SATISFACTION: '😊',
  REGRET: '😔',
  GUILT: '😞',
  NEUTRAL: '🔹',
};

const EMOTION_COLORS: Record<string, string> = {
  PRIDE: 'border-amber-500',
  SATISFACTION: 'border-emerald-500',
  REGRET: 'border-blue-500',
  GUILT: 'border-rose-500',
  NEUTRAL: 'border-gray-500',
};

const TimelineItem = ({ decision }: { decision: KeyDecision }) => (
  <div className={`flex items-start gap-3 pl-3 border-l-2 ${EMOTION_COLORS[decision.emotion] ?? 'border-gray-500'}`}>
    <div className="flex-shrink-0 text-lg">{EMOTION_ICONS[decision.emotion] ?? '🔹'}</div>
    <div>
      <div className="text-xs text-secondary font-bold">{decision.age} Yaşında</div>
      <div className="text-sm font-medium">{decision.narrativeLine}</div>
    </div>
  </div>
);

const PersonalityBar = ({ label, value }: { label: string; value: number }) => (
  <div className="text-center">
    <div className="text-xs text-secondary mb-1">{label}</div>
    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all w-[${value}%]`}
      />
    </div>
    <div className="text-xs font-mono mt-1">{value}</div>
  </div>
);

export default EndScreen;
