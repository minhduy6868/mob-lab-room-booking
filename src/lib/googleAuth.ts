import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { getApiBase } from '../api/cloudflare';

WebBrowser.maybeCompleteAuthSession();

export interface GoogleIdentity {
  email: string;
  name?: string;
  picture?: string;
  idToken: string;
}

function googleClientId(): string {
  return (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '').trim();
}

function decodeJwtPayload(token: string): { email?: string; name?: string; picture?: string } {
  const payload = token.split('.')[1];
  if (!payload) {
    throw new Error('Google không trả về id_token hợp lệ.');
  }
  const padded = payload.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((payload.length + 3) % 4);
  const json = globalThis.atob(padded);
  return JSON.parse(json) as { email?: string; name?: string; picture?: string };
}

function callbackUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/auth/callback.html`;
  }
  return `${getApiBase()}/auth/callback.html`;
}

async function randomNonce(): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${Date.now()}-${Math.random()}`
  );
}

function waitForPopupToken(popup: Window): Promise<string> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        window.removeEventListener('message', onMessage);
        reject(new Error('Bạn đã đóng cửa sổ Google.'));
      }
      if (Date.now() - started > 120000) {
        clearInterval(timer);
        window.removeEventListener('message', onMessage);
        reject(new Error('Hết thời gian chờ Google.'));
      }
    }, 400);

    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; idToken?: string; error?: string };
      if (data?.type !== 'google-oauth') return;
      clearInterval(timer);
      window.removeEventListener('message', onMessage);
      if (data.error) {
        reject(new Error(data.error));
        return;
      }
      if (!data.idToken) {
        reject(new Error('Google không gửi id_token.'));
        return;
      }
      resolve(data.idToken);
    }

    window.addEventListener('message', onMessage);
  });
}

export async function signInWithGoogleAccount(): Promise<GoogleIdentity> {
  const clientId = googleClientId();
  if (!clientId) {
    throw new Error(
      'Chưa gắn Google OAuth Client ID. Dùng email abc@vku.udn.vn / mật khẩu vku@2026, hoặc thêm EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.'
    );
  }

  const redirectUri = callbackUrl();
  const nonce = await randomNonce();
  const authUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?' +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce,
      prompt: 'select_account',
    }).toString();

  let idToken: string | null = null;

  if (typeof window !== 'undefined') {
    const popup = window.open(authUrl, 'vku-google-oauth', 'width=480,height=700');
    if (popup) {
      idToken = await waitForPopupToken(popup);
      popup.close();
    }
  }

  if (!idToken) {
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    if (result.type !== 'success' || !('url' in result) || !result.url) {
      throw new Error('Không hoàn tất đăng nhập Google.');
    }
    const hash = result.url.split('#')[1] || '';
    idToken = new URLSearchParams(hash).get('id_token');
  }

  if (!idToken) {
    throw new Error('Google không trả về id_token.');
  }

  const claims = decodeJwtPayload(idToken);
  if (!claims.email) {
    throw new Error('Tài khoản Google không có email.');
  }

  return {
    email: claims.email,
    name: claims.name,
    picture: claims.picture,
    idToken,
  };
}
