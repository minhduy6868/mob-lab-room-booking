import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { MainTabs } from './MainTabs';
import { BookingConfirmationScreen } from '../screens/BookingConfirmationScreen';
import { RoomDetailsScreen } from '../screens/RoomDetailsScreen';
import { RootStackParamList } from './types';
import { useAuthStore } from '../store/useAuthStore';
import { THEME } from '../constants/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const session = useAuthStore((s) => s.session);

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: THEME.colors.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '800' },
        animation: 'slide_from_right',
      }}
    >
      {session ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="RoomDetails"
            component={RoomDetailsScreen}
            options={({ route }) => ({ title: route.params.roomName })}
          />
          <Stack.Screen
            name="BookingConfirmation"
            component={BookingConfirmationScreen}
            options={{
              title: 'Thẻ vào phòng',
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}
