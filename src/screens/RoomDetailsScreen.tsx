import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { THEME } from '../constants/theme';
import { DateStrip } from '../components/common/DateStrip';
import { useAuthStore } from '../store/useAuthStore';
import { useBookingStore } from '../store/useBookingStore';
import { decorateSlots } from '../lib/booking-rules';
import { isSlotInPast } from '../lib/time';
import { TimeSlot } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RoomDetails'>;

function getTypeLabel(type: string) {
  switch (type) {
    case 'lab':
      return 'Phòng Lab';
    case 'seminar':
      return 'Hội thảo';
    case 'library_quiet':
      return 'Tự học yên tĩnh';
    case 'smart_classroom':
      return 'Smart Classroom';
    case 'makerspace':
      return 'MakerSpace';
    case 'meeting':
      return 'Họp nhóm';
    case 'studio':
      return 'Studio';
    default:
      return 'Phòng VKU';
  }
}

function getSlotMeta(slot: TimeSlot, selectedDate: string) {
  if (isSlotInPast(selectedDate, slot.startTime)) {
    return {
      label: 'Đã qua',
      icon: 'time',
      color: THEME.colors.textMuted,
      bg: THEME.colors.surfaceAlt,
      border: THEME.colors.border,
    } as const;
  }
  if (slot.status === 'my_booking') {
    return {
      label: 'Lịch của bạn',
      icon: 'checkmark-done-circle',
      color: THEME.colors.available,
      bg: THEME.colors.availableBg,
      border: THEME.colors.availableBorder,
    } as const;
  }
  if (slot.status === 'occupied') {
    return {
      label: 'Đã kín',
      icon: 'lock-closed',
      color: THEME.colors.occupied,
      bg: THEME.colors.occupiedBg,
      border: THEME.colors.occupiedBorder,
    } as const;
  }
  return {
    label: 'Còn trống',
    icon: 'radio-button-off',
    color: THEME.colors.available,
    bg: THEME.colors.availableBg,
    border: THEME.colors.availableBorder,
  } as const;
}

