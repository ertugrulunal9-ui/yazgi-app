import React from 'react';
import { FloatingText as FloatingTextType } from '../types';

interface Props {
  texts: FloatingTextType[];
}

export const FloatingText: React.FC<Props> = ({ texts }) => {
  return (
    <>
      <style>{`
        @keyframes arcadeFloat {
            0% {
                opacity: 0;
                transform: translate(-50%, 0) scale(0.5);
            }
            15% {
                opacity: 1;
                transform: translate(-50%, -25px) scale(1.3);
            }
            30% {
                transform: translate(-50%, -35px) scale(1);
            }
            70% {
                opacity: 1;
                transform: translate(-50%, -80px);
            }
            100% {
                opacity: 0;
                transform: translate(-50%, -120px);
            }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
        {texts.map((text) => (
          <TextItem key={text.id} item={text} />
        ))}
      </div>
    </>
  );
};

const TextItem: React.FC<{ item: FloatingTextType }> = ({ item }) => {
  return (
    <div
      className={`absolute font-black text-2xl md:text-4xl select-none whitespace-nowrap z-50 ${item.color}`}
      style={{
        left: item.x,
        top: item.y,
        animation: 'arcadeFloat 2s ease-out forwards',
        textShadow: '2px 2px 0px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
      }}
    >
      {item.text}
    </div>
  );
};

export default FloatingText;