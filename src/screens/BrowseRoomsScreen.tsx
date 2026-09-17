import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { useBookingStore } from '../store/useBookingStore';
import { useAuthStore } from '../store/useAuthStore';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { SearchBar } from '../components/common/SearchBar';
import { FilterChips } from '../components/common/FilterChips';
import { Header } from '../components/common/Header';
import { RoomCard } from '../components/rooms/RoomCard';
import { Room } from '../types';
import { decorateSlots } from '../lib/booking-rules';
import { fetchRoomCatalog } from '../api/query-client';

export function BrowseRoomsScreen() {
  const {
    rooms,
    replaceRooms,
    bookings,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedBuilding,
    setSelectedBuilding,
    selectedStatus,
    setSelectedStatus,
    selectedDate,
  } = useBookingStore();
  const studentId = useAuthStore((s) => s.session?.user.studentId);
  const { columns, cardWidth, horizontalPadding, cardGap } = useResponsiveLayout();

  const roomsQuery = useQuery({
    queryKey: ['rooms-catalog'],
    queryFn: fetchRoomCatalog,
    staleTime: 60_000,
  });

  const onRefresh = useCallback(async () => {
    await useBookingStore.getState().hydrateFromCloud();
    const data = await roomsQuery.refetch();
    if (data.data) {
      replaceRooms(data.data);
    }
  }, [replaceRooms, roomsQuery]);

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName = room.name.toLowerCase().includes(q);
        const matchesBuilding = room.building.toLowerCase().includes(q);
        const matchesAmenity = room.amenities.some((a) => a.toLowerCase().includes(q));
        const matchesDesc = room.description.toLowerCase().includes(q);
        if (!matchesName && !matchesBuilding && !matchesAmenity && !matchesDesc) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && room.type !== selectedCategory) {
        return false;
      }

      if (selectedBuilding !== 'all' && room.buildingCode !== selectedBuilding) {
        return false;
      }

      const slots = decorateSlots(room, selectedDate, bookings, studentId);
      const hasAvailable = room.status !== 'maintenance' && slots.some((s) => s.status === 'available');

      if (selectedStatus === 'available' && !hasAvailable) {
        return false;
      }
      if (selectedStatus === 'occupied' && hasAvailable) {
        return false;
      }

      return true;
    });
  }, [rooms, bookings, searchQuery, selectedCategory, selectedBuilding, selectedStatus, selectedDate, studentId]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedBuilding('all');
    setSelectedStatus('all');
  };

  const renderItem = useCallback(
    ({ item }: { item: Room }) => (
      <View style={{ width: cardWidth, marginBottom: cardGap }}>
        <RoomCard room={item} />
      </View>
    ),
    [cardWidth, cardGap]
  );

  const isInitialLoading = roomsQuery.isLoading && rooms.length === 0;
  const isError = roomsQuery.isError && rooms.length === 0;

  return (
    <View style={styles.container}>
      <Header />
      <SearchBar
        query={searchQuery}
        onChangeQuery={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />
      <FilterChips />

      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>
          Tìm thấy <Text style={styles.resultsCount}>{filteredRooms.length}</Text> phòng học & lab
        </Text>
        {(selectedCategory !== 'all' ||
          selectedBuilding !== 'all' ||
          selectedStatus !== 'all' ||
          searchQuery.length > 0) && (
          <Pressable onPress={handleResetFilters} hitSlop={6}>
            <Text style={styles.resetFilterText}>Đặt lại bộ lọc</Text>
          </Pressable>
        )}
      </View>

      {isInitialLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={THEME.colors.primary} />
          <Text style={styles.stateText}>Đang tải danh mục phòng VKU...</Text>
        </View>
      ) : isError ? (
        <View style={styles.stateBox}>
          <Ionicons name="cloud-offline-outline" size={42} color={THEME.colors.textMuted} />
          <Text style={styles.emptyTitle}>Không tải được danh sách phòng</Text>
          <Pressable style={styles.resetBtn} onPress={onRefresh}>
            <Text style={styles.resetBtnText}>Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          numColumns={columns}
          key={columns}
          renderItem={renderItem}
          columnWrapperStyle={columns > 1 ? { justifyContent: 'space-between' } : undefined}
          contentContainerStyle={[styles.listContainer, { paddingHorizontal: horizontalPadding }]}
          contentInsetAdjustmentBehavior="automatic"
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={process.env.EXPO_OS !== 'web'}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={roomsQuery.isRefetching} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={THEME.colors.textMuted} />
              <Text style={styles.emptyTitle}>Không tìm thấy phòng phù hợp</Text>
              <Text style={styles.emptySub}>
                Hãy thử tìm kiếm với từ khóa khác hoặc bỏ bớt các điều kiện lọc.
              </Text>
              <Pressable style={styles.resetBtn} onPress={handleResetFilters}>
                <Text style={styles.resetBtnText}>Xem tất cả phòng</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  resultsCount: {
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  resetFilterText: {
    fontSize: 12,
    color: THEME.colors.primaryLight,
    fontWeight: '600',
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 24,
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
  resetBtn: {
    marginTop: 16,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  stateText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
  },
});
