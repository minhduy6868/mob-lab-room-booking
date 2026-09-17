export const PREFIX = 'booking:';
export const USER_PREFIX = 'user:';
export const SEED_FLAG = 'meta:seeded';

export const STANDARD_SLOTS = [
  { id: 'slot-1', startTime: '07:30', endTime: '09:30', label: 'Ca 1 (07:30 - 09:30)' },
  { id: 'slot-2', startTime: '09:45', endTime: '11:45', label: 'Ca 2 (09:45 - 11:45)' },
  { id: 'slot-3', startTime: '13:00', endTime: '15:00', label: 'Ca 3 (13:00 - 15:00)' },
  { id: 'slot-4', startTime: '15:15', endTime: '17:15', label: 'Ca 4 (15:15 - 17:15)' },
  { id: 'slot-5', startTime: '17:30', endTime: '19:30', label: 'Ca 5 (17:30 - 19:30)' },
  { id: 'slot-6', startTime: '19:45', endTime: '21:45', label: 'Ca 6 (19:45 - 21:45)' },
];

export const ROOMS = [
  { id: 'room-1', name: 'Lab A3-101', building: 'Khu A - Tòa A3 (Tầng 1)', status: 'available', occupied: [3] },
  { id: 'room-2', name: 'Lab A3-205 AI & Robotics', building: 'Khu A - Tòa A3 (Tầng 2)', status: 'occupied', occupied: [0, 1, 2, 4] },
  { id: 'room-3', name: 'Thư viện Zone B - Silent Area', building: 'Thư viện Trung tâm VKU (Tầng 2)', status: 'available', occupied: [2] },
  { id: 'room-4', name: 'Hội trường C1 - Seminar Hall', building: 'Khu C - Tòa C1 (Tầng 1)', status: 'available', occupied: [0, 3] },
  { id: 'room-5', name: 'VKU MakerSpace - IoT Lab', building: 'Khu Đổi mới Sáng tạo - Tòa V (Tầng 1)', status: 'available', occupied: [1, 4] },
  { id: 'room-6', name: 'Smart Classroom C2-102', building: 'Khu C - Tòa C2 (Tầng 1)', status: 'available', occupied: [2, 5] },
  { id: 'room-7', name: 'Lab A2-304 Mobile & Web Dev', building: 'Khu A - Tòa A2 (Tầng 3)', status: 'available', occupied: [0, 1] },
  { id: 'room-8', name: 'Thư viện - Thảo luận nhóm G1', building: 'Thư viện Trung tâm VKU (Tầng 1)', status: 'occupied', occupied: [0, 1, 2, 3] },
  { id: 'room-9', name: 'Thư viện - Thảo luận nhóm G2', building: 'Thư viện Trung tâm VKU (Tầng 1)', status: 'available', occupied: [3] },
  { id: 'room-10', name: 'Lab Vi mạch Bán dẫn A1-102', building: 'Khu A - Tòa A1 (Tầng 1)', status: 'maintenance', occupied: [0, 2, 4] },
  { id: 'room-11', name: 'Phòng Hội thảo Quốc tế V-201', building: 'Khu Đổi mới Sáng tạo - Tòa V (Tầng 2)', status: 'available', occupied: [] },
  { id: 'room-12', name: 'Smart Classroom C2-203', building: 'Khu C - Tòa C2 (Tầng 2)', status: 'available', occupied: [1] },
  { id: 'room-13', name: 'CyberLab A3-301 An toàn Thông tin', building: 'Khu A - Tòa A3 (Tầng 3)', status: 'available', occupied: [2, 3] },
  { id: 'room-14', name: 'Studio E-Learning & Media V-305', building: 'Khu Đổi mới Sáng tạo - Tòa V (Tầng 3)', status: 'available', occupied: [0, 4] },
  { id: 'room-15', name: 'K-Zone Tự học 01 (Ký túc xá)', building: 'Khu Ký túc xá Sinh viên (Tầng 1)', status: 'available', occupied: [] },
  { id: 'room-16', name: 'K-Zone Tự học 02 (Ký túc xá)', building: 'Khu Ký túc xá Sinh viên (Tầng 2)', status: 'available', occupied: [1, 2] },
  { id: 'room-17', name: 'Coworking Lounge Sinh viên VKU', building: 'Thư viện Trung tâm VKU (Tầng 1)', status: 'available', occupied: [0] },
  { id: 'room-18', name: 'Lab A2-401 Đồ họa & Game Dev', building: 'Khu A - Tòa A2 (Tầng 4)', status: 'occupied', occupied: [0, 1, 2, 3, 4] },
  { id: 'room-19', name: 'Phòng Hội nghị Khoa CNTT B1-201', building: 'Khu B - Tòa B1 (Tầng 2)', status: 'available', occupied: [3, 4] },
  { id: 'room-20', name: 'Smart Classroom C1-204', building: 'Khu C - Tòa C1 (Tầng 2)', status: 'available', occupied: [1] },
  { id: 'room-21', name: 'Phòng Nghiên cứu Sau đại học V-401', building: 'Khu Đổi mới Sáng tạo - Tòa V (Tầng 4)', status: 'available', occupied: [0] },
  { id: 'room-22', name: 'Thư viện Khu B - Silent Zone 2', building: 'Thư viện Trung tâm VKU (Tầng 3)', status: 'available', occupied: [] },
];

export function vnDate(offsetDays = 0) {
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  now.setUTCDate(now.getUTCDate() + offsetDays);
  return now.toISOString().slice(0, 10);
}

export function findRoom(roomId) {
  return ROOMS.find((room) => room.id === roomId);
}

export function findSlot(slotId) {
  return STANDARD_SLOTS.find((slot) => slot.id === slotId);
}

export function isHeldByCatalog(room, slotId) {
  const index = STANDARD_SLOTS.findIndex((slot) => slot.id === slotId);
  return Boolean(room && index >= 0 && room.occupied.includes(index));
}
