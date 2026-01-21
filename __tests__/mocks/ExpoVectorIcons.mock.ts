import React from 'react';
import { Text } from 'react-native';

export const Feather = (props: any) => React.createElement(Text, props, props.name);
export const Ionicons = (props: any) => React.createElement(Text, props, props.name);
export const MaterialIcons = (props: any) => React.createElement(Text, props, props.name);

export default {
  Feather,
  Ionicons,
  MaterialIcons,
};
