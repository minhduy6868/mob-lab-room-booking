import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BrowseRoomsScreen } from '../screens/BrowseRoomsScreen';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { BottomTabBar } from '../components/navigation/BottomTabBar';
import { BookingModal } from '../components/rooms/BookingModal';
import { QRCodePassModal } from '../components/bookings/QRCodePassModal';
import { useBookingStore } from '../store/useBookingStore';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const syncBookingLifecycles = useBookingStore((s) => s.syncBookingLifecycles);
  const hydrateFromCloud = useBookingStore((s) => s.hydrateFromCloud);

  useEffect(() => {
    hydrateFromCloud();
    syncBookingLifecycles();
    const timer = setInterval(() => {
      void hydrateFromCloud();
      syncBookingLifecycles();
    }, 2500);
    return () => clearInterval(timer);
  }, [hydrateFromCloud, syncBookingLifecycles]);

  return (
    <View style={styles.root}>
      <Tab.Navigator
        tabBar={(props) => <BottomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Browse" component={BrowseRoomsScreen} />
        <Tab.Screen name="Bookings" component={MyBookingsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <BookingModal />
      <QRCodePassModal />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
