import { json, preflight } from '../_lib/cors.js';
import { putUser } from '../_lib/store.js';
import { ACCOUNTS, DEMO_PASSWORD, isAllowedEmail, resolveStudent } from '../_lib/accounts.js';

async function userFromGoogleToken(idToken, env) {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );
  const payload = await response.json();
  if (!response.ok || payload.error) {
    throw new Error(payload.error_description || payload.error || 'id_token Google không hợp lệ.');
  }
  const expected = env.GOOGLE_CLIENT_ID || env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (expected && payload.aud && payload.aud !== expected) {
    throw new Error('Google Client ID không khớp.');
  }
  return resolveStudent(payload.email, payload.name, payload.picture);
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'invalid json' }, 400);
  }

  const provider = body.provider || 'email';
  let user = body.user;

  if (provider === 'google' && body.idToken) {
    try {
      user = await userFromGoogleToken(body.idToken, env);
    } catch (error) {
      return json({ ok: false, error: error instanceof Error ? error.message : 'Google token lỗi.' }, 401);
    }
  } else if (provider === 'email') {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!isAllowedEmail(email)) {
      return json({ ok: false, error: 'Chỉ chấp nhận @vku.udn.vn (mặc định abc@vku.udn.vn).' }, 400);
    }
    if (password !== DEMO_PASSWORD) {
      return json({ ok: false, error: `Sai mật khẩu. Demo dùng ${DEMO_PASSWORD}.` }, 401);
    }
    user = ACCOUNTS[email] || resolveStudent(email);
  } else if (provider === 'google' || provider === 'demo') {
    if (user?.email) {
      user = resolveStudent(user.email, user.fullName, user.avatar);
    }
  }

  if (!user || !user.email) {
    return json({ ok: false, error: 'Thiếu thông tin tài khoản.' }, 400);
  }

  if (env.VKU_BOOKINGS) {
    await putUser(env.VKU_BOOKINGS, { ...user, provider });
  }

  return json({
    ok: true,
    database: 'cloudflare-kv',
    provider,
    user: { ...user, totalHoursBooked: 0, completedBookingsCount: 0 },
  });
}

export function onRequestOptions() {
  return preflight();
}
