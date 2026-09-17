import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, StyleProp, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Room } from '../../types';
import { THEME } from '../../constants/theme';
import { useBookingStore } from '../../store/useBookingStore';
import { useAuthStore } from '../../store/useAuthStore';
import { decorateSlots } from '../../lib/booking-rules';

interface RoomCardProps {
  room: Room;
  style?: StyleProp<ViewStyle>;
  onSelect?: (room: Room) => void;
}

export const RoomCard = React.memo(function RoomCard({
  room,
  style,
  onSelect,
}: RoomCardProps) {
  const { selectedDate, openBookingModal, bookings } = useBookingStore();
  const studentId = useAuthStore((s) => s.session?.user.studentId);
  const daySlots = decorateSlots(room, selectedDate, bookings, studentId);
  const availableSlotsCount = daySlots.filter((s) => s.status === 'available').length;
  const totalSlotsCount = daySlots.length || 6;
  const occupancyRatio = Math.round((availableSlotsCount / totalSlotsCount) * 100);
  const isMaintenance = room.status === 'maintenance';

  const handlePress = () => {
    if (isMaintenance) {
      Alert.alert('Phòng đang bảo trì', `${room.name} tạm đóng để bảo trì thiết bị. Vui lòng chọn phòng khác.`);
      return;
    }
    if (onSelect) {
      onSelect(room);
    } else {
      openBookingModal(room);
    }
  };

  const handleLongPress = () => {
    Alert.alert(room.name, `${room.building}\nSức chứa: ${room.capacity} chỗ\n\n${room.description}`);
  };

  const getStatusBadge = () => {
    if (isMaintenance) {
      return {
        label: 'Bảo trì',
        color: THEME.colors.maintenance,
        bg: THEME.colors.maintenanceBg,
        border: THEME.colors.maintenanceBorder,
      };
    }
    if (availableSlotsCount === 0) {
      return {
        label: 'Đã kín lịch',
        color: THEME.colors.occupied,
        bg: THEME.colors.occupiedBg,
        border: THEME.colors.occupiedBorder,
      };
    }
    if (availableSlotsCount <= 2) {
      return {
        label: `Còn ${availableSlotsCount} ca`,
        color: THEME.colors.reserved,
        bg: THEME.colors.reservedBg,
        border: THEME.colors.reservedBorder,
      };
    }
    return {
      label: `Còn ${availableSlotsCount} ca trống`,
      color: THEME.colors.available,
      bg: THEME.colors.availableBg,
      border: THEME.colors.availableBorder,
    };
  };

  const getCategoryLabel = () => {
    switch (room.type) {
      case 'lab':
        return { text: 'Phòng Lab Chuyên ngành', color: '#1D4ED8', bg: '#EFF6FF' };
      case 'seminar':
        return { text: 'Hội trường & Hội thảo', color: '#6D28D9', bg: '#F5F3FF' };
      case 'library_quiet':
        return { text: 'Khu Tự học Yên tĩnh', color: '#047857', bg: '#ECFDF5' };
      case 'smart_classroom':
        return { text: 'Lớp học Thông minh', color: '#B45309', bg: '#FFFBEB' };
      case 'makerspace':
        return { text: 'MakerSpace & IoT', color: '#0369A1', bg: '#F0F9FF' };
      case 'meeting':
        return { text: 'Phòng họp nhóm', color: '#BE185D', bg: '#FDF2F8' };
      case 'studio':
        return { text: 'Studio & Media', color: '#7C3AED', bg: '#F5F3FF' };
      default:
        return { text: 'Phòng học VKU', color: '#475569', bg: '#F8FAFC' };
    }
  };

  const statusBadge = getStatusBadge();
  const categoryInfo = getCategoryLabel();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        style,
        pressed && styles.cardPressed,
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      hitSlop={8}
      android_ripple={{ color: 'rgba(0, 0, 0, 0.05)', borderless: false }}
    >
      {/* Room Photo matching slide 16 */}
      <View style={styles.imageContainer}>
          <Image
            source={{ uri: room.image }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        
        {/* Dark overlay for contrast */}
        <View style={styles.imageOverlay} />

        {/* Status Tag */}
        <View style={[styles.statusTag, { backgroundColor: statusBadge.bg, borderColor: statusBadge.border }]}>
          <View style={[styles.statusDot, { backgroundColor: statusBadge.color }]} />
          <Text style={[styles.statusText, { color: statusBadge.color }]}>
            {statusBadge.label}
          </Text>
        </View>

        {/* Floor badge */}
        <View style={styles.floorBadge}>
          <Ionicons name="layers-outline" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
          <Text style={styles.floorText}>Tầng {room.floor}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Category Pill */}
        <View style={[styles.categoryPill, { backgroundColor: categoryInfo.bg }]}>
          <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
            {categoryInfo.text}
          </Text>
        </View>

        {/* Header with Name & Seats Badge matching slide 14 & 15 */}
        <View style={styles.header}>
          <Text style={styles.roomName} numberOfLines={1}>
            {room.name}
          </Text>
          <View style={styles.badge}>
            <Ionicons name="people-outline" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>{room.capacity} chỗ</Text>
          </View>
        </View>

        {/* Location with vector icon instead of raw emoji */}
        <View style={styles.locationRow}>
          <Ionicons name="location-sharp" size={13} color={THEME.colors.primaryLight} style={{ marginRight: 4 }} />
          <Text style={styles.location} numberOfLines={1}>
            {room.building}
          </Text>
        </View>

        {/* Amenities preview */}
        <View style={styles.amenitiesRow}>
          {room.amenities.slice(0, 3).map((amenity, idx) => (
            <View key={idx} style={styles.amenityChip}>
              <Ionicons name="checkmark-circle-outline" size={11} color={THEME.colors.primaryLight} style={{ marginRight: 3 }} />
              <Text style={styles.amenityText} numberOfLines={1}>
                {amenity}
              </Text>
            </View>
          ))}
        </View>

        {/* Occupancy visual indicator bar */}
        <View style={styles.occupancySection}>
          <View style={styles.occupancyHeader}>
            <Text style={styles.occupancyLabel}>Tỉ lệ ca trống:</Text>
            <Text style={[styles.occupancyValue, { color: statusBadge.color }]}>
              {occupancyRatio}% ({availableSlotsCount}/{totalSlotsCount} ca)
            </Text>
          </View>
          <View style={styles.occupancyTrack}>
            <View
              style={[
                styles.occupancyFill,
                {
                  width: `${occupancyRatio}%`,
                  backgroundColor: statusBadge.color,
                },
              ]}
            />
          </View>
        </View>

        {/* Action button */}
        <View style={styles.footer}>
          <View style={styles.slotOverview}>
            <Ionicons name="calendar-outline" size={14} color={THEME.colors.textSecondary} />
            <Text style={styles.slotOverviewText}>Xem chi tiết ca học</Text>
          </View>
          <View style={[styles.bookButton, isMaintenance && styles.bookButtonDisabled]}>
            <Text style={styles.bookButtonText}>{isMaintenance ? 'Không đặt được' : 'Đặt phòng'}</Text>
            <Ionicons name="chevron-forward" size={13} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 165,
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
  },
  statusTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  floorBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  floorText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 14,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  roomName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    letterSpacing: -0.2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  location: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  amenityText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  occupancySection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  occupancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  occupancyLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  occupancyValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  occupancyTrack: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  occupancyFill: {
    height: '100%',
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  slotOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  slotOverviewText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  bookButtonDisabled: {
    backgroundColor: THEME.colors.maintenance,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
