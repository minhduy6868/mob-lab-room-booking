import { Booking, Room, TimeSlot } from '../types';
import { isSlotFinished, isSlotInPast, minutesUntil, timesOverlap } from './time';

export const MAX_SLOTS_PER_DAY = 2;
export const CANCEL_CUTOFF_MINUTES = 30;
export const CHECKIN_EARLY_MINUTES = 10;
export const STUDENT_ID_PATTERN = /^\d{2}[A-Za-z]{2}\d{3}$/;

export const ACTIVE_BOOKING_STATUSES: Booking['status'][] = ['confirmed', 'ongoing'];

export type ConflictCode =
  | 'MISSING_FIELDS'
  | 'INVALID_STUDENT_ID'
  | 'INVALID_PURPOSE'
  | 'ROOM_NOT_FOUND'
  | 'ROOM_MAINTENANCE'
  | 'SLOT_NOT_FOUND'
  | 'PAST_SLOT'
  | 'SLOT_OCCUPIED'
  | 'ALREADY_BOOKED_THIS_SLOT'
  | 'CROSS_ROOM_OVERLAP'
  | 'DAILY_LIMIT';

export type RuleResult = { ok: true } | { ok: false; code: ConflictCode; message: string };

export function isActiveBooking(booking: Booking): boolean {
  return ACTIVE_BOOKING_STATUSES.includes(booking.status);
}

export function validateStudentId(studentId: string): boolean {
  return STUDENT_ID_PATTERN.test(studentId.trim());
}

export function getActiveBookingsForDay(
  bookings: Booking[],
  studentId: string,
  date: string
): Booking[] {
  return bookings.filter(
    (booking) =>
      isActiveBooking(booking) && booking.studentId === studentId && booking.date === date
  );
}

export function findCrossRoomOverlap(
  bookings: Booking[],
  studentId: string,
  date: string,
  startTime: string,
  endTime: string,
  ignoreBookingId?: string
): Booking | undefined {
  return bookings.find(
    (booking) =>
      isActiveBooking(booking) &&
      booking.studentId === studentId &&
      booking.date === date &&
      booking.id !== ignoreBookingId &&
      timesOverlap(startTime, endTime, booking.startTime, booking.endTime)
  );
}

export function findSlotOccupant(
  bookings: Booking[],
  roomId: string,
  date: string,
  slotId: string
): Booking | undefined {
  return bookings.find(
    (booking) =>
      isActiveBooking(booking) &&
      booking.roomId === roomId &&
      booking.date === date &&
      booking.slotId === slotId
  );
}

export function evaluateBooking(params: {
  room?: Room;
  date: string;
  slot?: TimeSlot;
  studentName: string;
  studentId: string;
  purpose: string;
  bookings: Booking[];
  now?: Date;
}): RuleResult {
  const { room, date, slot, studentName, studentId, purpose, bookings, now = new Date() } = params;

  if (!studentName.trim() || !studentId.trim() || !purpose.trim()) {
    return {
      ok: false,
      code: 'MISSING_FIELDS',
      message: 'Vui lòng điền đầy đủ họ tên, mã sinh viên và mục đích mượn phòng.',
    };
  }

  if (!validateStudentId(studentId)) {
    return {
      ok: false,
      code: 'INVALID_STUDENT_ID',
      message: 'Mã sinh viên không hợp lệ. Định dạng VKU: 22IT189 (2 số + 2 chữ + 3 số).',
    };
  }

  if (purpose.trim().length < 8) {
    return {
      ok: false,
      code: 'INVALID_PURPOSE',
      message: 'Mục đích sử dụng cần tối thiểu 8 ký tự để bộ phận quản lý phòng xét duyệt.',
    };
  }

  if (!room) {
    return { ok: false, code: 'ROOM_NOT_FOUND', message: 'Phòng học không tồn tại trên hệ thống VKU.' };
  }

  if (room.status === 'maintenance') {
    return {
      ok: false,
      code: 'ROOM_MAINTENANCE',
      message: `${room.name} đang bảo trì. Không thể đặt phòng cho đến khi hoàn tất.`,
    };
  }

  if (!slot) {
    return { ok: false, code: 'SLOT_NOT_FOUND', message: 'Khung giờ không hợp lệ. Vui lòng chọn lại ca học.' };
  }

  if (isSlotInPast(date, slot.startTime, now)) {
    return {
      ok: false,
      code: 'PAST_SLOT',
      message: `Ca ${slot.label} đã bắt đầu hoặc đã qua. Hệ thống không cho đặt phòng trễ.`,
    };
  }

  const occupant = findSlotOccupant(bookings, room.id, date, slot.id);
  if (occupant && occupant.studentId === studentId.trim()) {
    return {
      ok: false,
      code: 'ALREADY_BOOKED_THIS_SLOT',
      message: `Bạn đã giữ chỗ ${room.name} cho ${slot.label}. Không thể đặt trùng cùng một ca.`,
    };
  }

  if (occupant) {
    return {
      ok: false,
      code: 'SLOT_OCCUPIED',
      message: `Xung đột lịch phòng! ${slot.label} đã được ${occupant.studentName} (${occupant.studentId}) đăng ký trước.`,
    };
  }

  if (slot.status === 'occupied') {
    return {
      ok: false,
      code: 'SLOT_OCCUPIED',
      message: `Khung giờ này đã được ${slot.bookedBy || 'sinh viên khác'} đăng ký trước. Vui lòng chọn ca khác.`,
    };
  }

  const overlap = findCrossRoomOverlap(
    bookings,
    studentId.trim(),
    date,
    slot.startTime,
    slot.endTime
  );
  if (overlap) {
    return {
      ok: false,
      code: 'CROSS_ROOM_OVERLAP',
      message: `Xung đột lịch cá nhân! Bạn đã đặt ${overlap.roomName} trùng giờ (${overlap.slotLabel}). Một sinh viên không thể có mặt ở hai phòng cùng lúc.`,
    };
  }

  const dayCount = getActiveBookingsForDay(bookings, studentId.trim(), date).length;
  if (dayCount >= MAX_SLOTS_PER_DAY) {
    return {
      ok: false,
      code: 'DAILY_LIMIT',
      message: `Quy chế VKU: mỗi sinh viên tối đa ${MAX_SLOTS_PER_DAY} ca/ngày. Bạn đã đủ ${dayCount} ca vào ${date}. Hãy hủy một lịch cũ nếu muốn đổi phòng.`,
    };
  }

  return { ok: true };
}

