import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { useBookingStore } from '../../store/useBookingStore';
import { useAuthStore } from '../../store/useAuthStore';
import { TODAY_STR, TOMORROW_STR } from '../../constants/mockRooms';
import { navigateToMainTab } from '../../navigation/types';
import { isActiveBooking } from '../../lib/booking-rules';

interface HeaderProps {
  showDateSwitcher?: boolean;
}

export function Header({ showDateSwitcher = true }: HeaderProps) {
  const { selectedDate, setSelectedDate, bookings, cloudReady } = useBookingStore();
  const session = useAuthStore((s) => s.session);
  const studentId = session?.user.studentId;
  const activeBookingsCount = bookings.filter(
    (booking) => isActiveBooking(booking) && booking.studentId === studentId
  ).length;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>VKU</Text>
          </View>
          <View>
            <Text style={styles.title}>Study Room Booking</Text>
            <Text style={styles.subtitle}>Trường Đại học CNTT & TT Việt - Hàn</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.bookingBadgeBtn, pressed && { opacity: 0.8 }]}
          onPress={() => navigateToMainTab('Bookings')}
          hitSlop={8}
        >
          <Ionicons name="calendar-outline" size={18} color={THEME.colors.primary} />
          {activeBookingsCount > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{activeBookingsCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Campus System Pulse Status */}
      <View style={styles.systemStatusRow}>
        <View style={styles.pulseDot} />
        <Text style={styles.systemStatusText}>
          Hệ thống Cloudflare KV realtime • 22 phòng VKU • {cloudReady ? 'đã nối' : 'đang nối'}
        </Text>
      </View>

      {showDateSwitcher && (
      <View style={styles.dateRow}>
        <Text style={styles.dateLabel}>Chọn ngày xem:</Text>
        <View style={styles.datePills}>
          <Pressable
            style={[styles.datePill, selectedDate === TODAY_STR && styles.datePillActive]}
            onPress={() => setSelectedDate(TODAY_STR)}
          >
            <Ionicons
              name="today-outline"
              size={13}
              color={selectedDate === TODAY_STR ? '#FFFFFF' : THEME.colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.datePillText,
                selectedDate === TODAY_STR && styles.datePillTextActive,
              ]}
            >
              Hôm nay ({TODAY_STR})
            </Text>
          </Pressable>

          <Pressable
            style={[styles.datePill, selectedDate === TOMORROW_STR && styles.datePillActive]}
            onPress={() => setSelectedDate(TOMORROW_STR)}
          >
            <Ionicons
              name="calendar-outline"
              size={13}
              color={selectedDate === TOMORROW_STR ? '#FFFFFF' : THEME.colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.datePillText,
                selectedDate === TOMORROW_STR && styles.datePillTextActive,
              ]}
            >
              Ngày mai ({TOMORROW_STR})
            </Text>
          </Pressable>
        </View>
      </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  bookingBadgeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: THEME.colors.primaryLight,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  systemStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.available,
  },
  systemStatusText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  datePills: {
    flexDirection: 'row',
    gap: 8,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  datePillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  datePillText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  datePillTextActive: {
    color: '#FFFFFF',
  },
});
