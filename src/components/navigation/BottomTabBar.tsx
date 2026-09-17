import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { THEME } from '../../constants/theme';
import { useBookingStore } from '../../store/useBookingStore';
import { useAuthStore } from '../../store/useAuthStore';
import { isActiveBooking } from '../../lib/booking-rules';

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const bookings = useBookingStore((s) => s.bookings);
  const studentId = useAuthStore((s) => s.session?.user.studentId);
  const activeBookingsCount = bookings.filter(
    (booking) => isActiveBooking(booking) && booking.studentId === studentId
  ).length;

  const ICONS = {
    Browse: { outline: 'grid-outline' as const, filled: 'grid' as const, label: 'Khám phá' },
    Bookings: { outline: 'calendar-outline' as const, filled: 'calendar' as const, label: 'Lịch của tôi' },
    Profile: { outline: 'person-circle-outline' as const, filled: 'person-circle' as const, label: 'Tài khoản' },
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {state.routes.map((route, index) => {
          const isActive = state.index === index;
          const meta = ICONS[route.name as keyof typeof ICONS];
          if (!meta) return null;
          const badge = route.name === 'Bookings' ? activeBookingsCount : 0;

          return (
            <Pressable
              key={route.key}
              style={({ pressed }) => [styles.tabItem, pressed && { opacity: 0.8 }]}
              onPress={() => navigation.navigate(route.name)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={meta.label}
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={isActive ? meta.filled : meta.outline}
                  size={22}
                  color={isActive ? THEME.colors.primary : THEME.colors.textMuted}
                />
                {badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{meta.label}</Text>
              {isActive && <View style={styles.activeDot} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 8,
    paddingBottom: process.env.EXPO_OS === 'ios' ? 24 : 12,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
    position: 'relative',
  },
  iconWrapper: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: THEME.colors.occupied,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  tabLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 3,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.primary,
    marginTop: 3,
  },
});
