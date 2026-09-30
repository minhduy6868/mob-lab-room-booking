import { QueryClient } from '@tanstack/react-query';
import { INITIAL_ROOMS } from '../constants/mockRooms';
import { Booking, Room } from '../types';
import { fetchCloudBookings, pingCloudflare } from './cloudflare';

export const LIVE_BOOKINGS_QUERY_KEY = ['bookings-live'] as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
  },
});

export async function fetchRoomCatalog(): Promise<Room[]> {
  await pingCloudflare().catch(() => null);
  return INITIAL_ROOMS;
}

export async function fetchLiveBookings() {
  return fetchCloudBookings();
}

export function setLiveBookingsCache(bookings: Booking[]) {
  queryClient.setQueryData(LIVE_BOOKINGS_QUERY_KEY, bookings);
}
