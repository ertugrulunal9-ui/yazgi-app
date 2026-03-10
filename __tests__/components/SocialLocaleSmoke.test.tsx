import React from 'react';
import { render } from '@testing-library/react-native';
import SocialScreen from '../../src/components/SocialScreen';
import { NPCList } from '../../src/components/NPCList';
import { NPCCard } from '../../src/components/NPCCard';
import type { NPC } from '../../src/types';
import { setRuntimeLocale } from '../../src/i18n/strings';

jest.mock('../../src/animations/HapticFeedback', () => ({
  selectionHaptic: jest.fn(),
  buttonPress: jest.fn(),
}));

jest.mock('react-native', () => {
  const baseModule = require('../mocks/ReactNative.mock');
  const base = baseModule.default || baseModule;
  const ReactModule = require('react');

  const MockFlatList = ({
    data = [],
    renderItem,
    keyExtractor,
    ListHeaderComponent,
    ListEmptyComponent,
  }: any) => (
    <base.View>
      {ListHeaderComponent
        ? (typeof ListHeaderComponent === 'function'
          ? ReactModule.createElement(ListHeaderComponent)
          : ListHeaderComponent)
        : null}
      {data.length === 0
        ? (ListEmptyComponent
          ? (typeof ListEmptyComponent === 'function'
            ? ReactModule.createElement(ListEmptyComponent)
            : ListEmptyComponent)
          : null)
        : data.map((item: any, index: number) => (
          <base.View key={keyExtractor ? keyExtractor(item, index) : String(index)}>
            {renderItem({ item, index })}
          </base.View>
        ))}
    </base.View>
  );

  return {
    ...base,
    FlatList: MockFlatList,
  };
});

jest.mock('@shopify/flash-list', () => {
  const baseModule = require('../mocks/ReactNative.mock');
  const base = baseModule.default || baseModule;

  const FlashList = ({ data = [], renderItem, keyExtractor }: any) => (
    <base.View>
      {data.map((item: any, index: number) => (
        <base.View key={keyExtractor ? keyExtractor(item, index) : String(index)}>
          {renderItem({ item, index })}
        </base.View>
      ))}
    </base.View>
  );

  return { FlashList };
});

const makeNPC = (overrides: Partial<NPC> = {}): NPC => ({
  id: 'npc_1',
  name: 'James',
  role: 'FRIEND',
  relationship: 45,
  romance: 0,
  gender: 'MALE',
  age: 14,
  personality: 'FRIENDLY',
  traits: ['LOYAL'],
  metAge: 11,
  metTurn: 12,
  lastInteraction: 30,
  sharedMemories: [],
  isInPlayerGroup: false,
  ...overrides,
});

const npcCardTheme = {
  surface: '#1e293b',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#334155',
  accent: '#22c55e',
};

const npcListTheme = {
  ...npcCardTheme,
  background: '#020617',
};

describe('Social locale smoke', () => {
  afterEach(() => {
    setRuntimeLocale('tr');
  });

  it('renders NPCCard role and age labels in English locale', () => {
    setRuntimeLocale('en');

    const { getByText } = render(
      <NPCCard npc={makeNPC({ name: 'James' })} theme={npcCardTheme} />
    );

    expect(getByText('James')).toBeTruthy();
    expect(getByText('Friend')).toBeTruthy();
    expect(getByText(/Age 14/)).toBeTruthy();
  });

  it('keeps existing NPC names unchanged after locale switch', () => {
    setRuntimeLocale('en');

    const { getByText } = render(
      <NPCCard npc={makeNPC({ name: 'Ayse' })} theme={npcCardTheme} />
    );

    expect(getByText('Ayse')).toBeTruthy();
  });

  it('renders NPCList summary and group labels in English locale', () => {
    setRuntimeLocale('en');
    const npcs: NPC[] = [
      makeNPC({ id: 'npc_friend', name: 'Liam', role: 'FRIEND' }),
      makeNPC({ id: 'npc_rival', name: 'Noah', role: 'RIVAL', relationship: -25, personality: 'AGGRESSIVE' }),
    ];

    const { getByText, getAllByText } = render(
      <NPCList npcs={npcs} onNPCPress={jest.fn()} theme={npcListTheme} />
    );

    expect(getByText('👥 Your Social Circle')).toBeTruthy();
    expect(getAllByText('Friends').length).toBeGreaterThan(0);
    expect(getByText('Rivals & Enemies')).toBeTruthy();
    expect(getByText('Liam')).toBeTruthy();
    expect(getByText('Noah')).toBeTruthy();
  });

  it('renders corrected Turkish labels in SocialScreen', () => {
    setRuntimeLocale('tr');

    const { getByText } = render(
      <SocialScreen
        npcs={[]}
        currentEnergy={20}
        currentMoney={100}
        playerAge={12}
        playerPersonality={{ openness: 50, empathy: 50, courage: 50, conformity: 50 }}
        onBack={jest.fn()}
        onInteract={() => ({ success: true, message: 'ok', cost: { energy: 0, money: 0 } })}
        onMeetNew={() => ({ success: true })}
      />
    );

    expect(getByText(/Sosyal Çevre/)).toBeTruthy();
    expect(getByText('Yeni Biri ile Tanış')).toBeTruthy();
    expect(getByText('Henüz kimseyi tanımıyorsun')).toBeTruthy();
  });

  it('renders SocialScreen header and empty-state labels in English locale', () => {
    setRuntimeLocale('en');

    const { getByText } = render(
      <SocialScreen
        npcs={[]}
        currentEnergy={20}
        currentMoney={100}
        playerAge={12}
        playerPersonality={{ openness: 50, empathy: 50, courage: 50, conformity: 50 }}
        onBack={jest.fn()}
        onInteract={() => ({ success: true, message: 'ok', cost: { energy: 0, money: 0 } })}
        onMeetNew={() => ({ success: true })}
      />
    );

    expect(getByText(/Social Circle/)).toBeTruthy();
    expect(getByText('Meet Someone New')).toBeTruthy();
    expect(getByText('You have not met anyone yet')).toBeTruthy();
  });
});
