import { AuthProvider, Booking, UserProfile } from '../types';

export const CLOUDFLARE_PAGES_HOST = 'https://vku-room-booking.pages.dev';

export function getApiBase(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  return CLOUDFLARE_PAGES_HOST;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const data = (await response.json()) as T & { ok?: boolean; error?: string };
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

export async function pingCloudflare() {
  return request<{ ok: boolean; database: string; kvCount: number; canonical: string }>('/api/health');
}

export async function fetchCloudBookings(): Promise<Booking[]> {
  const data = await request<{ records: Booking[] }>('/api/bookings');
  return data.records || [];
}

export async function createCloudBooking(payload: {
  roomId: string;
  date: string;
  slotId: string;
  studentName: string;
  studentId: string;
  department: string;
  purpose: string;
}) {
  return request<{ booking: Booking }>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateCloudBooking(id: string, action: 'cancel' | 'checkin') {
  return request<{ booking: Booking }>('/api/bookings', {
    method: 'PUT',
    body: JSON.stringify({ id, action }),
  });
}

export async function loginCloud(payload: {
  provider: AuthProvider;
  email?: string;
  password?: string;
  user?: UserProfile;
  idToken?: string;
}) {
  return request<{ user: UserProfile; provider: AuthProvider }>('/api/auth', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
