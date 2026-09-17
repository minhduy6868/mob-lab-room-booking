import { json, preflight } from '../_lib/cors.js';
import { findRoom, findSlot, isHeldByCatalog } from '../_lib/catalog.js';
import { evaluateBooking, evaluateCancel, evaluateCheckIn } from '../_lib/rules.js';
import { listBookings, putBooking, seedIfEmpty } from '../_lib/store.js';

export async function onRequestGet({ env }) {
  if (!env.VKU_BOOKINGS) {
    return json({ ok: false, error: 'Cloudflare KV not bound' }, 503);
  }
  await seedIfEmpty(env.VKU_BOOKINGS);
  const records = await listBookings(env.VKU_BOOKINGS);
  return json({ ok: true, database: 'cloudflare-kv', count: records.length, records });
}

export async function onRequestPost({ request, env }) {
  if (!env.VKU_BOOKINGS) {
    return json({ ok: false, error: 'Cloudflare KV not bound' }, 503);
  }
  await seedIfEmpty(env.VKU_BOOKINGS);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid json' }, 400);
  }

  const bookings = await listBookings(env.VKU_BOOKINGS);
  const room = findRoom(body.roomId);
  const slot = findSlot(body.slotId);
  const rule = evaluateBooking({
    room,
    date: body.date,
    slot,
    studentName: body.studentName,
    studentId: body.studentId,
    purpose: body.purpose,
    bookings,
    held: isHeldByCatalog(room, body.slotId),
  });

  if (!rule.ok) {
    return json({ ok: false, error: rule.message }, 409);
  }

  const booking = {
    id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    bookingCode: `VKU-BK-${Math.floor(1000 + Math.random() * 9000)}`,
    roomId: room.id,
    roomName: room.name,
    building: room.building,
    date: body.date,
    slotId: slot.id,
    slotLabel: slot.label,
    startTime: slot.startTime,
    endTime: slot.endTime,
    studentName: String(body.studentName).trim(),
    studentId: String(body.studentId).trim().toUpperCase(),
    department: String(body.department || ''),
    purpose: String(body.purpose).trim(),
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    database: 'cloudflare-kv',
  };

  await putBooking(env.VKU_BOOKINGS, booking);
  return json({ ok: true, database: 'cloudflare-kv', booking });
}

export async function onRequestPut({ request, env }) {
  if (!env.VKU_BOOKINGS) {
    return json({ ok: false, error: 'Cloudflare KV not bound' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid json' }, 400);
  }

  const bookings = await listBookings(env.VKU_BOOKINGS);
  const booking = bookings.find((item) => item.id === body.id);
  if (!booking) {
    return json({ ok: false, error: 'Không tìm thấy lịch đặt phòng.' }, 404);
  }

  const action = body.action;
  const rule = action === 'checkin' ? evaluateCheckIn(booking) : evaluateCancel(booking);
  if (!rule.ok) {
    return json({ ok: false, error: rule.message }, 409);
  }

  booking.status = action === 'checkin' ? 'ongoing' : 'cancelled';
  booking.updatedAt = new Date().toISOString();
  booking.database = 'cloudflare-kv';
  await putBooking(env.VKU_BOOKINGS, booking);
  return json({ ok: true, database: 'cloudflare-kv', booking });
}

export function onRequestOptions() {
  return preflight();
}
