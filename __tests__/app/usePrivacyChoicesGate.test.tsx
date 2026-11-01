import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PRIVACY_CHOICES_KEY,
  usePrivacyChoicesGate,
} from '../../src/appShell/usePrivacyChoicesGate';

type GateResult = ReturnType<typeof usePrivacyChoicesGate>;

const storageMock = AsyncStorage as unknown as {
  __CLEAR__: () => void;
  __GET_STORAGE__: () => Record<string, string>;
  getItem: jest.Mock;
};

const mountGate = async () => {
  const ref: { current: GateResult | null } = { current: null };
  const Probe = () => {
    ref.current = usePrivacyChoicesGate();
    return null;
  };

  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<Probe />);
  });
  await act(async () => {
    await Promise.resolve();
  });

  return { ref, tree };
};

describe('usePrivacyChoicesGate', () => {
  beforeEach(() => {
    storageMock.__CLEAR__();
  });

  it('keeps the splash while checking, then asks a first-time player', async () => {
    const { ref, tree } = await mountGate();

    expect(ref.current?.checkingPrivacyChoices).toBe(false);
    expect(ref.current?.privacyChoicesPending).toBe(true);
    tree.unmount();
  });

  it('is shown only once: saving persists the flag and later launches skip it', async () => {
    const first = await mountGate();

    await act(async () => {
      first.ref.current?.markPrivacyChoicesSeen({ personalizedAds: true, analytics: false });
      await Promise.resolve();
    });

    expect(first.ref.current?.privacyChoicesPending).toBe(false);
    const stored = JSON.parse(storageMock.__GET_STORAGE__()[PRIVACY_CHOICES_KEY]);
    expect(stored).toMatchObject({ personalizedAds: true, analytics: false });
    expect(typeof stored.decidedAt).toBe('string');
    first.tree.unmount();

    const second = await mountGate();
    expect(second.ref.current?.checkingPrivacyChoices).toBe(false);
    expect(second.ref.current?.privacyChoicesPending).toBe(false);
    second.tree.unmount();
  });

  it('existing players who never saw the card get it once', async () => {
    // Eski oyuncu: tercihleri var ama gizlilik bayrağı yok.
    await AsyncStorage.setItem('@yazgi_sim/ui_prefs/v1', JSON.stringify({ analyticsEnabled: true }));
    await AsyncStorage.setItem('@yazgi/onboarding_completed', 'true');

    const { ref, tree } = await mountGate();
    expect(ref.current?.privacyChoicesPending).toBe(true);
    tree.unmount();
  });

  it('shows the card again if storage cannot be read', async () => {
    storageMock.getItem.mockImplementationOnce(async () => {
      throw new Error('storage unavailable');
    });

    const { ref, tree } = await mountGate();
    expect(ref.current?.checkingPrivacyChoices).toBe(false);
    expect(ref.current?.privacyChoicesPending).toBe(true);
    tree.unmount();
  });
});
