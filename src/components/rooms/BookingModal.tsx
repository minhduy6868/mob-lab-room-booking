import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../constants/theme';
import { confirmAction } from '../../lib/confirm';
import { useBookingStore } from '../../store/useBookingStore';
import { useAuthStore } from '../../store/useAuthStore';
import { TODAY_STR, TOMORROW_STR } from '../../constants/mockRooms';
import {
  decorateSlots,
  getActiveBookingsForDay,
  MAX_SLOTS_PER_DAY,
  slotConflictHint,
} from '../../lib/booking-rules';
import { isSlotInPast } from '../../lib/time';
import { navigateToMainTab } from '../../navigation/types';

const PURPOSE_SUGGESTIONS = [
  'Học nhóm đồ án môn học',
  'Nghiên cứu khoa học sinh viên',
  'Luyện thi kết thúc học phần',
  'Họp Ban chủ nhiệm CLB VKU',
  'Tập dượt thuyết trình bảo vệ',
];

export function BookingModal() {
  const {
    selectedRoomForBooking: room,
    closeBookingModal,
    selectedDate,
    setSelectedDate,
    bookRoomSlot,
    bookings,
    openQRModal,
  } = useBookingStore();
  const session = useAuthStore((s) => s.session);
  const user = session?.user;

  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [purpose, setPurpose] = useState(PURPOSE_SUGGESTIONS[0]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const studentName = user?.fullName ?? '';
  const studentId = user?.studentId ?? '';
  const department = user?.major ?? '';

  const daySlots = useMemo(() => {
    if (!room || !user) return [];
    return decorateSlots(room, selectedDate, bookings, user.studentId);
  }, [room, selectedDate, bookings, user]);

  const dayCount = user
    ? getActiveBookingsForDay(bookings, user.studentId, selectedDate).length
    : 0;
  const dailyLimitReached = dayCount >= MAX_SLOTS_PER_DAY;

  if (!room || !user) return null;

  const morningSlots = daySlots.slice(0, 2);
  const afternoonEveningSlots = daySlots.slice(2);

  const handleSelectSlot = (slotId: string) => {
    const slot = daySlots.find((item) => item.id === slotId);
    setErrorMessage(null);
    if (!slot) return;

    if (room.status === 'maintenance') {
      setErrorMessage('Phòng đang bảo trì, không thể đặt ca này.');
      return;
    }
    if (isSlotInPast(selectedDate, slot.startTime)) {
      setErrorMessage('Ca này đã bắt đầu hoặc đã qua. Không thể đặt phòng trễ.');
      return;
    }
    const hint = slotConflictHint(slot, bookings, user.studentId, selectedDate);
    if (hint && slot.status !== 'available') {
      setErrorMessage(
        slot.status === 'occupied'
          ? `Xung đột lịch phòng! ${hint}. Vui lòng chọn ca khác.`
          : hint
      );
      return;
    }
    if (hint?.startsWith('Trùng')) {
      setErrorMessage(
        `Xung đột lịch cá nhân! ${hint}. Bạn không thể có mặt ở hai phòng cùng một khung giờ.`
      );
      return;
    }
    if (dailyLimitReached) {
      setErrorMessage(
        `Bạn đã đặt đủ ${MAX_SLOTS_PER_DAY} ca trong ngày ${selectedDate}. Hủy một lịch cũ để đặt ca mới.`
      );
      return;
    }
    setSelectedSlotId(slotId);
  };

  const commitBooking = async () => {
    if (!selectedSlotId || submitting) return;
    setSubmitting(true);
    const result = await bookRoomSlot({
      roomId: room.id,
      date: selectedDate,
      slotId: selectedSlotId,
      studentName,
      studentId,
      department,
      purpose,
    });
    setSubmitting(false);

    if (result.success) {
      setSelectedSlotId(null);
      setErrorMessage(null);
      if (result.booking) {
        navigateToMainTab('Bookings');
        openQRModal(result.booking);
      }
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedSlotId) {
      setErrorMessage('Vui lòng chọn 1 khung giờ muốn đặt phòng!');
      return;
    }
    const slot = daySlots.find((item) => item.id === selectedSlotId);
    confirmAction(
      'Xác nhận đặt phòng',
      `${room.name}\n${slot?.label ?? ''}\nNgày ${selectedDate}\nSinh viên: ${studentName} (${studentId})`,
      'Xác nhận',
      () => {
        void commitBooking();
      }
    );
  };

  const renderSlotCard = (slot: (typeof daySlots)[0]) => {
    const isSelected = selectedSlotId === slot.id;
    const isOccupied = slot.status === 'occupied';
    const isMyBooking = slot.status === 'my_booking';
    const isPast = isSlotInPast(selectedDate, slot.startTime);
    const overlapHint = slotConflictHint(slot, bookings, user.studentId, selectedDate);
    const isPersonalConflict = overlapHint?.startsWith('Trùng') ?? false;
    const blocked = isOccupied || isMyBooking || isPast || isPersonalConflict || dailyLimitReached;

    let badge = 'Còn trống';
    if (isPast) badge = 'Đã qua';
    else if (isOccupied) badge = 'Đã kín';
    else if (isMyBooking) badge = 'Lịch của bạn';
    else if (isPersonalConflict) badge = 'Trùng lịch';
    else if (isSelected) badge = 'Đang chọn';

    return (
      <Pressable
        key={slot.id}
        style={({ pressed }) => [
          styles.slotCard,
          isSelected && styles.slotCardSelected,
          (isOccupied || isPersonalConflict) && styles.slotCardOccupied,
          isMyBooking && styles.slotCardMyBooking,
          isPast && styles.slotCardOccupied,
          pressed && !blocked && { opacity: 0.8 },
        ]}
        onPress={() => handleSelectSlot(slot.id)}
      >
        <View style={styles.slotLeft}>
          <Ionicons
            name={
              isPast
                ? 'time'
                : isOccupied
                ? 'lock-closed'
                : isMyBooking
                ? 'checkmark-done-circle'
                : isPersonalConflict
                ? 'warning'
                : isSelected
                ? 'radio-button-on'
                : 'time-outline'
            }
            size={18}
            color={
              blocked && !isSelected
                ? THEME.colors.occupied
                : isSelected
                ? THEME.colors.primaryLight
                : THEME.colors.textSecondary
            }
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.slotLabel,
                isSelected && styles.slotLabelSelected,
                blocked && styles.slotLabelOccupied,
              ]}
            >
              {slot.label}
            </Text>
            {overlapHint ? <Text style={styles.slotBookedBy}>{overlapHint}</Text> : null}
          </View>
        </View>

        <View
          style={[
            styles.slotStatusBadge,
            blocked && !isSelected ? styles.badgeOccupied : isSelected ? styles.badgeSelected : styles.badgeAvailable,
            isMyBooking && styles.badgeMyBooking,
          ]}
        >
          <Text
            style={[
              styles.slotBadgeText,
              blocked && !isSelected ? styles.badgeTextOccupied : isSelected ? styles.badgeTextSelected : styles.badgeTextAvailable,
              isMyBooking && styles.badgeTextMyBooking,
            ]}
          >
            {badge}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={!!room}
      animationType="slide"
      transparent
      onRequestClose={closeBookingModal}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
          style={{ justifyContent: 'flex-end', flex: 1 }}
        >
        <View style={styles.modalContent}>
          {/* Top Grab Handle conforming to Expo Native UI standards */}
          <View style={styles.sheetHandleContainer}>
            <View style={styles.sheetHandle} />
          </View>

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>{room.name}</Text>
              <View style={styles.locationSubRow}>
                <Ionicons name="location-sharp" size={13} color={THEME.colors.primaryLight} style={{ marginRight: 4 }} />
                <Text style={styles.modalSub}>{room.building}</Text>
              </View>
            </View>
            <Pressable
              onPress={closeBookingModal}
              hitSlop={10}
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="close" size={20} color={THEME.colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Room Image & Badges */}
            <View style={styles.imageBox}>
              <Image source={{ uri: room.image }} style={styles.roomImage} contentFit="cover" transition={200} />
              <View style={styles.capacityBadge}>
                <Ionicons name="people" size={14} color="#FFFFFF" />
                <Text style={styles.capacityText}>{room.capacity} chỗ ngồi</Text>
              </View>
              <View style={styles.floorPill}>
                <Text style={styles.floorPillText}>Tầng {room.floor}</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.descriptionText}>{room.description}</Text>

            {/* Amenities Grid */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Trang thiết bị & Tiện ích sẵn có</Text>
              <View style={styles.amenitiesGrid}>
                {room.amenities.map((item, idx) => (
                  <View key={idx} style={styles.amenityItem}>
                    <Ionicons name="checkmark-circle" size={14} color={THEME.colors.available} />
                    <Text style={styles.amenityLabel}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Date Switcher */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>1. Chọn ngày đặt phòng</Text>
              <View style={styles.dateButtons}>
                <Pressable
                  style={[styles.dateButton, selectedDate === TODAY_STR && styles.dateButtonActive]}
                  onPress={() => {
                    setSelectedDate(TODAY_STR);
                    setSelectedSlotId(null);
                    setErrorMessage(null);
                  }}
                >
                  <Ionicons
                    name="today-outline"
                    size={16}
                    color={selectedDate === TODAY_STR ? '#FFFFFF' : THEME.colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.dateBtnText,
                      selectedDate === TODAY_STR && styles.dateBtnTextActive,
                    ]}
                  >
                    Hôm nay ({TODAY_STR})
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.dateButton, selectedDate === TOMORROW_STR && styles.dateButtonActive]}
                  onPress={() => {
                    setSelectedDate(TOMORROW_STR);
                    setSelectedSlotId(null);
                    setErrorMessage(null);
                  }}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={selectedDate === TOMORROW_STR ? '#FFFFFF' : THEME.colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.dateBtnText,
                      selectedDate === TOMORROW_STR && styles.dateBtnTextActive,
                    ]}
                  >
                    Ngày mai ({TOMORROW_STR})
                  </Text>
                </Pressable>
              </View>
            </View>

            {dailyLimitReached && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={THEME.colors.occupied} />
                <Text style={styles.errorText}>
                  Bạn đã đủ {MAX_SLOTS_PER_DAY} ca trong ngày này ({dayCount}/{MAX_SLOTS_PER_DAY}). Hủy một lịch cũ nếu muốn đổi phòng.
                </Text>
              </View>
            )}

            {/* Time Slots & Conflict Prevention Selector */}
            <View style={styles.sectionBox}>
              <View style={styles.slotHeaderRow}>
                <Text style={styles.sectionTitle}>2. Chọn ca học (Time Slot)</Text>
                <View style={styles.conflictBadge}>
                  <Ionicons name="shield-checkmark" size={12} color={THEME.colors.primaryLight} style={{ marginRight: 3 }} />
                  <Text style={styles.conflictNotice}>Kiểm tra xung đột tự động</Text>
                </View>
              </View>

              {/* Morning Session */}
              <Text style={styles.sessionGroupTitle}>Buổi Sáng (Morning)</Text>
              <View style={styles.slotList}>
                {morningSlots.map(renderSlotCard)}
              </View>

              {/* Afternoon & Evening Session */}
              <Text style={[styles.sessionGroupTitle, { marginTop: 14 }]}>Buổi Chiều & Tối (Afternoon / Evening)</Text>
              <View style={styles.slotList}>
                {afternoonEveningSlots.map(renderSlotCard)}
              </View>
            </View>

            {/* Student Info & Purpose Form */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>3. Thông tin sinh viên đăng ký</Text>

              {/* Verified Student Badge */}
              <View style={styles.studentBadgeCard}>
                <Image source={{ uri: user.avatar }} style={styles.studentAvatarMini} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.studentBadgeName}>{studentName}</Text>
                  <Text style={styles.studentBadgeMeta}>MSSV: {studentId} • {user.faculty}</Text>
                </View>
                <View style={styles.verifiedTag}>
                  <Ionicons name="shield-checkmark" size={12} color={THEME.colors.available} />
                  <Text style={styles.verifiedText}>Đã xác thực</Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mục đích sử dụng phòng</Text>
                <TextInput
                  style={[styles.formInput, styles.formInputArea]}
                  value={purpose}
                  onChangeText={setPurpose}
                  placeholder="Nhập mục đích mượn phòng..."
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* Quick Purpose Chips */}
              <View style={styles.purposeChips}>
                {PURPOSE_SUGGESTIONS.map((item, idx) => (
                  <Pressable
                    key={idx}
                    style={[
                      styles.purposeChip,
                      purpose === item && styles.purposeChipActive,
                    ]}
                    onPress={() => setPurpose(item)}
                  >
                    <Text
                      style={[
                        styles.purposeChipText,
                        purpose === item && styles.purposeChipTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Error Message banner */}
            {errorMessage && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={THEME.colors.occupied} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <Pressable style={styles.cancelBtn} onPress={closeBookingModal}>
              <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                (!selectedSlotId || submitting || dailyLimitReached) && styles.submitBtnDisabled,
                pressed && { opacity: 0.85 },
              ]}
              onPress={handleConfirmBooking}
              disabled={!selectedSlotId || submitting || dailyLimitReached}
            >
              <Ionicons name="checkmark-done" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Xác nhận & Nhận mã QR</Text>
            </Pressable>
          </View>
        </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 20,
    ...THEME.shadows.lg,
  },
  sheetHandleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  locationSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  modalSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    paddingHorizontal: 20,
  },
  imageBox: {
    position: 'relative',
    height: 170,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 14,
    backgroundColor: '#E2E8F0',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  capacityBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  capacityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  floorPill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  floorPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
    marginTop: 12,
  },
  sectionBox: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: 8,
  },
  sessionGroupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
    marginTop: 4,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  amenityLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  dateButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceAlt,
  },
  dateButtonActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  dateBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  dateBtnTextActive: {
    color: '#FFFFFF',
  },
  slotHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conflictBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  conflictNotice: {
    fontSize: 11,
    color: THEME.colors.primaryLight,
    fontWeight: '600',
  },
  slotList: {
    gap: 8,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  slotCardSelected: {
    borderColor: THEME.colors.primaryLight,
    backgroundColor: '#EFF6FF',
  },
  slotCardOccupied: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    opacity: 0.75,
  },
  slotCardMyBooking: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  slotLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.text,
  },
  slotLabelSelected: {
    color: THEME.colors.primaryLight,
    fontWeight: '700',
  },
  slotLabelOccupied: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  slotBookedBy: {
    fontSize: 11,
    color: THEME.colors.occupied,
    marginTop: 2,
    fontWeight: '500',
  },
  slotMyBookingNote: {
    fontSize: 11,
    color: THEME.colors.available,
    fontWeight: '600',
    marginTop: 2,
  },
  slotStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeAvailable: {
    backgroundColor: THEME.colors.availableBg,
  },
  badgeSelected: {
    backgroundColor: THEME.colors.primaryLight,
  },
  badgeOccupied: {
    backgroundColor: THEME.colors.occupiedBg,
  },
  badgeMyBooking: {
    backgroundColor: '#DCFCE7',
  },
  slotBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextAvailable: {
    color: THEME.colors.available,
  },
  badgeTextSelected: {
    color: '#FFFFFF',
  },
  badgeTextOccupied: {
    color: THEME.colors.occupied,
  },
  badgeTextMyBooking: {
    color: '#15803D',
  },
  studentBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
    marginBottom: 12,
  },
  studentAvatarMini: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  studentBadgeName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  studentBadgeMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.available,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formHalf: {
    flex: 1,
  },
  formGroup: {
    marginTop: 10,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
    marginBottom: 4,
  },
  formInput: {
    backgroundColor: THEME.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: THEME.colors.text,
  },
  formInputArea: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  purposeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  purposeChip: {
    backgroundColor: THEME.colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  purposeChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  purposeChipText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  purposeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginTop: 14,
  },
  errorText: {
    color: THEME.colors.occupied,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: THEME.colors.textMuted,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
