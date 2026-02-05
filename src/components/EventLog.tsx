import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LogEntry } from '../types';

interface EventLogProps {
  logs: LogEntry[];
  theme: any;
}

export const EventLog = React.memo<EventLogProps>(({ logs, theme }) => {
  const bottomRef = useRef<View>(null);

  useEffect(() => {
    // Auto-scroll özelliği aktif - yeni log eklendiğinde tetiklenir
    // Parent ScrollView'da scrollToEnd() kullanılabilir
  }, [logs]);

  const getLogColor = (type: string): string => {
    switch (type) {
      case 'positive': return theme.accentGrade;
      case 'negative': return '#f87171';
      case 'achievement': return theme.accentEvent;
      default: return theme.textSecondary;
    }
  };

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
    scrollContent: {
      flex: 1,
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
    logItem: {
      borderLeftWidth: 2,
      borderLeftColor: theme.border,
      paddingLeft: 12,
      paddingVertical: 4,
      marginBottom: 8,
    },
    logAge: {
      color: theme.accentEvent,
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>📜</Text>
        <Text style={styles.headerTitle}>
          Hayat Günlüğü
        </Text>
      </View>
      
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {(!logs || logs.length === 0) ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              ... Yeni hayat bekleniyor ...
            </Text>
          </View>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <Text style={styles.logAge}>
                [{log.age}y]
              </Text>
              <Text style={[styles.logMessage, { color: getLogColor(log.type) }]}>
                {log.message}
              </Text>
            </View>
          ))
        )}
        <View ref={bottomRef} />
      </ScrollView>
    </View>
  );
});

export default EventLog;