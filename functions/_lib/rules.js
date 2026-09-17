const MAX_SLOTS_PER_DAY = 2;
const CANCEL_CUTOFF_MINUTES = 30;
const CHECKIN_EARLY_MINUTES = 10;
const STUDENT_ID_PATTERN = /^\d{2}[A-Za-z]{2}\d{3}$/;
const ACTIVE = new Set(['confirmed', 'ongoing']);

function timeToMinutes(hhmm) {
  const [hours, minutes] = String(hhmm).split(':').map(Number);
  return hours * 60 + minutes;
}

function timesOverlap(aStart, aEnd, bStart, bEnd) {
  return timeToMinutes(aStart) < timeToMinutes(bEnd) && timeToMinutes(bStart) < timeToMinutes(aEnd);
}

function combine(date, hhmm) {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = hhmm.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
}

function minutesUntil(date, hhmm, now) {
  return Math.round((combine(date, hhmm).getTime() - now.getTime()) / 60000);
}

export function isActive(booking) {
  return ACTIVE.has(booking.status);
}

export function evaluateBooking({ room, date, slot, studentName, studentId, purpose, bookings, held, now = new Date() }) {
  if (!String(studentName || '').trim() || !String(studentId || '').trim() || !String(purpose || '').trim()) {
    return { ok: false, message: 'Vui lòng điền đầy đủ họ tên, mã sinh viên và mục đích mượn phòng.' };
  }
  if (!STUDENT_ID_PATTERN.test(String(studentId).trim())) {
    return { ok: false, message: 'Mã sinh viên không hợp lệ. Định dạng VKU: 22IT189.' };
  }
  if (String(purpose).trim().length < 8) {
    return { ok: false, message: 'Mục đích sử dụng cần tối thiểu 8 ký tự.' };
  }
  if (!room) {
    return { ok: false, message: 'Phòng học không tồn tại trên hệ thống VKU.' };
  }
  if (room.status === 'maintenance') {
    return { ok: false, message: `${room.name} đang bảo trì. Không thể đặt phòng.` };
  }
  if (!slot) {
    return { ok: false, message: 'Khung giờ không hợp lệ.' };
  }
  if (minutesUntil(date, slot.startTime, now) < 0) {
    return { ok: false, message: `Ca ${slot.label} đã bắt đầu hoặc đã qua.` };
  }

  const occupant = bookings.find(
    (booking) => isActive(booking) && booking.roomId === room.id && booking.date === date && booking.slotId === slot.id,
  );
  if (occupant && occupant.studentId === studentId.trim()) {
    return { ok: false, message: `Bạn đã giữ chỗ ${room.name} cho ${slot.label}.` };
  }
  if (occupant) {
    return {
      ok: false,
      message: `Xung đột lịch phòng! ${slot.label} đã được ${occupant.studentName} (${occupant.studentId}) đăng ký trước.`,
    };
  }
  if (held) {
    return { ok: false, message: 'Khung giờ này đã được sinh viên khác đăng ký trên lịch phòng.' };
  }

  const overlap = bookings.find(
    (booking) =>
      isActive(booking) &&
      booking.studentId === studentId.trim() &&
      booking.date === date &&
      timesOverlap(slot.startTime, slot.endTime, booking.startTime, booking.endTime),
  );
  if (overlap) {
    return {
      ok: false,
      message: `Xung đột lịch cá nhân! Bạn đã đặt ${overlap.roomName} trùng giờ (${overlap.slotLabel}).`,
    };
  }

  const dayCount = bookings.filter(
    (booking) => isActive(booking) && booking.studentId === studentId.trim() && booking.date === date,
  ).length;
  if (dayCount >= MAX_SLOTS_PER_DAY) {
    return { ok: false, message: `Quy chế VKU: tối đa ${MAX_SLOTS_PER_DAY} ca/ngày. Bạn đã đủ ${dayCount} ca.` };
  }

  return { ok: true };
}

export function evaluateCancel(booking, now = new Date()) {
  if (!booking) return { ok: false, message: 'Không tìm thấy lịch đặt phòng.' };
  if (booking.status === 'cancelled') return { ok: false, message: 'Lịch này đã được hủy trước đó.' };
  if (booking.status === 'completed') return { ok: false, message: 'Ca học đã hoàn tất, không thể hủy.' };
  if (booking.status === 'ongoing') return { ok: false, message: 'Bạn đang check-in, không thể hủy.' };
  const minutesLeft = minutesUntil(booking.date, booking.startTime, now);
  if (minutesLeft < CANCEL_CUTOFF_MINUTES) {
    return {
      ok: false,
      message: `Phải hủy trước giờ học ít nhất ${CANCEL_CUTOFF_MINUTES} phút. Còn ${Math.max(0, minutesLeft)} phút.`,
    };
  }
  return { ok: true };
}

export function evaluateCheckIn(booking, now = new Date()) {
  if (!booking) return { ok: false, message: 'Không tìm thấy lịch đặt phòng.' };
  if (booking.status === 'cancelled') return { ok: false, message: 'Lịch đã hủy, không thể check-in.' };
  if (booking.status === 'ongoing') return { ok: false, message: 'Bạn đã check-in ca này rồi.' };
  if (booking.status === 'completed' || minutesUntil(booking.date, booking.endTime, now) < 0) {
    return { ok: false, message: 'Ca học đã kết thúc.' };
  }
  const minutesLeft = minutesUntil(booking.date, booking.startTime, now);
  if (minutesLeft > CHECKIN_EARLY_MINUTES) {
    return {
      ok: false,
      message: `Chỉ check-in sớm tối đa ${CHECKIN_EARLY_MINUTES} phút. Còn ${minutesLeft} phút nữa.`,
    };
  }
  return { ok: true };
}
