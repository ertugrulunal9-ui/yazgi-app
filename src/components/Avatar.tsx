/**
 * Avatar — düz çizim karakter portresi (react-native-svg).
 *
 * 100x100'lük bir çerçevede çizilir ve `size`'a ölçeklenir. Yaşa göre 5 dönem
 * (bebek → genç), cinsiyete göre saç şekli, kayıttaki ten/saç rengi ve aksesuar,
 * ruh hâline göre yüz ifadesi ve arka plan rengi değişir.
 */

import React, { useId } from 'react';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';
import type { AvatarConfig, PlayerGender } from '../types/core';
import type { AvatarMood } from '../utils/avatarMood';

// Ten tonu renkleri
const SKIN_COLORS = ['#FDDBB4', '#F0C27F', '#C68642', '#8D5524'] as const;

// Saç renkleri
const HAIR_COLORS = ['#1a1a1a', '#6B3A2A', '#C8A951', '#A0522D'] as const;

const EYE_COLOR = '#2B1B14';
const MOUTH_COLOR = '#8A3B2E';
const BLUSH_COLOR = '#F29C8E';
const TEAR_COLOR = '#7FC4E8';
const HAIR_ACCENT = '#E86A92';
const FRAME_COLOR = '#1f2937';
const CAP_COLOR = '#D9534F';
const CAP_SHADE = '#B8423F';

export type AvatarAgeStage = 'BABY' | 'PRESCHOOL' | 'PRIMARY' | 'TEEN' | 'YOUNG';

export const getAvatarAgeStage = (age: number): AvatarAgeStage => {
  if (age <= 2) return 'BABY';
  if (age <= 6) return 'PRESCHOOL';
  if (age <= 10) return 'PRIMARY';
  if (age <= 14) return 'TEEN';
  return 'YOUNG';
};

interface StageGeometry {
  bg: string;
  head: { cy: number; rx: number; ry: number };
  /** Genç dönemde çene hatlı kafa; yoksa elips kullanılır */
  headPath?: string;
  /** Şapka yerleşimi için kafanın tepe noktası */
  headTop: number;
  ears: { y: number; dx: number; r: number };
  eyes: { y: number; dx: number; r: number };
  browY: number;
  noseY: number;
  mouthY: number;
  mouthW: number;
  cheek: { y: number; dx: number; rx: number; ry: number };
}

const STAGES: Record<AvatarAgeStage, StageGeometry> = {
  BABY: {
    bg: '#3a2d4d',
    head: { cy: 46, rx: 27, ry: 26 },
    headTop: 20,
    ears: { y: 49, dx: 28, r: 5 },
    eyes: { y: 49, dx: 10, r: 3.8 },
    browY: 41.5,
    noseY: 54,
    mouthY: 58,
    mouthW: 4,
    cheek: { y: 57, dx: 17, rx: 4.5, ry: 3 },
  },
  PRESCHOOL: {
    bg: '#2d3f4f',
    head: { cy: 44, rx: 24, ry: 24 },
    headTop: 20,
    ears: { y: 46, dx: 23.5, r: 4.5 },
    eyes: { y: 47, dx: 9, r: 3.3 },
    browY: 40,
    noseY: 51,
    mouthY: 56,
    mouthW: 6,
    cheek: { y: 54, dx: 16, rx: 3.8, ry: 2.5 },
  },
  PRIMARY: {
    bg: '#23324d',
    head: { cy: 42, rx: 22, ry: 23 },
    headTop: 19,
    ears: { y: 44, dx: 21.5, r: 4.2 },
    eyes: { y: 44, dx: 9, r: 3 },
    browY: 37.5,
    noseY: 48.5,
    mouthY: 54,
    mouthW: 5,
    cheek: { y: 51, dx: 15, rx: 3.3, ry: 2.2 },
  },
  TEEN: {
    bg: '#2b3a35',
    head: { cy: 40, rx: 20, ry: 22.5 },
    headTop: 17.5,
    ears: { y: 42, dx: 19.5, r: 4 },
    eyes: { y: 41.5, dx: 8.5, r: 2.8 },
    browY: 35,
    noseY: 46,
    mouthY: 52,
    mouthW: 4.5,
    cheek: { y: 48, dx: 14, rx: 3.4, ry: 2.2 },
  },
  YOUNG: {
    bg: '#33304a',
    head: { cy: 38, rx: 19, ry: 22.5 },
    headPath: 'M31 36 C31 22 40 15.5 50 15.5 C60 15.5 69 22 69 36 C69 48 63 59 50 60.5 C37 59 31 48 31 36 Z',
    headTop: 15.5,
    ears: { y: 40, dx: 18.5, r: 3.8 },
    eyes: { y: 38.5, dx: 8, r: 2.6 },
    browY: 32,
    noseY: 43,
    mouthY: 50,
    mouthW: 4.5,
    cheek: { y: 46, dx: 13, rx: 3.2, ry: 2 },
  },
};

