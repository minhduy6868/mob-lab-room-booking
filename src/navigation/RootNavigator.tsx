import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { MainTabs } from './MainTabs';
import { RootStackParamList } from './types';
import { useAuthStore } from '../store/useAuthStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const session = useAuthStore((s) => s.session);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {session ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
