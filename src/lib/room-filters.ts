import { Room } from '../types';

export type CapacityFilter = 'all' | '2-20' | 'over-20';
export type EquipmentFilter = 'all' | 'projector' | 'whiteboard' | 'pc' | 'ac';

export function matchesCapacity(room: Room, filter: CapacityFilter): boolean {
  if (filter === '2-20') return room.capacity >= 2 && room.capacity <= 20;
  if (filter === 'over-20') return room.capacity > 20;
  return true;
}

export function matchesEquipment(room: Room, filter: EquipmentFilter): boolean {
  if (filter === 'all') return true;
  const text = room.amenities.join(' ').toLowerCase();
  if (filter === 'projector') return text.includes('máy chiếu') || text.includes('projector');
  if (filter === 'whiteboard') return text.includes('bảng');
  if (filter === 'pc') return /máy trạm|rtx|wacom|pc|máy tính/.test(text);
  if (filter === 'ac') return text.includes('điều hòa');
  return true;
}
