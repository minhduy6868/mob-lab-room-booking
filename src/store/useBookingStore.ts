import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Room, Booking } from '../types';
import { INITIAL_ROOMS, TODAY_STR } from '../constants/mockRooms';
import { appStorage } from '../lib/storage';
import { isActiveBooking } from '../lib/booking-rules';
import { isSlotFinished, slotDurationHours } from '../lib/time';
import { createCloudBooking, fetchCloudBookings, updateCloudBooking } from '../api/cloudflare';

interface BookingState {
  rooms: Room[];
  bookings: Booking[];
  cloudReady: boolean;
  cloudError: string | null;
  searchQuery: string;
  selectedCategory: string;
  selectedBuilding: string;
  selectedStatus: 'all' | 'available' | 'occupied';
  selectedDate: string;
  selectedRoomForBooking: Room | null;
  selectedBookingForQR: Booking | null;

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedBuilding: (building: string) => void;
  setSelectedStatus: (status: 'all' | 'available' | 'occupied') => void;
  setSelectedDate: (date: string) => void;
  replaceRooms: (rooms: Room[]) => void;

  openBookingModal: (room: Room) => void;
  closeBookingModal: () => void;
  openQRModal: (booking: Booking) => void;
  closeQRModal: () => void;

  hydrateFromCloud: () => Promise<void>;

  bookRoomSlot: (params: {
    roomId: string;
    date: string;
    slotId: string;
    studentName: string;
    studentId: string;
    department: string;
    purpose: string;
  }) => Promise<{ success: boolean; message: string; booking?: Booking }>;

  cancelBooking: (bookingId: string) => Promise<{ success: boolean; message: string }>;
  checkInBooking: (bookingId: string) => Promise<{ success: boolean; message: string }>;
  syncBookingLifecycles: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      rooms: INITIAL_ROOMS,
      bookings: [],
      cloudReady: false,
      cloudError: null,
      searchQuery: '',
      selectedCategory: 'all',
      selectedBuilding: 'all',
      selectedStatus: 'all',
      selectedDate: TODAY_STR,
      selectedRoomForBooking: null,
      selectedBookingForQR: null,

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSelectedBuilding: (selectedBuilding) => set({ selectedBuilding }),
      setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
      setSelectedDate: (selectedDate) => set({ selectedDate }),
      replaceRooms: (rooms) => set({ rooms }),

      openBookingModal: (room) => set({ selectedRoomForBooking: room }),
      closeBookingModal: () => set({ selectedRoomForBooking: null }),
      openQRModal: (booking) => set({ selectedBookingForQR: booking }),
      closeQRModal: () => set({ selectedBookingForQR: null }),

      hydrateFromCloud: async () => {
        try {
          const records = await fetchCloudBookings();
          set({ bookings: records, cloudReady: true, cloudError: null });
        } catch (error) {
          set({
            cloudReady: false,
            cloudError: error instanceof Error ? error.message : 'Không kết nối Cloudflare KV',
          });
        }
      },

      bookRoomSlot: async (params) => {
        try {
          const result = await createCloudBooking(params);
          const records = await fetchCloudBookings();
          set({
            bookings: records,
            selectedRoomForBooking: null,
            cloudReady: true,
            cloudError: null,
          });
          return {
            success: true,
            message: `Đã lưu Cloudflare KV. Mã đặt chỗ: ${result.booking.bookingCode}`,
            booking: result.booking,
          };
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Không ghi được lên Cloudflare KV.',
          };
        }
      },

      cancelBooking: async (bookingId: string) => {
        try {
          await updateCloudBooking(bookingId, 'cancel');
          const records = await fetchCloudBookings();
          set({ bookings: records, selectedBookingForQR: null, cloudReady: true, cloudError: null });
          return { success: true, message: 'Đã hủy trên Cloudflare KV. Khung giờ được giải phóng.' };
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Không hủy được trên Cloudflare KV.',
          };
        }
      },

      checkInBooking: async (bookingId: string) => {
        try {
          const result = await updateCloudBooking(bookingId, 'checkin');
          const records = await fetchCloudBookings();
          set({
            bookings: records,
            selectedBookingForQR: result.booking,
            cloudReady: true,
            cloudError: null,
          });
          return { success: true, message: 'Check-in đã ghi lên Cloudflare KV.' };
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Không check-in được trên Cloudflare KV.',
          };
        }
      },

      syncBookingLifecycles: () => {
        const { bookings } = get();
        let changed = false;
        const updated = bookings.map((booking) => {
          if (!isActiveBooking(booking)) return booking;
          if (isSlotFinished(booking.date, booking.endTime)) {
            changed = true;
            return { ...booking, status: 'completed' as const };
          }
          return booking;
        });
        if (changed) {
          set({ bookings: updated });
        }
      },
    }),
    {
      name: 'vku-booking-data',
      storage: createJSONStorage(() => appStorage),
      partialize: () => ({}),
    }
  )
);

export function hoursFromBookings(bookings: Booking[], studentId: string): number {
  return bookings
    .filter((booking) => booking.studentId === studentId && booking.status !== 'cancelled')
    .reduce((sum, booking) => sum + slotDurationHours(booking.startTime, booking.endTime), 0);
}
