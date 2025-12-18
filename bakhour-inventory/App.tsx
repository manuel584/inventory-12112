import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useDatabase } from './src/hooks/useDatabase';
import { LoadingSpinner } from './src/components/LoadingSpinner';
import { UndoProvider } from './src/contexts/UndoContext';
import { View, Text } from 'react-native';

export default function App() {
  const { isReady, error } = useDatabase();

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error loading database: {error.message}</Text>
      </View>
    );
  }

  if (!isReady) {
    return <LoadingSpinner fullScreen text="جاري تهيئة قاعدة البيانات..." />;
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <UndoProvider>
          <AppNavigator />
        </UndoProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
