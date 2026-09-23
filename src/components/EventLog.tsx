import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ListRenderItemInfo } from 'react-native';
import { LogEntry } from '../types';
import { tRuntime } from '../i18n/strings';
import { useRuntimeLocale } from '../i18n/useRuntimeLocale';

interface EventLogProps {
  logs: LogEntry[];
  theme: any;
}

const LogItem = React.memo<{ log: LogEntry; getLogColor: (type: string) => string; theme: any }>(
  ({ log, getLogColor, theme }) => (
    <View style={[logItemStyles.logItem, { borderLeftColor: theme.border }]}>
      <Text style={[logItemStyles.logAge, { color: theme.accentEvent }]}>
        [{log.age}y]
      </Text>
      <Text style={[logItemStyles.logMessage, { color: getLogColor(log.type) }]}>
        {log.message}
      </Text>
    </View>
  )
);
LogItem.displayName = 'LogItem';

const logItemStyles = StyleSheet.create({
  logItem: {
    borderLeftWidth: 2,
    paddingLeft: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  logAge: {
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 8,
    opacity: 0.7,
  },
  logMessage: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
});

export const EventLog = React.memo<EventLogProps>(({ logs, theme }) => {
  useRuntimeLocale();

  const getLogColor = useCallback((type: string): string => {
    switch (type) {
      case 'positive': return theme.accentGrade;
      case 'negative': return '#f87171';
      case 'achievement': return theme.accentEvent;
      default: return theme.textSecondary;
    }
  }, [theme.accentGrade, theme.accentEvent, theme.textSecondary]);

  const keyExtractor = useCallback((item: LogEntry) => item.id, []);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<LogEntry>) => (
    <LogItem log={item} getLogColor={getLogColor} theme={theme} />
  ), [getLogColor, theme]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.surfaceRaised,
      padding: 16,
      height: 192,
      marginTop: 24,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      paddingBottom: 8,
    },
    headerIcon: {
      fontSize: 20,
    },
    headerTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 2,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      color: theme.textSecondary,
      fontStyle: 'italic',
      fontSize: 12,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📜</Text>
        <Text style={styles.headerTitle}>
          {tRuntime('eventLog.title')}
        </Text>
      </View>

      {(!logs || logs.length === 0) ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {tRuntime('eventLog.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          initialNumToRender={15}
          maxToRenderPerBatch={5}
          windowSize={5}
          showsVerticalScrollIndicator
        />
      )}
    </View>
  );
});

EventLog.displayName = 'EventLog';

export default EventLog;
