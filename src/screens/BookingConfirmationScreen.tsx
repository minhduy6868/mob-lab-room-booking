import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { THEME } from '../constants/theme';
import { notify } from '../lib/confirm';
import { useBookingStore } from '../store/useBookingStore';

type Props = NativeStackScreenProps<RootStackParamList, 'BookingConfirmation'>;

export function BookingConfirmationScreen({ route, navigation }: Props) {
  const bookings = useBookingStore((s) => s.bookings);
  const lastConfirmedBooking = useBookingStore((s) => s.lastConfirmedBooking);
  const checkInBooking = useBookingStore((s) => s.checkInBooking);
  const closeQRModal = useBookingStore((s) => s.closeQRModal);
  const booking =
    bookings.find((item) => item.id === route.params.bookingId) ??
    (lastConfirmedBooking?.id === route.params.bookingId ? lastConfirmedBooking : undefined);

  if (!booking) {
    return (
      <View style={styles.stateBox}>
        <Ionicons name="ticket-outline" size={48} color={THEME.colors.textMuted} />
        <Text style={styles.stateTitle}>Không tìm thấy mã đặt phòng</Text>
        <Pressable
          style={[styles.primaryBtn, styles.stateActionBtn]}
          onPress={() => navigation.navigate('Main', { screen: 'Bookings' })}
        >
          <Text style={styles.primaryBtnText}>Xem lịch của tôi</Text>
        </Pressable>
      </View>
    );
  }

  const isOngoing = booking.status === 'ongoing';
  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';
  const statusText = isOngoing
    ? 'Đang sử dụng phòng'
    : isCompleted
    ? 'Đã hoàn tất'
    : isCancelled
    ? 'Đã hủy'
    : 'Đã xác nhận đặt chỗ';
  const statusColor = isCancelled
    ? THEME.colors.occupied
    : isCompleted
    ? THEME.colors.maintenance
    : isOngoing
    ? THEME.colors.primaryLight
    : THEME.colors.available;

  const handleCheckIn = async () => {
    const result = await checkInBooking(booking.id);
    closeQRModal();
    notify(
      result.success ? 'Check-in thành công' : 'Không thể check-in',
      result.message,
      result.success ? 'success' : 'danger'
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.passCard}>
          <View style={styles.passHeader}>
            <View style={styles.vkuLogo}>
              <Text style={styles.vkuLogoText}>VKU</Text>
            </View>
            <View style={styles.headerTextBlock}>
              <Text style={styles.passTitle}>THẺ VÀO PHÒNG HỌC</Text>
              <Text style={styles.passSub}>DIGITAL ACCESS PASS</Text>
            </View>
          </View>

          <View style={styles.roomBlock}>
            <Text style={styles.roomName}>{booking.roomName}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={14} color={THEME.colors.primaryLight} />
              <Text style={styles.locationText}>{booking.building}</Text>
            </View>
          </View>

          <View style={styles.qrPanel}>
            <View style={styles.qrFrame}>
              <View style={[styles.finderPattern, styles.finderTopLeft]}>
                <View style={styles.finderInner} />
              </View>
              <View style={[styles.finderPattern, styles.finderTopRight]}>
                <View style={styles.finderInner} />
              </View>
              <View style={[styles.finderPattern, styles.finderBottomLeft]}>
                <View style={styles.finderInner} />
              </View>
              <Ionicons name="qr-code" size={112} color={THEME.colors.primary} />
            </View>
            <Text style={styles.codeLabel} selectable>
              {booking.bookingCode}
            </Text>
            <Text style={styles.scanHint}>Đưa mã này lại gần đầu đọc camera tại cửa phòng</Text>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
          </View>

          <View style={styles.detailsBox}>
            <DetailRow label="Thời gian" value={`${booking.slotLabel} (${booking.date})`} />
            <DetailRow label="Sinh viên" value={`${booking.studentName} (${booking.studentId})`} />
            <DetailRow label="Mục đích" value={booking.purpose} />
            <DetailRow label="Khoa/ngành" value={booking.department} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!isOngoing && !isCompleted && !isCancelled && (
          <Pressable style={styles.checkInBtn} onPress={handleCheckIn}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.checkInBtnText}>Mô phỏng Check-in</Text>
          </Pressable>
        )}
        <View style={styles.footerRow}>
          <Pressable style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.secondaryBtnText}>Đóng</Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate('Main', { screen: 'Bookings' })}>
            <Ionicons name="calendar" size={17} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Lịch của tôi</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2} selectable>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 148,
  },
  passCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.lg,
  },
  passHeader: {
    backgroundColor: THEME.colors.primary,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vkuLogo: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  vkuLogoText: {
    color: THEME.colors.primary,
    fontWeight: '900',
    fontSize: 16,
  },
  headerTextBlock: {
    flex: 1,
  },
  passTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  passSub: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  roomBlock: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  roomName: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.text,
    textAlign: 'center',
  },
  locationRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: THEME.colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  qrPanel: {
    margin: 18,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: THEME.colors.border,
    borderStyle: 'dashed',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    padding: 18,
  },
  qrFrame: {
    width: 168,
    height: 168,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  finderPattern: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderWidth: 3,
    borderColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finderInner: {
    width: 10,
    height: 10,
    backgroundColor: THEME.colors.primary,
  },
  finderTopLeft: {
    top: 8,
    left: 8,
  },
  finderTopRight: {
    top: 8,
    right: 8,
  },
  finderBottomLeft: {
    bottom: 8,
    left: 8,
  },
  codeLabel: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: 2,
  },
  scanHint: {
    marginTop: 6,
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusRow: {
    marginHorizontal: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.surfaceAlt,
    borderRadius: 12,
    padding: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '900',
  },
  detailsBox: {
    marginHorizontal: 18,
    marginBottom: 18,
    backgroundColor: THEME.colors.surfaceAlt,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontWeight: '800',
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    color: THEME.colors.text,
    fontWeight: '800',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    gap: 10,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.available,
    borderRadius: 12,
    paddingVertical: 13,
  },
  checkInBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surfaceAlt,
  },
  secondaryBtnText: {
    color: THEME.colors.textSecondary,
    fontSize: 14,
    fontWeight: '900',
  },
  stateBox: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  stateTitle: {
    fontSize: 16,
    color: THEME.colors.text,
    fontWeight: '900',
    textAlign: 'center',
  },
  stateActionBtn: {
    flex: 0,
    paddingHorizontal: 18,
  },
});
