import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useBookingStore, hoursFromBookings } from '../store/useBookingStore';
import { useAuthStore } from '../store/useAuthStore';
import { BookingCard } from '../components/bookings/BookingCard';
import { Header } from '../components/common/Header';
import { isActiveBooking } from '../lib/booking-rules';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigation/types';

export function MyBookingsScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { bookings, syncBookingLifecycles } = useBookingStore();
  const studentId = useAuthStore((s) => s.session?.user.studentId);
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('all');

  useEffect(() => {
    syncBookingLifecycles();
  }, [syncBookingLifecycles]);

  const mine = useMemo(
    () => bookings.filter((booking) => booking.studentId === studentId),
    [bookings, studentId]
  );
  const activeBookings = mine.filter((b) => isActiveBooking(b));
  const cancelledBookings = mine.filter((b) => b.status === 'cancelled');
  const hours = hoursFromBookings(mine, studentId ?? '');

  const displayedBookings =
    filter === 'active' ? activeBookings : filter === 'cancelled' ? cancelledBookings : mine;

  return (
    <View style={styles.container}>
      <Header showDateSwitcher={false} />
      <View style={styles.statsHeader}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeBookings.length}</Text>
          <Text style={styles.statLabel}>Phòng sắp tới</Text>
        </View>
        <View style={styles.statCardDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{hours}h</Text>
          <Text style={styles.statLabel}>Tổng giờ học</Text>
        </View>
        <View style={styles.statCardDivider} />
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{mine.length}</Text>
          <Text style={styles.statLabel}>Lượt đăng ký</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Tất cả ({mine.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterPill, filter === 'active' && styles.filterPillActive]}
          onPress={() => setFilter('active')}
        >
          <Text style={[styles.filterText, filter === 'active' && styles.filterTextActive]}>
            Có hiệu lực ({activeBookings.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.filterPill, filter === 'cancelled' && styles.filterPillActive]}
          onPress={() => setFilter('cancelled')}
        >
          <Text style={[styles.filterText, filter === 'cancelled' && styles.filterTextActive]}>
            Đã hủy ({cancelledBookings.length})
          </Text>
        </Pressable>
      </View>

      {/* Booking List */}
      <FlatList
        data={displayedBookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <BookingCard booking={item} />}
        contentContainerStyle={styles.listContent}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={54} color={THEME.colors.textMuted} />
            <Text style={styles.emptyTitle}>Chưa có lịch đặt phòng nào</Text>
            <Text style={styles.emptySub}>
              Bạn chưa có lịch mượn phòng trong mục này. Hãy duyệt danh sách phòng và chọn khung giờ phù hợp.
            </Text>
            <Pressable style={styles.browseBtn} onPress={() => navigation.navigate('Browse')}>
              <Ionicons name="search" size={16} color="#FFFFFF" />
              <Text style={styles.browseBtnText}>Khám phá & Đặt phòng ngay</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  statsHeader: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.primary,
    marginHorizontal: THEME.spacing.lg,
    marginTop: THEME.spacing.md,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
    ...THEME.shadows.md,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontWeight: '500',
  },
  statCardDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.lg,
    marginTop: 14,
    marginBottom: 6,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: THEME.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  filterPillActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 10,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.text,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 280,
    lineHeight: 18,
  },
  browseBtn: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
