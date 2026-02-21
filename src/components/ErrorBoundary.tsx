import React, { ReactNode, Component, ErrorInfo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { crashReportingService } from '../services/crashReporting';
import { devLog } from '../utils/devLogger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#bdc3c7',
    marginBottom: 16,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 12,
    color: '#95a5a6',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  stackTrace: {
    fontSize: 11,
    color: '#7f8c8d',
    fontFamily: 'monospace',
    maxHeight: 150,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  restartButton: {
    flex: 1,
    backgroundColor: '#27ae60',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  restartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  copyButton: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  devInfo: {
    backgroundColor: '#2c3e50',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  devLabel: {
    color: '#f39c12',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  devText: {
    fontSize: 11,
    color: '#ecf0f1',
    fontFamily: 'monospace',
  },
});

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    void crashReportingService.logError(error, {
      phase: 'ErrorBoundary',
      action: 'Component crashed',
    });

    console.error('ErrorBoundary caught:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleCopyError = () => {
    if (this.state.error) {
      const errorText = `${this.state.error.name}: ${this.state.error.message}\n\n${this.state.errorInfo?.componentStack || ''}`;
      devLog.log('Error copied to clipboard (dev only):', errorText);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView>
            <View style={styles.errorContainer}>
              <Text style={styles.title}>🔴 Bir şeyler yanlış gitti</Text>
              <Text style={styles.subtitle}>
                Uygulamada beklenmedik bir hata meydana geldi. Lütfen uygulamayı yeniden başlatın.
              </Text>

              {this.state.error && (
                <>
                  <Text style={styles.errorText}>
                    {this.state.error.name}: {this.state.error.message}
                  </Text>

                  {this.state.errorInfo && (
                    <Text style={styles.stackTrace}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </>
              )}

              {__DEV__ && this.state.error && (
                <View style={styles.devInfo}>
                  <Text style={styles.devLabel}>👨‍💻 DEV MODE</Text>
                  <Text style={styles.devText}>
                    Hata: {this.state.error.message}
                  </Text>
                  {this.state.error.stack && (
                    <Text style={[styles.devText, { marginTop: 8 }]}>
                      {this.state.error.stack}
                    </Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.restartButton}
                onPress={this.handleRestart}
              >
                <Text style={styles.restartButtonText}>
                  🔄 Yeniden Başlat
                </Text>
              </TouchableOpacity>

              {__DEV__ && (
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={this.handleCopyError}
                >
                  <Text style={styles.copyButtonText}>📋 Kopyala</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}
