import React from 'react';
import { SwipeChoiceCard } from './SwipeChoiceCard';

type ChoiceCardProps = React.ComponentProps<typeof SwipeChoiceCard>;

export const ChoiceCard: React.FC<ChoiceCardProps> = React.memo((props) => (
  <SwipeChoiceCard {...props} />
));

ChoiceCard.displayName = 'ChoiceCard';