export function evaluateCancel(booking: Booking | undefined, now = new Date()): RuleResult {
  if (!booking) {
    return { ok: false, code: 'SLOT_NOT_FOUND', message: 'Không tìm thấy lịch đặt phòng.' };
  }
  if (booking.status === 'cancelled') {
    return { ok: false, code: 'ALREADY_BOOKED_THIS_SLOT', message: 'Lịch này đã được hủy trước đó.' };
  }
  if (booking.status === 'completed') {
    return { ok: false, code: 'PAST_SLOT', message: 'Ca học đã hoàn tất, không thể hủy.' };
  }
  if (booking.status === 'ongoing') {
    return {
      ok: false,
      code: 'PAST_SLOT',
      message: 'Bạn đang check-in sử dụng phòng. Liên hệ quản lý tòa nhà nếu cần kết thúc sớm.',
    };
  }

  const minutesLeft = minutesUntil(booking.date, booking.startTime, now);
  if (minutesLeft < CANCEL_CUTOFF_MINUTES) {
    return {
      ok: false,
      code: 'PAST_SLOT',
      message: `Quy chế VKU: phải hủy trước giờ học ít nhất ${CANCEL_CUTOFF_MINUTES} phút. Còn ${Math.max(0, minutesLeft)} phút nữa là tới ca.`,
    };
  }

  return { ok: true };
}

export function evaluateCheckIn(booking: Booking | undefined, now = new Date()): RuleResult {
  if (!booking) {
    return { ok: false, code: 'SLOT_NOT_FOUND', message: 'Không tìm thấy lịch đặt phòng.' };
  }
  if (booking.status === 'cancelled') {
    return { ok: false, code: 'SLOT_NOT_FOUND', message: 'Lịch đã hủy, không thể check-in.' };
  }
  if (booking.status === 'ongoing') {
    return { ok: false, code: 'ALREADY_BOOKED_THIS_SLOT', message: 'Bạn đã check-in ca này rồi.' };
  }
  if (booking.status === 'completed' || isSlotFinished(booking.date, booking.endTime, now)) {
    return { ok: false, code: 'PAST_SLOT', message: 'Ca học đã kết thúc. Check-in không còn hiệu lực.' };
  }

  const minutesLeft = minutesUntil(booking.date, booking.startTime, now);
  if (minutesLeft > CHECKIN_EARLY_MINUTES) {
    return {
      ok: false,
      code: 'PAST_SLOT',
      message: `Chỉ được check-in sớm tối đa ${CHECKIN_EARLY_MINUTES} phút. Còn ${minutesLeft} phút nữa mới tới giờ vào phòng.`,
    };
  }

  return { ok: true };
}

export function decorateSlots(
  room: Room,
  date: string,
  bookings: Booking[],
  currentStudentId?: string
): TimeSlot[] {
  const slots = room.slots[date] || [];
  return slots.map((slot) => {
    const occupant = findSlotOccupant(bookings, room.id, date, slot.id);
    if (occupant && occupant.studentId === currentStudentId) {
      return {
        ...slot,
        status: 'my_booking' as const,
        bookedBy: `${occupant.studentName} (${occupant.studentId})`,
        purpose: occupant.purpose,
      };
    }
    if (occupant) {
      return {
        ...slot,
        status: 'occupied' as const,
        bookedBy: `${occupant.studentName} (${occupant.studentId})`,
        purpose: occupant.purpose,
      };
    }
    if (slot.status === 'occupied') {
      return slot;
    }
    return { ...slot, status: 'available' as const, bookedBy: undefined, purpose: undefined };
  });
}

export function slotConflictHint(
  slot: TimeSlot,
  bookings: Booking[],
  studentId: string,
  date: string
): string | null {
  if (isSlotInPast(date, slot.startTime)) {
    return 'Ca đã qua';
  }
  if (slot.status === 'my_booking') {
    return 'Bạn đã giữ chỗ ca này';
  }
  if (slot.status === 'occupied') {
    return slot.bookedBy ? `Đã đặt: ${slot.bookedBy}` : 'Ca đã kín';
  }
  const overlap = findCrossRoomOverlap(bookings, studentId, date, slot.startTime, slot.endTime);
  if (overlap) {
    return `Trùng ${overlap.roomName}`;
  }
  return null;
}