const MOOD_BACKGROUNDS: Partial<Record<AvatarMood, string>> = {
  HAPPY: '#3d3528',
  SAD: '#23304a',
  STRESSED: '#40292b',
};

/** Rengi açar (amount > 0) ya da koyulaştırır (amount < 0). */
const shade = (hex: string, amount: number): string => {
  const value = parseInt(hex.slice(1), 16);
  const channel = (c: number) => Math.max(0, Math.min(255, Math.round(
    amount < 0 ? c * (1 + amount) : c + (255 - c) * amount
  )));
  const r = channel((value >> 16) & 255);
  const g = channel((value >> 8) & 255);
  const b = channel(value & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

const renderClothes = (stage: AvatarAgeStage, neckColor: string): React.ReactNode => {
  switch (stage) {
    case 'BABY':
      return (
        <>
          <Rect x={45} y={66} width={10} height={14} fill={neckColor} />
          <Ellipse cx={50} cy={100} rx={27} ry={22} fill="#8EC9E0" />
          <Path d="M41 80 Q50 87 59 80" stroke="#ffffff" strokeWidth={3} fill="none" strokeLinecap="round" />
        </>
      );
    case 'PRESCHOOL':
      return (
        <>
          <Rect x={45} y={60} width={10} height={20} fill={neckColor} />
          <Ellipse cx={50} cy={102} rx={30} ry={24} fill="#F4A261" />
          <Path d="M43 79.5 Q50 85 57 79.5" stroke="#D9884A" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </>
      );
    case 'PRIMARY':
      return (
        <>
          <Rect x={45.5} y={60} width={9} height={14} fill={neckColor} />
          <Ellipse cx={50} cy={98} rx={33} ry={25} fill="#2F4B7C" />
          <Path d="M40.5 73.5 Q45 82 50 78 Q55 82 59.5 73.5 L56 72.5 Q50 78 44 72.5 Z" fill="#F5F5F5" />
        </>
      );
    case 'TEEN':
      return (
        <>
          <Ellipse cx={50} cy={99} rx={35} ry={27} fill="#6C8E5E" />
          <Rect x={45.5} y={58} width={9} height={15} fill={neckColor} />
          <Path d="M37 73 Q50 86 63 73" stroke="#4F6C43" strokeWidth={4} fill="none" strokeLinecap="round" />
          <Path d="M46 79 L45 91" stroke="#E8E1C8" strokeWidth={1.5} strokeLinecap="round" />
          <Path d="M54 79 L55 91" stroke="#E8E1C8" strokeWidth={1.5} strokeLinecap="round" />
        </>
      );
    case 'YOUNG':
      return (
        <>
          <Ellipse cx={50} cy={100} rx={37} ry={28} fill="#3F5683" />
          <Path d="M42 72 L50 84 L58 72 Z" fill="#F2F2F2" />
          <Path d="M41 72 L50 87 L44 92 Z" fill="#344A73" />
          <Path d="M59 72 L50 87 L56 92 Z" fill="#344A73" />
          <Rect x={45.5} y={56} width={9} height={17} fill={neckColor} />
        </>
      );
  }
};

/** Kafanın arkasında kalan uzun saç (yalnızca kız karakter). */
const renderHairBack = (stage: AvatarAgeStage, gender: PlayerGender, color: string): React.ReactNode => {
  if (gender !== 'FEMALE') return null;
  switch (stage) {
    case 'PRESCHOOL':
      return <Path d="M25 44 C23 24 37 15 50 15 C63 15 77 24 75 44 L76 60 Q70 64 64 60 L62 46 L38 46 L36 60 Q30 64 24 60 Z" fill={color} />;
    case 'PRIMARY':
      return <Path d="M27 42 C25 22 38 14 50 14 C62 14 75 22 73 42 L75 72 Q67 76 62 70 L62 50 L38 50 L38 70 Q33 76 25 72 Z" fill={color} />;
    case 'TEEN':
      return <Path d="M29 40 C27 20 40 12 51 12 C63 12 74 20 71 40 L73 80 Q65 84 61 77 L61 50 L39 50 L39 77 Q35 84 27 80 Z" fill={color} />;
    case 'YOUNG':
      return <Path d="M30 36 C28 17 40 9 51 9 C63 9 74 17 70 36 L72 70 Q76 78 70 84 Q64 86 61 80 L61 50 L39 50 L39 80 Q36 86 30 84 Q24 78 28 70 Z" fill={color} />;
    default:
      return null;
  }
};

/** Kafanın üstündeki saç; şapka varken tepeden taşan tutamlar çizilmez. */
const renderHairFront = (
  stage: AvatarAgeStage,
  gender: PlayerGender,
  color: string,
  hasHat: boolean
): React.ReactNode => {
  const highlight = shade(color, 0.18);

  if (gender === 'FEMALE') {
    switch (stage) {
      case 'BABY':
        return hasHat ? null : (
          <>
            <Circle cx={50} cy={17.5} r={4.5} fill={color} />
            <Rect x={46} y={20.5} width={8} height={2.6} rx={1.3} fill={HAIR_ACCENT} />
          </>
        );
      case 'PRESCHOOL':
        return (
          <>
            <Path d="M26.5 40 C26 24 38 17 50 17 C62 17 74 24 73.5 40 Q66 33 60 33 L58 30 Q55 33 50 33 L48 30 Q45 33 40 33 Q32 33 26.5 40 Z" fill={color} />
            {hasHat ? null : <Path d="M59.6 25.9 L67.1 23.2 L68.1 26 L60.6 28.7 Z" fill={HAIR_ACCENT} />}
          </>
        );
      case 'PRIMARY':
        return (
          <>
            <Path d="M28 40 C27 22 40 16 52 16 C65 16 73 25 72 40 C69 31 64 26 57 25 C52 29 45 31 38 31 C33 32 30 35 28 40 Z" fill={color} />
            {hasHat ? null : <Path d="M29 33 C34 20 66 20 71 33" stroke={HAIR_ACCENT} strokeWidth={2.4} fill="none" strokeLinecap="round" />}
          </>
        );
      case 'TEEN':
        return <Path d="M29.5 40 C27 21 40 13 52 13 C65 14 73 23 71 40 C69 30 63 25 56 25 C49 28 41 34 33 36 C31 37 30 38 29.5 40 Z" fill={color} />;
      case 'YOUNG':
        return <Path d="M30.5 36 C28 18 40 10 50 11 C60 10 72 18 69.5 36 C67 26 60 20 52 18 L50 24 L48 18 C40 20 33 26 30.5 36 Z" fill={color} />;
    }
  }

  switch (stage) {
    case 'BABY':
      return hasHat ? null : (
        <Path d="M48 21 C44 14 54 10 55.5 16 C52.5 13 49.5 15 51 20.5" stroke={color} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      );
    case 'PRESCHOOL':
      return <Path d="M26 42 C24 24 40 15 52 17 C66 17 77 28 74 42 C70 34 66 31 62 32 L60 27 L56 32 L51 26 L47 32 L42 27 L38 33 C33 33 29 37 26 42 Z" fill={color} />;
    case 'PRIMARY':
      return (
        <>
          <Path d="M28 40 C27 22 40 15 52 16 C65 16 74 25 72 40 C70 32 66 27 58 26 C50 25 42 27 36 31 C32 33 29 36 28 40 Z" fill={color} />
          <Path d="M55 17 Q52 22 46 26" stroke={highlight} strokeWidth={1.2} fill="none" />
        </>
      );
    case 'TEEN':
      return (
        <>
          <Path d="M29.5 40 C27 20 40 13 53 14 C66 15 73 24 71 40 L69 34 C66 28 60 25 54 26 C48 30 40 33 33 32 C31 35 30 37 29.5 40 Z" fill={color} />
          <Path d="M33 32 C40 33 50 29 56 22 C52 30 45 35 36 36 Z" fill={color} />
        </>
      );
    case 'YOUNG':
      return (
        <>
          <Path d="M30.5 36 C28 18 40 10 53 11 C64 11 72 19 69.5 36 L68 30 C66 25 62 22 57 22 C50 22 43 21 37 25 C34 27 32 31 30.5 36 Z" fill={color} />
          {hasHat ? null : <Path d="M44 12 C50 6 60 7 64 13 C58 11 52 12 47 15 Z" fill={color} />}
        </>
      );
  }
};

const renderFace = (
  stage: AvatarAgeStage,
  geometry: StageGeometry,
  mood: AvatarMood,
  skinColor: string,
  browColor: string
): React.ReactNode => {
  const { eyes, browY: by, mouthY: my, mouthW: mw, cheek } = geometry;
  const isBaby = stage === 'BABY';
  const left = 50 - eyes.dx;
  const right = 50 + eyes.dx;
  const bw = isBaby ? 3.5 : 4;
  const browWidth = isBaby ? 1.3 : stage === 'YOUNG' ? 2.2 : 2;
  const browOpacity = isBaby ? 0.55 : 1;

  let browPaths: [string, string];
  if (mood === 'SAD') {
    browPaths = [
      `M${left - bw} ${by + 1.5} Q${left} ${by + 0.5} ${left + bw} ${by - 1.5}`,
      `M${right - bw} ${by - 1.5} Q${right} ${by + 0.5} ${right + bw} ${by + 1.5}`,
    ];
  } else if (mood === 'STRESSED') {
    browPaths = [
      `M${left - bw} ${by - 1.5} Q${left} ${by - 0.5} ${left + bw} ${by + 1.5}`,
      `M${right - bw} ${by + 1.5} Q${right} ${by - 0.5} ${right + bw} ${by - 1.5}`,
    ];
  } else {
    const lift = mood === 'HAPPY' ? 1.5 : 0;
    browPaths = [left, right].map(x => (
      `M${x - bw} ${by - lift} Q${x} ${by - lift - 1.5} ${x + bw} ${by - lift}`
    )) as [string, string];
  }

  const renderEye = (x: number) => {
    if (mood === 'HAPPY') {
      return (
        <Path
          key={`eye-${x}`}
          d={`M${x - 3} ${eyes.y + 0.5} Q${x} ${eyes.y - 3} ${x + 3} ${eyes.y + 0.5}`}
          stroke={EYE_COLOR}
          strokeWidth={isBaby ? 2.4 : 2.2}
          fill="none"
          strokeLinecap="round"
        />
      );
    }
    const radius = mood === 'STRESSED' ? eyes.r * 0.8 : mood === 'SAD' ? eyes.r * 0.93 : eyes.r;
    const y = mood === 'SAD' ? eyes.y + 1 : eyes.y;
    return (
      <G key={`eye-${x}`}>
        <Circle cx={x} cy={y} r={radius} fill={EYE_COLOR} />
        {mood === 'STRESSED' ? null : (
          <Circle cx={x + radius * 0.33} cy={y - radius * 0.37} r={radius * 0.32} fill="#ffffff" />
        )}
      </G>
    );
  };

  let mouth: React.ReactNode;
  if (mood === 'HAPPY') {
    mouth = (
      <>
        <Path d={`M${50 - 6} ${my - 2} Q50 ${my + 6} ${50 + 6} ${my - 2} Z`} fill={MOUTH_COLOR} />
        {isBaby ? null : (
          <Path d={`M${50 - 5} ${my - 1.5} L${50 + 5} ${my - 1.5} Q${50 + 4.5} ${my} 50 ${my} Q${50 - 4.5} ${my} ${50 - 5} ${my - 1.5} Z`} fill="#ffffff" />
        )}
      </>
    );
  } else if (mood === 'SAD') {
    mouth = <Path d={`M${50 - mw} ${my + 2} Q50 ${my - 1.5} ${50 + mw} ${my + 2}`} stroke={MOUTH_COLOR} strokeWidth={1.9} fill="none" strokeLinecap="round" />;
  } else if (mood === 'STRESSED') {
    mouth = (
      <Path
        d={`M${50 - 5.5} ${my + 0.5} Q${50 - 3.25} ${my - 1.5} ${50 - 1} ${my + 0.5} Q${50 + 1.25} ${my + 2.5} ${50 + 3.5} ${my + 0.5} Q${50 + 4.5} ${my - 0.4} ${50 + 5.5} ${my + 0.3}`}
        stroke={MOUTH_COLOR}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
    );
  } else {
    mouth = <Path d={`M${50 - mw} ${my} Q50 ${my + 2.5} ${50 + mw} ${my}`} stroke={MOUTH_COLOR} strokeWidth={1.9} fill="none" strokeLinecap="round" />;
  }

  const cheekOpacity = mood === 'HAPPY' ? 0.6 : mood === 'STRESSED' ? 0.25 : 0.45;
  const sweatX = 50 + geometry.head.rx + 5;
  const sweatY = eyes.y - 11;

  return (
    <>
      <Ellipse cx={50 - cheek.dx} cy={cheek.y} rx={cheek.rx} ry={cheek.ry} fill={BLUSH_COLOR} opacity={cheekOpacity} />
      <Ellipse cx={50 + cheek.dx} cy={cheek.y} rx={cheek.rx} ry={cheek.ry} fill={BLUSH_COLOR} opacity={cheekOpacity} />
      {browPaths.map((d, index) => (
        <Path key={`brow-${index}`} d={d} stroke={browColor} strokeWidth={browWidth} fill="none" strokeLinecap="round" opacity={browOpacity} />
      ))}
      {renderEye(left)}
      {renderEye(right)}
      {mood === 'STRESSED' && !isBaby && stage !== 'PRESCHOOL'
        ? [left, right].map(x => (
          <Path
            key={`bag-${x}`}
            d={`M${x - 2.5} ${eyes.y + 3.7} Q${x} ${eyes.y + 5} ${x + 2.5} ${eyes.y + 3.7}`}
            stroke={shade(skinColor, -0.22)}
            strokeWidth={1}
            fill="none"
            strokeLinecap="round"
          />
        ))
        : null}
      {mood === 'SAD' ? (
        <Path
          d={`M${left - 3} ${eyes.y + 4.5} Q${left - 4.5} ${eyes.y + 8} ${left - 3} ${eyes.y + 9.3} Q${left - 1.5} ${eyes.y + 8} ${left - 3} ${eyes.y + 4.5} Z`}
          fill={TEAR_COLOR}
        />
      ) : null}
      <Path
        d={`M49 ${geometry.noseY} Q50 ${geometry.noseY + 2} 51 ${geometry.noseY}`}
        stroke={shade(skinColor, -0.2)}
        strokeWidth={1.2}
        fill="none"
      />
      {mouth}
      {mood === 'STRESSED' ? (
        <Path d={`M${sweatX} ${sweatY} Q${sweatX - 2} ${sweatY + 4} ${sweatX} ${sweatY + 5.5} Q${sweatX + 2} ${sweatY + 4} ${sweatX} ${sweatY} Z`} fill={TEAR_COLOR} />
      ) : null}
    </>
  );
};

const renderGlasses = (geometry: StageGeometry): React.ReactNode => {
  const { eyes, ears } = geometry;
  const left = 50 - eyes.dx;
  const right = 50 + eyes.dx;
  const radius = eyes.r + 3.4;
  return (
    <>
      <Circle cx={left} cy={eyes.y} r={radius} fill="#ffffff" fillOpacity={0.18} stroke={FRAME_COLOR} strokeWidth={1.5} />
      <Circle cx={right} cy={eyes.y} r={radius} fill="#ffffff" fillOpacity={0.18} stroke={FRAME_COLOR} strokeWidth={1.5} />
      <Path d={`M${left + radius} ${eyes.y} Q50 ${eyes.y - 1.5} ${right - radius} ${eyes.y}`} stroke={FRAME_COLOR} strokeWidth={1.5} fill="none" />
      <Path d={`M${left - radius} ${eyes.y} L${50 - ears.dx} ${eyes.y - 1}`} stroke={FRAME_COLOR} strokeWidth={1.5} fill="none" />
      <Path d={`M${right + radius} ${eyes.y} L${50 + ears.dx} ${eyes.y - 1}`} stroke={FRAME_COLOR} strokeWidth={1.5} fill="none" />
    </>
  );
};

const renderHat = (geometry: StageGeometry): React.ReactNode => {
  const top = geometry.headTop;
  const hw = geometry.head.rx;
  const base = top + hw * 0.5;
  return (
    <>
      <Path
        d={`M${50 - hw - 1.5} ${base} C${50 - hw - 1} ${top - hw * 0.25} ${50 + hw + 1} ${top - hw * 0.25} ${50 + hw + 1.5} ${base} Z`}
        fill={CAP_COLOR}
      />
      <Path
        d={`M${50 - hw - 2} ${base} Q50 ${top + hw * 0.8} ${50 + hw + 2} ${base} Q50 ${top + hw * 0.62} ${50 - hw - 2} ${base} Z`}
        fill={CAP_SHADE}
      />
      <Circle cx={50} cy={top - hw * 0.08} r={1.8} fill={CAP_SHADE} />
    </>
  );
};

export interface AvatarProps {
  config: AvatarConfig;
  /** Yaş: 0-18. Çizim dönemi (bebek → genç) buna göre seçilir */
  age?: number;
  /** Pixel boyutu (kare) */
  size?: number;
  gender?: PlayerGender;
  /** Yüz ifadesi ve arka plan rengi */
  mood?: AvatarMood;
  /** Çerçeve çizgisi (büyük portrelerde) */
  showRing?: boolean;
}

const DEFAULT_CONFIG: AvatarConfig = { hairStyle: 0, skinTone: 0, accessory: 0 };

export const Avatar: React.FC<AvatarProps> = ({
  config = DEFAULT_CONFIG,
  age = 10,
  size = 40,
  gender = 'MALE',
  mood = 'NORMAL',
  showRing = false,
}) => {
  // Web'de aynı sayfadaki avatarların kırpma kimlikleri çakışmasın.
  const clipId = `avatar-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const stage = getAvatarAgeStage(age);
  const geometry = STAGES[stage];
  const skinColor = SKIN_COLORS[config.skinTone] ?? SKIN_COLORS[0];
  const hairColor = HAIR_COLORS[config.hairStyle] ?? HAIR_COLORS[0];
  const neckColor = shade(skinColor, -0.1);
  const browColor = shade(hairColor, -0.25);
  const hasGlasses = config.accessory === 1;
  const hasHat = config.accessory === 2;
  const background = MOOD_BACKGROUNDS[mood] ?? geometry.bg;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <ClipPath id={clipId}>
          <Circle cx={50} cy={50} r={50} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${clipId})`}>
        <Circle cx={50} cy={50} r={50} fill={background} />
        {renderHairBack(stage, gender, hairColor)}
        {renderClothes(stage, neckColor)}
        <Circle cx={50 - geometry.ears.dx} cy={geometry.ears.y} r={geometry.ears.r} fill={skinColor} />
        <Circle cx={50 + geometry.ears.dx} cy={geometry.ears.y} r={geometry.ears.r} fill={skinColor} />
        {geometry.headPath
          ? <Path d={geometry.headPath} fill={skinColor} />
          : <Ellipse cx={50} cy={geometry.head.cy} rx={geometry.head.rx} ry={geometry.head.ry} fill={skinColor} />}
        {renderHairFront(stage, gender, hairColor, hasHat)}
        {renderFace(stage, geometry, mood, skinColor, browColor)}
        {hasGlasses ? renderGlasses(geometry) : null}
        {hasHat ? renderHat(geometry) : null}
      </G>
      {showRing ? <Circle cx={50} cy={50} r={49.25} fill="none" stroke="#64748b" strokeWidth={1.5} /> : null}
    </Svg>
  );
};

/** Küçük inline avatar chip — StatusHeader gibi dar alanlarda */
export const AvatarChip: React.FC<AvatarProps> = (props) => (
  <Avatar {...props} size={props.size ?? 32} />
);
