import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../../types';
import { THEME } from '../../constants/theme';
import { confirmAction, notify } from '../../lib/confirm';
import { useBookingStore } from '../../store/useBookingStore';
import { evaluateCancel } from '../../lib/booking-rules';

interface BookingCardProps {
  booking: Booking;
}

export function BookingCard({ booking }: BookingCardProps) {
  const { openQRModal, cancelBooking } = useBookingStore();

  const isConfirmed = booking.status === 'confirmed';
  const isOngoing = booking.status === 'ongoing';
  const isCancelled = booking.status === 'cancelled';

  const isCompleted = booking.status === 'completed';

  const handleCancel = () => {
    const rule = evaluateCancel(booking);
    if (!rule.ok) {
      notify('Không thể hủy lịch', rule.message);
      return;
    }
    confirmAction(
      'Hủy đặt phòng?',
      `${booking.roomName} • ${booking.slotLabel}\nKhung giờ sẽ được giải phóng cho sinh viên khác.`,
      'Hủy phòng',
      () => {
        void cancelBooking(booking.id).then((result) => {
          if (!result.success) {
            notify('Không thể hủy lịch', result.message);
          }
        });
      }
    );
  };

  return (
    <View style={[styles.card, isCancelled && styles.cardCancelled]}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.codeBadge}>
          <Ionicons name="ticket-outline" size={14} color={THEME.colors.primary} />
          <Text style={styles.codeText}>{booking.bookingCode}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isConfirmed && styles.statusConfirmed,
            isOngoing && styles.statusOngoing,
            isCancelled && styles.statusCancelled,
            isCompleted && styles.statusCancelled,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isConfirmed && styles.statusTextConfirmed,
              isOngoing && styles.statusTextOngoing,
              isCancelled && styles.statusTextCancelled,
            ]}
          >
            {isConfirmed
              ? 'Đã xác nhận'
              : isOngoing
              ? 'Đang diễn ra'
              : isCompleted
              ? 'Đã hoàn tất'
              : 'Đã hủy'}
          </Text>
        </View>
      </View>

      {/* Main Info */}
      <View style={styles.content}>
        <Text style={styles.roomName}>{booking.roomName}</Text>
        <View style={styles.buildingRow}>
          <Ionicons name="location-sharp" size={13} color={THEME.colors.primaryLight} />
          <Text style={styles.building}>{booking.building}</Text>
        </View>

        <View style={styles.timeInfoBox}>
          <View style={styles.infoCol}>
            <Text style={styles.infoColLabel}>Ngày học</Text>
            <View style={styles.infoColValRow}>
              <Ionicons name="calendar-outline" size={14} color={THEME.colors.primary} />
              <Text style={styles.infoColVal}>{booking.date}</Text>
            </View>
          </View>

          <View style={styles.dividerVertical} />

          <View style={styles.infoCol}>
            <Text style={styles.infoColLabel}>Khung giờ</Text>
            <View style={styles.infoColValRow}>
              <Ionicons name="time-outline" size={14} color={THEME.colors.primary} />
              <Text style={styles.infoColVal}>{booking.slotLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.purposeRow}>
          <Text style={styles.purposeLabel}>Mục đích:</Text>
          <Text style={styles.purposeVal} numberOfLines={1}>
            {booking.purpose}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      {!isCancelled && !isCompleted && (
        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}
            onPress={handleCancel}
          >
            <Ionicons name="trash-outline" size={14} color={THEME.colors.occupied} />
            <Text style={styles.cancelBtnText}>Hủy phòng</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.qrBtn, pressed && { opacity: 0.85 }]}
            onPress={() => openQRModal(booking)}
          >
            <Ionicons name="qr-code-outline" size={16} color="#FFFFFF" />
            <Text style={styles.qrBtnText}>Mã QR Vào phòng</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    ...THEME.shadows.sm,
    marginBottom: 12,
  },
  cardCancelled: {
    opacity: 0.6,
    backgroundColor: THEME.colors.surfaceAlt,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusConfirmed: {
    backgroundColor: THEME.colors.availableBg,
  },
  statusOngoing: {
    backgroundColor: '#EFF6FF',
  },
  statusCancelled: {
    backgroundColor: THEME.colors.occupiedBg,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextConfirmed: {
    color: THEME.colors.available,
  },
  statusTextOngoing: {
    color: THEME.colors.primaryLight,
  },
  statusTextCancelled: {
    color: THEME.colors.occupied,
  },
  content: {
    marginTop: 2,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  building: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    flex: 1,
  },
  buildingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timeInfoBox: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surfaceAlt,
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  infoCol: {
    flex: 1,
  },
  infoColLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginBottom: 3,
  },
  infoColValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  infoColVal: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.text,
  },
  dividerVertical: {
    width: 1,
    height: 30,
    backgroundColor: THEME.colors.border,
    marginHorizontal: 10,
  },
  purposeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  purposeLabel: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  purposeVal: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    flex: 1,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  cancelBtnText: {
    fontSize: 12,
    color: THEME.colors.occupied,
    fontWeight: '600',
  },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  qrBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
