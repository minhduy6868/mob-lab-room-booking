import { QueryClient } from '@tanstack/react-query';
import { INITIAL_ROOMS } from '../constants/mockRooms';
import { Room } from '../types';
import { fetchCloudBookings, pingCloudflare } from './cloudflare';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 15_000,
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
