import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface TabContentScreenProps {
  name: string;
  children: React.ReactNode;
}

interface TabContentProps {
  activeTab: string;
  keepAlive?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const TabContentScreen: React.FC<TabContentScreenProps> = ({ children }) => <>{children}</>;

const isScreenElement = (child: React.ReactNode): child is ReactElement<TabContentScreenProps> => {
  return React.isValidElement<TabContentScreenProps>(child)
    && child.type === TabContentScreen;
};

interface TabContentComponent extends React.FC<TabContentProps> {
  Screen: React.FC<TabContentScreenProps>;
}

export const TabContent: TabContentComponent = ({
  activeTab,
  keepAlive = true,
  style,
  children,
}) => {
  const [mountedTabs, setMountedTabs] = useState<Set<string>>(() => new Set([activeTab]));

  useEffect(() => {
    if (!keepAlive) return;
    setMountedTabs(prev => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab, keepAlive]);

  const screens = useMemo(
    () => React.Children.toArray(children).filter(isScreenElement),
    [children]
  );

  if (!keepAlive) {
    const active = screens.find((screen) => screen.props.name === activeTab);
    return <View style={[styles.root, style]}>{active || null}</View>;
  }

  return (
    <View style={[styles.root, style]}>
      {screens.map((screen) => {
        const isActive = screen.props.name === activeTab;
        const isMounted = mountedTabs.has(screen.props.name);
        if (!isMounted) return null;

        return (
          <View
            key={screen.props.name}
            style={isActive ? styles.active : styles.hidden}
            pointerEvents={isActive ? 'auto' : 'none'}
          >
            {screen.props.children}
          </View>
        );
      })}
    </View>
  );
};

TabContent.Screen = TabContentScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: 'relative',
  },
  active: {
    flex: 1,
  },
  hidden: {
    display: 'none',
  },
});
