import React from 'react';
import { render } from '@testing-library/react-native';
import { Avatar, getAvatarAgeStage } from '../../src/components/Avatar';
import type { AvatarConfig } from '../../src/types/core';

const BASE: AvatarConfig = { hairStyle: 1, skinTone: 0, accessory: 0 };
const HAIR_BROWN = '#6B3A2A';

type Node = { type: unknown; props: Record<string, unknown> };

const drawn = (element: React.ReactElement) => {
  const { UNSAFE_root } = render(element);
  const all = (type: string): Node[] => UNSAFE_root.findAll((node: Node) => node.type === type);
  return {
    all,
    fills: (type: string) => all(type).map(node => node.props.fill),
    strokes: (type: string) => all(type).map(node => node.props.stroke),
  };
};

describe('Avatar', () => {
  it('maps ages to the five drawing stages', () => {
    expect([0, 2].map(getAvatarAgeStage)).toEqual(['BABY', 'BABY']);
    expect([3, 6].map(getAvatarAgeStage)).toEqual(['PRESCHOOL', 'PRESCHOOL']);
    expect([7, 10].map(getAvatarAgeStage)).toEqual(['PRIMARY', 'PRIMARY']);
    expect([11, 14].map(getAvatarAgeStage)).toEqual(['TEEN', 'TEEN']);
    expect([15, 18].map(getAvatarAgeStage)).toEqual(['YOUNG', 'YOUNG']);
  });

  it('uses the saved skin and hair colors', () => {
    const avatar = drawn(<Avatar config={{ hairStyle: 2, skinTone: 3, accessory: 0 }} age={8} />);

    expect(avatar.fills('Ellipse')).toContain('#8D5524');
    expect(avatar.fills('Path')).toContain('#C8A951');
  });

  it('gives girls long hair behind the head and boys none', () => {
    // Ergen kızın saçı omuzların altına (y=80) iner; erkekte hiçbir saç şekli bu kadar uzamaz.
    const hasShoulderHair = (gender: 'MALE' | 'FEMALE') => (
      drawn(<Avatar config={BASE} age={12} gender={gender} />).all('Path')
        .filter(node => node.props.fill === HAIR_BROWN)
        .some(node => String(node.props.d).includes('L73 80'))
    );

    expect(hasShoulderHair('FEMALE')).toBe(true);
    expect(hasShoulderHair('MALE')).toBe(false);
  });

  it('draws glasses and a cap from the accessory setting', () => {
    const plain = drawn(<Avatar config={BASE} age={12} />);
    const glasses = drawn(<Avatar config={{ ...BASE, accessory: 1 }} age={12} />);
    const cap = drawn(<Avatar config={{ ...BASE, accessory: 2 }} age={12} />);

    expect(plain.strokes('Circle')).not.toContain('#1f2937');
    expect(glasses.strokes('Circle').filter(stroke => stroke === '#1f2937')).toHaveLength(2);
    expect(cap.fills('Path')).toContain('#D9534F');
  });

  it('hides hair tufts that would poke through the cap', () => {
    const babyCurl = (accessory: 0 | 2) => (
      drawn(<Avatar config={{ ...BASE, accessory }} age={1} />).strokes('Path').includes(HAIR_BROWN)
    );

    expect(babyCurl(0)).toBe(true);
    expect(babyCurl(2)).toBe(false);
  });

  it('changes the face and background with mood', () => {
    const TEAR = '#7FC4E8';
    const happy = drawn(<Avatar config={BASE} age={12} mood="HAPPY" />);
    const sad = drawn(<Avatar config={BASE} age={12} mood="SAD" />);
    const stressed = drawn(<Avatar config={BASE} age={12} mood="STRESSED" />);
    const normal = drawn(<Avatar config={BASE} age={12} mood="NORMAL" />);

    expect(happy.fills('Circle')).toContain('#3d3528');
    expect(happy.fills('Path')).not.toContain(TEAR);
    expect(sad.fills('Circle')).toContain('#23304a');
    expect(sad.fills('Path')).toContain(TEAR);
    expect(stressed.fills('Circle')).toContain('#40292b');
    expect(normal.fills('Circle')).toContain('#2b3a35');
  });

  it('gives each avatar its own clip id so avatars on one page do not clash', () => {
    const { UNSAFE_root } = render(
      <>
        <Avatar config={BASE} age={5} />
        <Avatar config={BASE} age={5} />
      </>
    );
    const ids = UNSAFE_root.findAll((node: Node) => node.type === 'ClipPath').map(node => node.props.id);

    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
  });
});