export function RoomDetailsScreen({ route, navigation }: Props) {
  const rooms = useBookingStore((s) => s.rooms);
  const bookings = useBookingStore((s) => s.bookings);
  const selectedDate = useBookingStore((s) => s.selectedDate);
  const openBookingModal = useBookingStore((s) => s.openBookingModal);
  const studentId = useAuthStore((s) => s.session?.user.studentId);
  const room = rooms.find((item) => item.id === route.params.roomId);

  const daySlots = useMemo(() => {
    if (!room) return [];
    return decorateSlots(room, selectedDate, bookings, studentId);
  }, [room, selectedDate, bookings, studentId]);

  if (!room) {
    return (
      <View style={styles.stateBox}>
        <Ionicons name="alert-circle-outline" size={44} color={THEME.colors.textMuted} />
        <Text style={styles.stateTitle}>Không tìm thấy phòng</Text>
        <Pressable style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnText}>Quay lại danh sách</Text>
        </Pressable>
      </View>
    );
  }

  const isMaintenance = room.status === 'maintenance';
  const availableSlots = daySlots.filter(
    (slot) => slot.status === 'available' && !isSlotInPast(selectedDate, slot.startTime)
  ).length;
  const canBook = !isMaintenance && availableSlots > 0;
  const statusColor = isMaintenance
    ? THEME.colors.maintenance
    : availableSlots > 0
    ? THEME.colors.available
    : THEME.colors.occupied;
  const statusLabel = isMaintenance
    ? 'Đang bảo trì'
    : availableSlots > 0
    ? `Còn ${availableSlots} ca trống`
    : 'Đã kín lịch';

  const handleOpenBooking = () => {
    if (canBook) {
      openBookingModal(room);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.hero}>
          <Image source={{ uri: room.image }} style={styles.heroImage} contentFit="cover" transition={220} />
          <View style={styles.heroShade} />
          <View style={styles.heroTopRow}>
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>{getTypeLabel(room.type)}</Text>
            </View>
            <View style={styles.floorPill}>
              <Ionicons name="layers-outline" size={13} color="#FFFFFF" />
              <Text style={styles.floorPillText}>Tầng {room.floor}</Text>
            </View>
          </View>
          <View style={styles.heroBottom}>
            <Text style={styles.heroTitle}>{room.name}</Text>
            <View style={styles.heroMetaRow}>
              <Ionicons name="location-sharp" size={14} color="#BFDBFE" />
              <Text style={styles.heroMetaText}>{room.building}</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Ionicons name="people-outline" size={20} color={THEME.colors.primaryLight} />
            <Text style={styles.summaryValue}>{room.capacity}</Text>
            <Text style={styles.summaryLabel}>Chỗ ngồi</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="business-outline" size={20} color={THEME.colors.primaryLight} />
            <Text style={styles.summaryValue}>{room.buildingCode}</Text>
            <Text style={styles.summaryLabel}>Khu nhà</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="calendar-outline" size={20} color={statusColor} />
            <Text style={[styles.summaryValue, { color: statusColor }]}>{availableSlots}/{daySlots.length || 6}</Text>
            <Text style={styles.summaryLabel}>Ca trống</Text>
          </View>
        </View>

        <View style={styles.statusBanner}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusBannerText, { color: statusColor }]}>{statusLabel}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mô tả phòng</Text>
          <Text style={styles.description}>{room.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tiện ích</Text>
          <View style={styles.amenitiesGrid}>
            {room.amenities.map((amenity) => (
              <View key={amenity} style={styles.amenityChip}>
                <Ionicons name="checkmark-circle" size={14} color={THEME.colors.available} />
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ngày đặt phòng</Text>
          <DateStrip />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lịch ca học</Text>
          <View style={styles.slotList}>
            {daySlots.map((slot) => {
              const meta = getSlotMeta(slot, selectedDate);
              const disabled = isMaintenance || meta.label !== 'Còn trống';
              return (
                <Pressable
                  key={slot.id}
                  style={[styles.slotCard, { backgroundColor: meta.bg, borderColor: meta.border }]}
                  onPress={handleOpenBooking}
                  disabled={disabled}
                >
                  <View style={styles.slotLeft}>
                    <Ionicons name={meta.icon} size={18} color={meta.color} />
                    <View style={styles.slotTextBlock}>
                      <Text style={styles.slotLabel}>{slot.label}</Text>
                      {slot.bookedBy || slot.purpose ? (
                        <Text style={styles.slotSub} numberOfLines={1}>
                          {slot.bookedBy || slot.purpose}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <Text style={[styles.slotStatus, { color: meta.color }]}>{meta.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            !canBook && styles.primaryBtnDisabled,
            pressed && canBook && { opacity: 0.88 },
          ]}
          onPress={handleOpenBooking}
          disabled={!canBook}
        >
          <Ionicons name="calendar" size={18} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>{canBook ? 'Đặt phòng này' : 'Không có ca khả dụng'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  contentContainer: {
    paddingBottom: 104,
  },
  hero: {
    height: 260,
    position: 'relative',
    backgroundColor: THEME.colors.primaryDark,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
  },
  heroTopRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typePill: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  floorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  floorPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroBottom: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  heroMetaText: {
    color: '#E0F2FE',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.text,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '700',
  },
  statusBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBannerText: {
    fontSize: 13,
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    color: THEME.colors.textSecondary,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  amenityText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  dateBtnActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  dateBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
  },
  dateBtnTextActive: {
    color: '#FFFFFF',
  },
  slotList: {
    gap: 8,
  },
  slotCard: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  slotTextBlock: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  slotSub: {
    marginTop: 2,
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  slotStatus: {
    fontSize: 11,
    fontWeight: '900',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    padding: 16,
  },
  primaryBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtnDisabled: {
    backgroundColor: THEME.colors.textMuted,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: THEME.colors.background,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.text,
  },
});
