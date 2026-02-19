import React from 'react';
import AppShell from './src/appShell/AppShell';
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  );
}
