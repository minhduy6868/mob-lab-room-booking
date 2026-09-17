import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { useBookingStore } from '../../store/useBookingStore';

const CATEGORIES = [
  { id: 'all', label: 'Tất cả loại phòng', icon: 'grid-outline' as const },
  { id: 'lab', label: 'Phòng Thực hành & Lab', icon: 'desktop-outline' as const },
  { id: 'seminar', label: 'Hội trường & Seminar', icon: 'mic-outline' as const },
  { id: 'library_quiet', label: 'Thư viện & Tự học', icon: 'book-outline' as const },
  { id: 'smart_classroom', label: 'Lớp thông minh', icon: 'easel-outline' as const },
  { id: 'makerspace', label: 'MakerSpace & IoT', icon: 'hardware-chip-outline' as const },
  { id: 'meeting', label: 'Phòng họp nhóm', icon: 'people-outline' as const },
  { id: 'studio', label: 'Studio & Media', icon: 'videocam-outline' as const },
];

const BUILDINGS = [
  { id: 'all', label: 'Tất cả tòa nhà' },
  { id: 'Building A', label: 'Khu A' },
  { id: 'Building B', label: 'Khu B' },
  { id: 'Building C', label: 'Khu C' },
  { id: 'Innovation Hub', label: 'Tòa V Sáng tạo' },
  { id: 'Central Library', label: 'Thư viện' },
  { id: 'Building K', label: 'Ký túc xá' },
];

export function FilterChips() {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedBuilding,
    setSelectedBuilding,
    selectedStatus,
    setSelectedStatus,
  } = useBookingStore();

  return (
    <View style={styles.container}>
      {/* Category Filter Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              style={({ pressed }) => [
                styles.chip,
                isActive && styles.chipActive,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => setSelectedCategory(cat.id)}
              hitSlop={6}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={isActive ? '#FFFFFF' : THEME.colors.textSecondary}
              />
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Secondary Row: Buildings & Availability */}
      <View style={styles.secondaryRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subScrollList}
        >
          {/* Status Quick Filter */}
          <Pressable
            style={[
              styles.subPill,
              selectedStatus === 'available' && styles.subPillActiveAvailable,
            ]}
            onPress={() =>
              setSelectedStatus(selectedStatus === 'available' ? 'all' : 'available')
            }
          >
            <View style={[styles.dot, { backgroundColor: THEME.colors.available }]} />
            <Text
              style={[
                styles.subPillText,
                selectedStatus === 'available' && styles.subPillTextActive,
              ]}
            >
              Chỉ phòng còn trống
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.subPill,
              selectedStatus === 'occupied' && styles.subPillActiveOccupied,
            ]}
            onPress={() =>
              setSelectedStatus(selectedStatus === 'occupied' ? 'all' : 'occupied')
            }
          >
            <View style={[styles.dot, { backgroundColor: THEME.colors.occupied }]} />
            <Text
              style={[
                styles.subPillText,
                selectedStatus === 'occupied' && styles.subPillTextActive,
              ]}
            >
              Đã kín / bảo trì
            </Text>
          </Pressable>

          {/* Building Pills */}
          {BUILDINGS.map((b) => {
            const isActive = selectedBuilding === b.id;
            return (
              <Pressable
                key={b.id}
                style={[styles.subPill, isActive && styles.subPillActive]}
                onPress={() => setSelectedBuilding(b.id)}
              >
                <Text style={[styles.subPillText, isActive && styles.subPillTextActive]}>
                  {b.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: THEME.spacing.xs,
    backgroundColor: THEME.colors.background,
  },
  scrollList: {
    paddingHorizontal: THEME.spacing.lg,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
  },
  chipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  secondaryRow: {
    marginTop: 6,
  },
  subScrollList: {
    paddingHorizontal: THEME.spacing.lg,
    gap: 6,
  },
  subPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
  },
  subPillActive: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primaryLight,
  },
  subPillActiveAvailable: {
    backgroundColor: THEME.colors.availableBg,
    borderColor: THEME.colors.available,
  },
  subPillActiveOccupied: {
    backgroundColor: THEME.colors.occupiedBg,
    borderColor: THEME.colors.occupied,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  subPillText: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
  },
  subPillTextActive: {
    color: THEME.colors.text,
    fontWeight: '700',
  },
});
