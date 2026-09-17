import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/api/query-client';
import { useAuthStore } from './src/store/useAuthStore';
import { SplashScreen } from './src/screens/SplashScreen';
import { RootNavigator } from './src/navigation/RootNavigator';
import { navigationRef } from './src/navigation/types';
import { THEME } from './src/constants/theme';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!useAuthStore.getState().hydrated) {
        useAuthStore.getState().setHydrated(true);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.fontBoot}>
        <ActivityIndicator color="#93C5FD" />
        <Text style={styles.fontBootText}>Đang tải icon...</Text>
      </View>
    );
  }

  if (showSplash || !hydrated) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer ref={navigationRef}>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fontBoot: {
    flex: 1,
    backgroundColor: THEME.colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  fontBootText: {
    color: '#93C5FD',
    fontSize: 13,
  },
});
