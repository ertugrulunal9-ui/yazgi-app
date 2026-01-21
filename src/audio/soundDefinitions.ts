// Sound Registry - All game audio assets
// Note: Sound files are optional - game works without them

export type SoundCategory = 'music' | 'sfx';

export interface SoundDefinition {
  id: string;
  category: SoundCategory;
  path: any; // require() path or null if file doesn't exist
  volume?: number; // 0-1, default 1
  loop?: boolean;
  preload?: boolean;
}

// Background Music Tracks - paths are null until audio files are added
export const MUSIC_TRACKS: SoundDefinition[] = [
  {
    id: 'menu',
    category: 'music',
    path: null, // Add: require('../../assets/sounds/music/menu.mp3')
    volume: 0.6,
    loop: true,
    preload: true,
  },
  {
    id: 'childhood',
    category: 'music',
    path: null, // Add: require('../../assets/sounds/music/childhood.mp3')
    volume: 0.5,
    loop: true,
    preload: true,
  },
  {
    id: 'school',
    category: 'music',
    path: null, // Add: require('../../assets/sounds/music/school.mp3')
    volume: 0.5,
    loop: true,
    preload: true,
  },
  {
    id: 'teen',
    category: 'music',
    path: null, // Add: require('../../assets/sounds/music/teen.mp3')
    volume: 0.5,
    loop: true,
    preload: true,
  },
  {
    id: 'gameover',
    category: 'music',
    path: null, // Add: require('../../assets/sounds/music/gameover.mp3')
    volume: 0.6,
    loop: false,
    preload: true,
  },
];

// Sound Effects - paths are null until audio files are added
export const SFX_SOUNDS: SoundDefinition[] = [
  // UI Sounds
  {
    id: 'button_click',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/button_click.mp3')
    volume: 0.4,
    preload: true,
  },
  {
    id: 'button_hover',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/button_hover.mp3')
    volume: 0.2,
    preload: true,
  },

  // Stat Changes
  {
    id: 'stat_gain',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/stat_gain.mp3')
    volume: 0.5,
    preload: true,
  },
  {
    id: 'stat_loss',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/stat_loss.mp3')
    volume: 0.5,
    preload: true,
  },

  // Achievements
  {
    id: 'achievement_unlock',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/achievement_unlock.mp3')
    volume: 0.7,
    preload: true,
  },
  {
    id: 'level_up',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/level_up.mp3')
    volume: 0.7,
    preload: true,
  },

  // Events
  {
    id: 'event_start',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/event_start.mp3')
    volume: 0.5,
    preload: true,
  },
  {
    id: 'turn_advance',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/turn_advance.mp3')
    volume: 0.3,
    preload: true,
  },

  // Money
  {
    id: 'money_gain',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/money_gain.mp3')
    volume: 0.6,
    preload: true,
  },
  {
    id: 'money_loss',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/money_loss.mp3')
    volume: 0.6,
    preload: true,
  },
  {
    id: 'money_broke',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/money_broke.mp3')
    volume: 0.7,
    preload: true,
  },

  // Alerts
  {
    id: 'health_critical',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/health_critical.mp3')
    volume: 0.8,
    preload: true,
  },
  {
    id: 'notification',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/notification.mp3')
    volume: 0.5,
    preload: true,
  },

  // School
  {
    id: 'grade_good',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/grade_good.mp3')
    volume: 0.6,
    preload: false,
  },
  {
    id: 'grade_bad',
    category: 'sfx',
    path: null, // Add: require('../../assets/sounds/sfx/grade_bad.mp3')
    volume: 0.6,
    preload: false,
  },
];

// All sounds combined
export const ALL_SOUNDS: SoundDefinition[] = [...MUSIC_TRACKS, ...SFX_SOUNDS];

// Helper: Get sound by ID
export const getSoundDefinition = (id: string): SoundDefinition | undefined => {
  return ALL_SOUNDS.find(s => s.id === id);
};

// Helper: Get music track for age
export const getMusicForAge = (age: number, isGameOver: boolean = false): string => {
  if (isGameOver) return 'gameover';
  if (age < 0) return 'menu';
  if (age < 7) return 'childhood';
  if (age < 14) return 'school';
  return 'teen';
};
