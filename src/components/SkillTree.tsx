import React from 'react';
import { Skills, Talent } from '../types';

interface SkillTreeProps {
  skills: Skills;
  talent: Talent;
  onBack: () => void;
}

export const SkillTree = React.memo<SkillTreeProps>(({ skills, talent, onBack }) => {
  return (
    <div className="flex flex-col items-center w-full max-w-4xl p-4 md:p-8 animate-fade-in">
      <div className="flex items-center mb-8 w-full relative justify-center">
        <button 
          onClick={onBack} 
          className="pressable absolute left-0 text-sm font-bold surface-raised border border-default px-3 py-2 rounded-lg"
        >
          ← Geri
        </button>
        <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
          Yetenek Ağacı
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <SkillColumn 
          title="Yazılım" 
          icon="💻" 
          level={skills.coding} 
          color="cyan" 
          hasTalent={talent === 'CODING'}
          milestones={[
            { lvl: 30, text: "Freelance İşler", desc: "Basit web siteleri yaparak para kazanabilirsin.", unlocked: skills.coding >= 30 },
            { lvl: 50, text: "Hackathon", desc: "Zeka gerektiren özel etkinlikler açılır.", unlocked: skills.coding >= 50 },
            { lvl: 70, text: "Kıdemli Müh.", desc: "Yazılım Mühendisliği kariyeri garantilenir.", unlocked: skills.coding >= 70 },
            { lvl: 100, text: "Teknoloji Devi", desc: "Kendi şirketini kurma potansiyeli.", unlocked: skills.coding >= 100 }
          ]}
        />

        <SkillColumn 
          title="Müzik" 
          icon="🎸" 
          level={skills.music} 
          color="pink" 
          hasTalent={talent === 'MUSIC'}
          milestones={[
            { lvl: 30, text: "Sokak Müziği", desc: "İstiklal'de gitar çalarak harçlık çıkar.", unlocked: skills.music >= 30 },
            { lvl: 50, text: "Bestekar", desc: "Konservatuar teklifi alma şansı.", unlocked: skills.music >= 50 },
            { lvl: 85, text: "Rockstar", desc: "Dünyaca ünlü bir müzisyen olma yolu.", unlocked: skills.music >= 85 },
            { lvl: 100, text: "Virtüöz", desc: "Adını müzik tarihine altın harflerle yazdır.", unlocked: skills.music >= 100 }
          ]}
        />

        <SkillColumn 
          title="Spor" 
          icon="⚽" 
          level={skills.sports} 
          color="orange" 
          hasTalent={talent === 'SPORTS'}
          milestones={[
            { lvl: 40, text: "Okul Takımı", desc: "Okul takımına seçilme şansı.", unlocked: skills.sports >= 40 },
            { lvl: 60, text: "Kaptan", desc: "Fiziksel olaylarda (kavga vb.) üstünlük.", unlocked: skills.sports >= 60 },
            { lvl: 90, text: "Milli Sporcu", desc: "Olimpiyat seviyesinde bir kariyer.", unlocked: skills.sports >= 90 },
            { lvl: 100, text: "Efsane", desc: "Heykelin dikilir.", unlocked: skills.sports >= 100 }
          ]}
        />
      </div>
    </div>
  );
});

interface Milestone {
  lvl: number;
  text: string;
  desc: string;
  unlocked: boolean;
}

const SkillColumn = ({ title, icon, level, color, hasTalent, milestones }: any) => {
  const getGradient = () => {
    if (color === 'cyan') return 'from-cyan-500 to-blue-600';
    if (color === 'pink') return 'from-pink-500 to-rose-600';
    return 'from-orange-500 to-amber-600';
  };

  const getTextColor = () => {
    if (color === 'cyan') return 'text-cyan-400';
    if (color === 'pink') return 'text-pink-400';
    return 'text-orange-400';
  };

  return (
    <div className={`ui-card rounded-2xl overflow-hidden flex flex-col relative ${hasTalent ? 'ring-2 ring-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : ''}`}>
      <div className={`p-6 bg-gradient-to-br ${getGradient()} relative overflow-hidden`}>
        {hasTalent && (
             <div className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                 YETENEK
             </div>
        )}
        <div className="text-4xl mb-2">{icon}</div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex items-end gap-1 mt-1">
            <span className="text-4xl font-black">{level}</span>
            <span className="text-sm font-medium opacity-80 mb-1">/100</span>
        </div>
      </div>

        <div className="p-4 space-y-4 flex-1">
        {milestones.map((m: Milestone, idx: number) => (
          <div key={idx} className={`relative pl-4 border-l-2 ${m.unlocked ? `border-cyan-500` : 'border-default'} pb-4 last:pb-0`}>
            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 ${m.unlocked ? 'surface-base border-cyan-500' : 'surface-base border-default'} flex items-center justify-center text-[10px] font-bold`}>
                    {m.unlocked ? '✓' : ''}
                </div>

                <div className={`${m.unlocked ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                    <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold uppercase tracking-wider ${m.unlocked ? getTextColor() : 'text-gray-500'}`}>
                            Seviye {m.lvl}
                        </span>
                        {m.unlocked && <span className="text-[10px] surface-overlay px-2 rounded">AÇIK</span>}
                    </div>
                    <div className="font-bold text-white text-lg leading-none mb-1">{m.text}</div>
                      <div className="text-xs text-secondary leading-snug">{m.desc}</div>
                </div>
            </div>
        ))}
      </div>
      
                <div className="h-2 w-full surface-base">
          <div className={`h-full bg-gradient-to-r ${getGradient()}`} style={{ width: `${level}%` }}></div>
      </div>
    </div>
  );
};

export default SkillTree;