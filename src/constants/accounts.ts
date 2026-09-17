import { UserProfile } from '../types';

export const DEMO_PASSWORD = 'vku@2026';
export const VKU_EMAIL_DOMAIN = 'vku.udn.vn';
export const PERSONAL_EMAIL_DOMAIN = 'minhduyy.id.vn';

export interface DemoAccount extends UserProfile {
  providerHint: 'google' | 'email';
  googleAccountLabel: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    studentId: '23IT038',
    fullName: 'Nguyễn Văn Duy',
    email: 'abc@vku.udn.vn',
    faculty: 'Khoa Khoa học Máy tính (Faculty of Computer Science)',
    major: 'Công nghệ thông tin (Information Technology)',
    cohort: 'Khóa 2023 - 2027',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    totalHoursBooked: 0,
    completedBookingsCount: 0,
    providerHint: 'google',
    googleAccountLabel: 'Google Workspace VKU',
  },
  {
    studentId: '22IT189',
    fullName: 'Nguyễn Văn Minh',
    email: 'minhnv.22it@vku.udn.vn',
    faculty: 'Khoa Khoa học Máy tính (Faculty of Computer Science)',
    major: 'Kỹ thuật Phần mềm (Software Engineering)',
    cohort: 'Khóa 2022 - 2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    totalHoursBooked: 24,
    completedBookingsCount: 12,
    providerHint: 'google',
    googleAccountLabel: 'Google Workspace VKU',
  },
  {
    studentId: '23IT056',
    fullName: 'Trần Thị Hạnh',
    email: 'hanhtt.23it@vku.udn.vn',
    faculty: 'Khoa Khoa học Máy tính (Faculty of Computer Science)',
    major: 'Công nghệ thông tin (Information Technology)',
    cohort: 'Khóa 2023 - 2027',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    totalHoursBooked: 8,
    completedBookingsCount: 4,
    providerHint: 'google',
    googleAccountLabel: 'Google Workspace VKU',
  },
  {
    studentId: '22CE201',
    fullName: 'Lê Quốc Huy',
    email: 'huylq.22ce@vku.udn.vn',
    faculty: 'Khoa Khoa học Máy tính (Faculty of Computer Science)',
    major: 'Kỹ thuật Máy tính (Computer Engineering)',
    cohort: 'Khóa 2022 - 2026',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    totalHoursBooked: 16,
    completedBookingsCount: 7,
    providerHint: 'google',
    googleAccountLabel: 'Google Workspace VKU',
  },
];

export const PRIMARY_ACCOUNT = DEMO_ACCOUNTS[0];
export const INITIAL_USER: UserProfile = PRIMARY_ACCOUNT;

const PRIMARY_ALIASES = new Set([
  'abc@vku.udn.vn',
  '23it038@vku.udn.vn',
  'duy@minhduyy.id.vn',
]);

export function isAllowedLoginEmail(email: string): boolean {
  const value = email.trim().toLowerCase();
  return value.endsWith(`@${VKU_EMAIL_DOMAIN}`) || value.endsWith(`@${PERSONAL_EMAIL_DOMAIN}`);
}

export function findAccountByEmail(email: string): DemoAccount | undefined {
  const value = email.trim().toLowerCase();
  if (PRIMARY_ALIASES.has(value)) {
    return PRIMARY_ACCOUNT;
  }
  return DEMO_ACCOUNTS.find((account) => account.email.toLowerCase() === value);
}

export function profileFromVkuEmail(email: string, fullName?: string, picture?: string): UserProfile {
  const known = findAccountByEmail(email);
  if (known) {
    return { ...known, avatar: picture || known.avatar };
  }

  const localPart = email.split('@')[0] ?? 'sv';
  const guessedId = localPart.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() || '22IT000';

  return {
    studentId: guessedId,
    fullName: fullName?.trim() || localPart,
    email: email.trim().toLowerCase(),
    faculty: 'Khoa Khoa học Máy tính (Faculty of Computer Science)',
    major: 'Sinh viên VKU',
    cohort: 'Tài khoản Google Workspace',
    avatar: picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    totalHoursBooked: 0,
    completedBookingsCount: 0,
  };
}

export function profileFromGoogleIdentity(identity: {
  email: string;
  name?: string;
  picture?: string;
}): UserProfile {
  return profileFromVkuEmail(identity.email, identity.name, identity.picture);
}
