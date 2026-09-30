import { Platform } from 'react-native';
import { Booking } from '../types';

const REMINDER_MINUTES = 15;

function reminderId(bookingId: string): string {
  return `checkin-${bookingId}`;
}

function reminderDate(booking: Booking): Date | null {
  const [year, month, day] = booking.date.split('-').map(Number);
  const [hours, minutes] = booking.startTime.split(':').map(Number);
  if (!year || !month || !day || Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const start = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const fireAt = new Date(start.getTime() - REMINDER_MINUTES * 60 * 1000);
  if (fireAt.getTime() <= Date.now()) return null;
  return fireAt;
}

export async function scheduleCheckInReminder(booking: Booking): Promise<void> {
  if (Platform.OS === 'web') return;
  const fireAt = reminderDate(booking);
  if (!fireAt) return;

  const Notifications = await import('expo-notifications');
  const current = await Notifications.getPermissionsAsync();
  let granted = current.granted;
  if (!granted) {
    const requested = await Notifications.requestPermissionsAsync();
    granted = requested.granted;
  }
  if (!granted) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('checkin', {
      name: 'Nhắc check-in',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.scheduleNotificationAsync({
    identifier: reminderId(booking.id),
    content: {
      title: 'Sắp tới giờ vào phòng',
      body: `${booking.roomName} • ${booking.slotLabel}. Mở app để check-in.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
    },
  });
}

export async function cancelCheckInReminder(bookingId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const Notifications = await import('expo-notifications');
  await Notifications.cancelScheduledNotificationAsync(reminderId(bookingId));
}
