import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthProvider, AuthSession, UserProfile } from '../types';
import {
  DEMO_PASSWORD,
  PRIMARY_ACCOUNT,
  findAccountByEmail,
  isAllowedLoginEmail,
  profileFromGoogleIdentity,
  profileFromVkuEmail,
} from '../constants/accounts';
import { appStorage } from '../lib/storage';
import { loginCloud } from '../api/cloudflare';
import { signInWithGoogleAccount } from '../lib/googleAuth';

interface AuthState {
  session: AuthSession | null;
  hydrated: boolean;
  setHydrated: (value: boolean) => void;
  loginWithGoogle: (
    user: UserProfile,
    idToken?: string
  ) => Promise<{ success: boolean; message: string }>;
  loginWithGoogleAccount: () => Promise<{ success: boolean; message: string }>;
  loginWithEmail: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message: string }>;
  loginAsDemo: () => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
}

function applySession(
  set: (partial: Partial<AuthState>) => void,
  user: UserProfile,
  provider: AuthProvider
) {
  set({
    session: {
      user,
      provider,
      signedInAt: new Date().toISOString(),
    },
  });
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      loginWithGoogle: async (user, idToken) => {
        try {
          const cloud = await loginCloud({ provider: 'google', user, idToken });
          applySession(set, cloud.user || user, 'google');
          return { success: true, message: `Xin chào ${cloud.user?.fullName || user.fullName}` };
        } catch {
          applySession(set, user, 'google');
          return { success: true, message: `Xin chào ${user.fullName}` };
        }
      },
      loginWithGoogleAccount: async () => {
        try {
          const identity = await signInWithGoogleAccount();
          const user = profileFromGoogleIdentity(identity);
          try {
            const cloud = await loginCloud({
              provider: 'google',
              user,
              idToken: identity.idToken,
            });
            applySession(set, cloud.user || user, 'google');
          } catch {
            applySession(set, user, 'google');
          }
          return { success: true, message: `Xin chào ${user.fullName}` };
        } catch (error) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Đăng nhập Google thất bại.',
          };
        }
      },
      loginWithEmail: async (email, password) => {
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail || !password) {
          return { success: false, message: 'Nhập email VKU và mật khẩu để tiếp tục.' };
        }
        if (!isAllowedLoginEmail(trimmedEmail)) {
          return {
            success: false,
            message: 'Dùng email sinh viên @vku.udn.vn (mặc định abc@vku.udn.vn).',
          };
        }
        if (password.length < 6) {
          return { success: false, message: 'Mật khẩu phải có ít nhất 6 ký tự.' };
        }

        const known = findAccountByEmail(trimmedEmail);
        if (known && password !== DEMO_PASSWORD) {
          return {
            success: false,
            message: `Sai mật khẩu. Tài khoản demo dùng mật khẩu ${DEMO_PASSWORD}.`,
          };
        }
        if (!known && password !== DEMO_PASSWORD) {
          return {
            success: false,
            message: `Với bản demo, dùng mật khẩu ${DEMO_PASSWORD}.`,
          };
        }

        try {
          const cloud = await loginCloud({ provider: 'email', email: trimmedEmail, password });
          applySession(set, cloud.user, 'email');
          return { success: true, message: `Xin chào ${cloud.user.fullName}` };
        } catch (error) {
          const user = profileFromVkuEmail(trimmedEmail, known?.fullName);
          applySession(set, user, 'email');
          return {
            success: true,
            message: error instanceof Error ? `Đăng nhập máy. KV: ${error.message}` : `Xin chào ${user.fullName}`,
          };
        }
      },
      loginAsDemo: async () => {
        const user = PRIMARY_ACCOUNT;
        try {
          await loginCloud({ provider: 'demo', user });
        } catch {
          /* still enter app */
        }
        applySession(set, user, 'demo');
        return { success: true, message: 'Đăng nhập Nguyễn Văn Duy (23IT038).' };
      },
      logout: async () => {
        set({ session: null });
        try {
          await appStorage.removeItem('vku-auth-session');
        } catch {
          /* ignore */
        }
      },
    }),
    {
      name: 'vku-auth-session',
      storage: createJSONStorage(() => appStorage),
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export function getProviderLabel(provider: AuthProvider): string {
  if (provider === 'google') return 'Google';
  if (provider === 'email') return 'Email';
  return 'Tài khoản demo';
}
