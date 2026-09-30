import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Room, Booking } from '../types';
import { INITIAL_ROOMS, TODAY_STR } from '../constants/mockRooms';
import { appStorage } from '../lib/storage';
import { isActiveBooking } from '../lib/booking-rules';
import { isSlotFinished, slotDurationHours } from '../lib/time';
import { createCloudBooking, fetchCloudBookings, updateCloudBooking } from '../api/cloudflare';
import { setLiveBookingsCache } from '../api/query-client';
import { CapacityFilter, EquipmentFilter } from '../lib/room-filters';
import { cancelCheckInReminder, scheduleCheckInReminder } from '../lib/reminders';

function mergePinnedBooking(bookings: Booking[], pinned: Booking | null): Booking[] {
  if (!pinned || !isActiveBooking(pinned)) return sortBookings(bookings);
  if (bookings.some((booking) => booking.id === pinned.id)) return sortBookings(bookings);
  return sortBookings([pinned, ...bookings]);
}

function sortBookings(bookings: Booking[]): Booking[] {
  return [...bookings].sort((left, right) => {
    const rightTime = Date.parse(right.createdAt) || 0;
    const leftTime = Date.parse(left.createdAt) || 0;
    return rightTime - leftTime;
  });
}

function upsertBooking(bookings: Booking[], incoming: Booking): Booking[] {
  return sortBookings([incoming, ...bookings.filter((booking) => booking.id !== incoming.id)]);
}

function publishBookings(bookings: Booking[]): Booking[] {
  setLiveBookingsCache(bookings);
  return bookings;
}

interface BookingState {
  rooms: Room[];
  bookings: Booking[];
  cloudReady: boolean;
  cloudError: string | null;
  searchQuery: string;
  selectedCategory: string;
  selectedBuilding: string;
  selectedStatus: 'all' | 'available' | 'occupied';
  selectedCapacity: CapacityFilter;
  selectedEquipment: EquipmentFilter;
  selectedDate: string;
  selectedRoomForBooking: Room | null;
  selectedBookingForQR: Booking | null;
  lastConfirmedBooking: Booking | null;

  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedBuilding: (building: string) => void;
  setSelectedStatus: (status: 'all' | 'available' | 'occupied') => void;
  setSelectedCapacity: (capacity: CapacityFilter) => void;
  setSelectedEquipment: (equipment: EquipmentFilter) => void;
  setSelectedDate: (date: string) => void;
  replaceRooms: (rooms: Room[]) => void;
  replaceBookings: (bookings: Booking[]) => void;

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
      selectedCapacity: 'all',
      selectedEquipment: 'all',
      selectedDate: TODAY_STR,
      selectedRoomForBooking: null,
      selectedBookingForQR: null,
      lastConfirmedBooking: null,

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSelectedBuilding: (selectedBuilding) => set({ selectedBuilding }),
      setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
      setSelectedCapacity: (selectedCapacity) => set({ selectedCapacity }),
      setSelectedEquipment: (selectedEquipment) => set({ selectedEquipment }),
      setSelectedDate: (selectedDate) => set({ selectedDate }),
      replaceRooms: (rooms) => set({ rooms }),
      replaceBookings: (bookings) =>
        set((state) => {
          const mergedBookings = publishBookings(mergePinnedBooking(bookings, state.lastConfirmedBooking));
          return {
            bookings: mergedBookings,
            cloudReady: true,
            cloudError: null,
          };
        }),

      openBookingModal: (room) => set({ selectedRoomForBooking: room }),
      closeBookingModal: () => set({ selectedRoomForBooking: null }),
      openQRModal: (booking) => set({ selectedBookingForQR: booking }),
      closeQRModal: () => set({ selectedBookingForQR: null }),

      hydrateFromCloud: async () => {
        try {
          const records = await fetchCloudBookings();
          const mergedRecords = publishBookings(mergePinnedBooking(records, get().lastConfirmedBooking));
          set({ bookings: mergedRecords, cloudReady: true, cloudError: null });
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
          const mergedRecords = publishBookings(upsertBooking(get().bookings, result.booking));
          set({
            bookings: mergedRecords,
            selectedRoomForBooking: null,
            lastConfirmedBooking: result.booking,
            cloudReady: true,
            cloudError: null,
          });
          void scheduleCheckInReminder(result.booking).catch(() => undefined);
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
          const result = await updateCloudBooking(bookingId, 'cancel');
          const mergedRecords = publishBookings(upsertBooking(get().bookings, result.booking));
          set({
            bookings: mergedRecords,
            selectedBookingForQR: null,
            lastConfirmedBooking: result.booking,
            cloudReady: true,
            cloudError: null,
          });
          void cancelCheckInReminder(bookingId).catch(() => undefined);
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
          const mergedRecords = publishBookings(upsertBooking(get().bookings, result.booking));
          set({
            bookings: mergedRecords,
            selectedBookingForQR: result.booking,
            lastConfirmedBooking: result.booking,
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
      partialize: (state) => ({
        rooms: state.rooms,
        bookings: state.bookings,
        cloudReady: state.cloudReady,
        cloudError: state.cloudError,
        searchQuery: state.searchQuery,
        selectedCategory: state.selectedCategory,
        selectedBuilding: state.selectedBuilding,
        selectedStatus: state.selectedStatus,
        selectedCapacity: state.selectedCapacity,
        selectedEquipment: state.selectedEquipment,
      }),
    }
  )
);

export function hoursFromBookings(bookings: Booking[], studentId: string): number {
  return bookings
    .filter((booking) => booking.studentId === studentId && booking.status !== 'cancelled')
    .reduce((sum, booking) => sum + slotDurationHours(booking.startTime, booking.endTime), 0);
}
