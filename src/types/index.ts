export type RoomStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export type RoomType =
  | 'lab'
  | 'seminar'
  | 'library_quiet'
  | 'smart_classroom'
  | 'meeting'
  | 'makerspace'
  | 'studio';

export interface TimeSlot {
  id: string;
  startTime: string; // e.g. "07:30"
  endTime: string;   // e.g. "09:30"
  label: string;     // e.g. "Ca 1 (07:30 - 09:30)"
  status: 'available' | 'occupied' | 'my_booking';
  bookedBy?: string;
  purpose?: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  buildingCode: string;
  capacity: number;
  type: RoomType;
  status: RoomStatus;
  image: string;
  floor: number;
  description: string;
  amenities: string[];
  slots: Record<string, TimeSlot[]>; // date string YYYY-MM-DD -> TimeSlot[]
}

export interface Booking {
  id: string;
  bookingCode: string;
  roomId: string;
  roomName: string;
  building: string;
  date: string;
  slotId: string;
  slotLabel: string;
  startTime: string;
  endTime: string;
  studentName: string;
  studentId: string;
  department: string;
  purpose: string;
  status: 'confirmed' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

export type AuthProvider = 'google' | 'email' | 'demo';

export interface UserProfile {
  studentId: string;
  fullName: string;
  email: string;
  faculty: string;
  major: string;
  cohort: string;
  avatar: string;
  totalHoursBooked: number;
  completedBookingsCount: number;
}

export interface AuthSession {
  user: UserProfile;
  provider: AuthProvider;
  signedInAt: string;
}
