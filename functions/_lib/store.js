import { PREFIX, USER_PREFIX, SEED_FLAG, vnDate, STANDARD_SLOTS, findRoom } from './catalog.js';

export async function listBookings(kv) {
  if (!kv) return [];
  const listed = await kv.list({ prefix: PREFIX, limit: 1000 });
  const records = [];
  for (const key of listed.keys) {
    const raw = await kv.get(key.name);
    if (!raw) continue;
    try {
      records.push(JSON.parse(raw));
    } catch {
      /* skip */
    }
  }
  records.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return records;
}

export async function putBooking(kv, booking) {
  await kv.put(`${PREFIX}${booking.id}`, JSON.stringify(booking));
}

export async function putUser(kv, user) {
  await kv.put(`${USER_PREFIX}${user.email}`, JSON.stringify({ ...user, storedAt: new Date().toISOString() }));
}

export async function seedIfEmpty(kv) {
  if (!kv) return { seeded: false };
  const flag = await kv.get(SEED_FLAG);
  if (flag) return { seeded: false };
  const today = vnDate(0);
  const room1 = findRoom('room-1');
  const room3 = findRoom('room-3');
  const slot2 = STANDARD_SLOTS[1];
  const slot1 = STANDARD_SLOTS[0];
  const seeds = [
    {
      id: 'booking-init-1',
      bookingCode: 'VKU-BK-8901',
      roomId: 'room-1',
      roomName: room1.name,
      building: room1.building,
      date: today,
      slotId: slot2.id,
      slotLabel: slot2.label,
      startTime: slot2.startTime,
      endTime: slot2.endTime,
      studentName: 'Nguyễn Văn Minh',
      studentId: '22IT189',
      department: 'Kỹ thuật Phần mềm (Software Engineering)',
      purpose: 'Thảo luận đề tài Nghiên cứu khoa học cấp Trường',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      database: 'cloudflare-kv',
    },
    {
      id: 'booking-init-huy',
      bookingCode: 'VKU-BK-5520',
      roomId: 'room-3',
      roomName: room3.name,
      building: room3.building,
      date: today,
      slotId: slot1.id,
      slotLabel: slot1.label,
      startTime: slot1.startTime,
      endTime: slot1.endTime,
      studentName: 'Lê Quốc Huy',
      studentId: '22CE201',
      department: 'Kỹ thuật Máy tính (Computer Engineering)',
      purpose: 'Ôn thi kết thúc học phần Mạng máy tính',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      database: 'cloudflare-kv',
    },
  ];
  for (const booking of seeds) {
    await putBooking(kv, booking);
  }
  await kv.put(SEED_FLAG, new Date().toISOString());
  return { seeded: true, count: seeds.length };
}
