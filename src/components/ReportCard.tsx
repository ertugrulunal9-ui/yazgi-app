import React, { useMemo } from 'react';
import { SchoolGrades, Family } from '../types';
import { getLetterGrade } from '../utils/schoolLogic';

interface ReportCardProps {
  grades: SchoolGrades;
  family: Family;
  onClose: () => void;
  age: number;
}

const ReportCard = React.memo<ReportCardProps>(({ grades, family, onClose, age }) => {
  const average = useMemo(() => 
    Math.round((grades.math + grades.science + grades.language) / 3),
    [grades.math, grades.science, grades.language]
  );
  
  const getGradeColor = (score: number) => {
        if (score >= 60) return 'accent-grade-text';
        return 'accent-grade-text opacity-60';
  };

  const getBgColor = (score: number) => {
        if (score >= 60) return 'accent-grade-bg accent-grade-border';
        return 'accent-grade-bg accent-grade-border opacity-60';
  }

  const getStatusMessage = (avg: number) => {
      if (avg >= 85) return "ONUR BELGESİ";
      if (avg >= 70) return "TEŞEKKÜR";
      if (avg >= 60) return "SINIFI GEÇTİ";
      return "SINIF TEKRARI";
  };

  // Aile dinamiğine göre veli tepkisi
  const getParentReaction = () => {
    if (average >= 85) {
      return family.dynamic === 'SUPPORTIVE' ? '🎉 "Seninle gurur duyuyoruz!"' :
             family.dynamic === 'STRICT' ? '📚 "İyi ama daha da iyisini bekleriz."' :
             '🎊 "Harika! Gel sarılalım!"';
    }
    if (average >= 60) {
      return family.dynamic === 'SUPPORTIVE' ? '👍 "Fena değil, devam et."' :
             family.dynamic === 'STRICT' ? '😤 "Bu notlar kabul edilemez!"' :
             '🤷 "Ehh, olsun..."';
    }
    return family.dynamic === 'SUPPORTIVE' ? '😟 "Seneye telafi ederiz."' :
           family.dynamic === 'STRICT' ? '😡 "Cep telefonu yasak!"' :
           '🙄 "Bize mi çektin acaba..."';
  };

  return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
            <div className="ui-modal w-full max-w-md overflow-hidden relative transform transition-all scale-100">
        
                <div className="surface-base p-6 text-center relative border-b border-default">
                        <h2 className="text-2xl font-black uppercase tracking-widest">Yıl Sonu Karnesi</h2>
                        <div className="text-secondary text-sm font-mono mt-1">ÖĞRENCİ YAŞI: {age}</div>
            
                        <div className={`absolute top-1/2 -translate-y-1/2 right-6 w-16 h-16 rounded-full flex items-center justify-center border-4 text-xl font-bold surface-raised ${getGradeColor(average)} border-current`}>
                {average}
            </div>
        </div>

                <div className="p-6 space-y-4 surface-overlay">
            
            <div className="space-y-3">
                <GradeItem label="Matematik" score={grades.math} colorFn={getGradeColor} bgFn={getBgColor} />
                <GradeItem label="Fen Bilgisi" score={grades.science} colorFn={getGradeColor} bgFn={getBgColor} />
                <GradeItem label="Yabancı Dil" score={grades.language} colorFn={getGradeColor} bgFn={getBgColor} />
            </div>

            <div className="mt-6 flex justify-center">
                <div className={`
                    border-4 rounded-lg px-6 py-2 text-xl font-black uppercase tracking-widest rotate-[-5deg] opacity-90 shadow-sm
                    ${average >= 60 ? 'accent-grade-border accent-grade-text' : 'border-red-500 text-red-500'}
                `}>
                    {getStatusMessage(average)}
                </div>
            </div>

            <div className="text-[10px] text-secondary text-center mt-4">
                *Notlar zeka, stres seviyesi ve şans faktörüne göre hesaplanmıştır.
            </div>
        </div>

        <div className="p-4 surface-raised border-t border-default">
            <div className="text-center text-sm text-secondary mb-3 italic">
                {getParentReaction()}
            </div>
            <button
                onClick={onClose}
                className="pressable w-full py-3 accent-event-bg accent-event-border text-white font-bold rounded-xl flex items-center justify-center gap-2"
            >
                <span>Tamam</span>
                <span className="text-xl">→</span>
            </button>
        </div>
      </div>
    </div>
  );
});

const GradeItem = ({ label, score, colorFn, bgFn }: any) => (
    <div className={`flex justify-between items-center p-3 rounded-xl border ${bgFn(score)}`}>
        <span className="font-bold">{label}</span>
        <div className="flex items-center gap-3">
            <span className="text-sm font-mono text-secondary">{score}/100</span>
            <span className={`text-xl font-black ${colorFn(score)} w-6 text-center`}>
                {getLetterGrade(score)}
            </span>
        </div>
    </div>
);

export default ReportCard;