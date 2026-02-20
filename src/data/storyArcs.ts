import { StoryArc } from '../types';
import { GOAL_CHAIN_ARC } from './goalChainEvents';
import { NPC_QUESTLINE_ARCS } from './npcQuestlineArcs';

export const STORY_ARCS: StoryArc[] = [
  {
    id: 'arc_family_strict_growth',
    title: 'Otoriter Aile Rotasi',
    ageRange: [8, 16],
    isRepeatable: false,
    events: [
      { eventId: 'fam_strict_notebook_check', stage: 1, requiresPrevious: false },
      // Stage 2: Uyumcu dal (conformity >= 45) - kurallara uy
      { eventId: 'fam_strict_no_permission', stage: 2, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.conformity >= 45 },
      // Stage 2: İsyankar dal (conformity < 45) - karşı çık
      { eventId: 'fam_strict_rebel_pushback', stage: 2, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.conformity < 45 },
      { eventId: 'fam_strict_university_choice', stage: 3, requiresPrevious: true },
    ],
  },
  {
    id: 'arc_family_chaotic_growth',
    title: 'Kaotik Aile Rotasi',
    ageRange: [8, 16],
    isRepeatable: false,
    events: [
      { eventId: 'fam_chaotic_no_dinner', stage: 1, requiresPrevious: false },
      // Stage 2: Empatik dal (empathy >= 45) - arabulucu ol
      { eventId: 'fam_chaotic_parent_conflict', stage: 2, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.empathy >= 45 },
      // Stage 2: Pragmatist dal (empathy < 45) - kendi yolunu çiz
      { eventId: 'fam_chaotic_self_reliance', stage: 2, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.empathy < 45 },
    ],
  },
  {
    id: 'arc_family_supportive_growth',
    title: 'Destekleyici Aile Rotasi',
    ageRange: [8, 16],
    isRepeatable: false,
    events: [
      { eventId: 'fam_supportive_surprise_day', stage: 1, requiresPrevious: false },
      { eventId: 'fam_supportive_failure_response', stage: 2, requiresPrevious: true },
      // Stage 3: Cesur dal (courage >= 55) - büyük hedef
      { eventId: 'fam_supportive_growth_challenge', stage: 3, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.courage >= 55 },
      // Stage 3: Temkinli dal (courage < 55) - adım adım
      { eventId: 'fam_supportive_calm_foundation', stage: 3, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.courage < 55 },
    ],
  },
  {
    id: 'arc_exam_resilience',
    title: 'Sinav Dayanikliligi',
    ageRange: [15, 18],
    isRepeatable: false,
    events: [
      { eventId: 'lt_yks_trial_night', stage: 1, requiresPrevious: false },
      // Stage 2: Duygusal dal (patience < 55) - tükenmişlik
      { eventId: 'lt_exam_week_burnout_signal', stage: 2, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.patience < 55 },
      // Stage 2: Stratejik dal (patience >= 55) - planlı reset
      { eventId: 'lt_exam_strategic_reset', stage: 2, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.patience >= 55 },
      { eventId: 'lt_memory_echo_regret', stage: 3, requiresPrevious: true },
    ],
  },
  {
    id: 'arc_career_launch',
    title: 'Kariyer Baslangici',
    ageRange: [15, 18],
    isRepeatable: false,
    events: [
      { eventId: 'lt_career_fair_day', stage: 1, requiresPrevious: false },
      // Stage 2: Güvenli dal (openness < 60) - staj başvurusu
      { eventId: 'lt_first_internship_call', stage: 2, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.openness < 60 },
      // Stage 2: Girişimci dal (openness >= 60) - kendi projen
      { eventId: 'lt_career_startup_idea', stage: 2, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.openness >= 60 },
      { eventId: 'lt_finance_first_salary_plan', stage: 3, requiresPrevious: true },
    ],
  },
  {
    id: 'arc_first_love',
    title: 'Ilk Ask Rotasi',
    ageRange: [15, 18],
    isRepeatable: false,
    events: [
      { eventId: 'lt_first_love_confession', stage: 1, requiresPrevious: false },
      // Stage 2: Kalp kırıklığı dal (empathy < 60) - reddedilme/ayrılık
      { eventId: 'lt_first_heartbreak', stage: 2, requiresPrevious: false,
        branchCondition: (ctx) => ctx.personality.empathy < 60 },
      // Stage 2: Derinleşme dal (empathy >= 60) - ilişki büyür
      { eventId: 'lt_first_love_deepening', stage: 2, requiresPrevious: false,
        branchCondition: (ctx) => ctx.personality.empathy >= 60 },
      { eventId: 'lt_identity_crisis_week', stage: 3, requiresPrevious: false },
    ],
  },
  {
    id: 'arc_family_independence',
    title: 'Ailede Bagimsizlik',
    ageRange: [15, 18],
    isRepeatable: false,
    events: [
      { eventId: 'lt_family_independence_argument', stage: 1, requiresPrevious: false },
      // Stage 2: Çatışmacı dal (patience < 55) - bütçe tartışması
      { eventId: 'lt_family_budget_meeting', stage: 2, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.patience < 55 },
      // Stage 2: Diplomatik dal (patience >= 55) - sakin müzakere
      { eventId: 'lt_family_calm_negotiation', stage: 2, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.patience >= 55 },
      { eventId: 'lt_family_house_rules_reset', stage: 3, requiresPrevious: true },
    ],
  },
  GOAL_CHAIN_ARC,
  ...NPC_QUESTLINE_ARCS,
];
