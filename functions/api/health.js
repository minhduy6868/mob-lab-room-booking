import { json, preflight } from '../_lib/cors.js';
import { listBookings, seedIfEmpty } from '../_lib/store.js';

export async function onRequestGet({ env }) {
  if (!env.VKU_BOOKINGS) {
    return json({ ok: false, error: 'Cloudflare KV not bound', database: 'cloudflare-kv' }, 503);
  }
  const seed = await seedIfEmpty(env.VKU_BOOKINGS);
  const records = await listBookings(env.VKU_BOOKINGS);
  return json({
    ok: true,
    database: 'cloudflare-kv',
    namespace: 'VKU_BOOKINGS',
    kv: true,
    kvCount: records.length,
    seed,
    canonical: 'https://vku-room-booking.pages.dev/',
    bookings: 'https://vku-room-booking.pages.dev/api/bookings',
  });
}

export function onRequestOptions() {
  return preflight();
}
