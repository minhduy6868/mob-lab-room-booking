export const DEMO_PASSWORD = 'vku@2026';

export const PRIMARY = {
  studentId: '23IT038',
  fullName: 'Nguyễn Văn Duy',
  email: 'abc@vku.udn.vn',
  faculty: 'Khoa Khoa học Máy tính (Faculty of Computer Science)',
  major: 'Công nghệ thông tin (Information Technology)',
  cohort: 'Khóa 2023 - 2027',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
};

export const ACCOUNTS = {
  'abc@vku.udn.vn': PRIMARY,
  '23it038@vku.udn.vn': PRIMARY,
  'duy@minhduyy.id.vn': PRIMARY,
  'minhnv.22it@vku.udn.vn': {
    studentId: '22IT189',
    fullName: 'Nguyễn Văn Minh',
    email: 'minhnv.22it@vku.udn.vn',
    faculty: PRIMARY.faculty,
    major: 'Kỹ thuật Phần mềm (Software Engineering)',
    cohort: 'Khóa 2022 - 2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  'hanhtt.23it@vku.udn.vn': {
    studentId: '23IT056',
    fullName: 'Trần Thị Hạnh',
    email: 'hanhtt.23it@vku.udn.vn',
    faculty: PRIMARY.faculty,
    major: 'Công nghệ thông tin (Information Technology)',
    cohort: 'Khóa 2023 - 2027',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  },
  'huylq.22ce@vku.udn.vn': {
    studentId: '22CE201',
    fullName: 'Lê Quốc Huy',
    email: 'huylq.22ce@vku.udn.vn',
    faculty: PRIMARY.faculty,
    major: 'Kỹ thuật Máy tính (Computer Engineering)',
    cohort: 'Khóa 2022 - 2026',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
  },
};

export function isAllowedEmail(email) {
  const value = String(email || '').trim().toLowerCase();
  return value.endsWith('@vku.udn.vn') || value.endsWith('@minhduyy.id.vn');
}

export function resolveStudent(email, fullName, picture) {
  const value = String(email || '').trim().toLowerCase();
  const known = ACCOUNTS[value];
  if (known) {
    return {
      ...known,
      email: known.studentId === PRIMARY.studentId ? PRIMARY.email : known.email,
      avatar: picture || known.avatar,
      totalHoursBooked: 0,
      completedBookingsCount: 0,
    };
  }

  const localPart = value.split('@')[0] || 'sv';
  const guessedId = localPart.replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase() || '22IT000';
  return {
    studentId: guessedId,
    fullName: String(fullName || localPart).trim(),
    email: value,
    faculty: PRIMARY.faculty,
    major: 'Sinh viên VKU',
    cohort: 'Tài khoản Google Workspace',
    avatar: picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    totalHoursBooked: 0,
    completedBookingsCount: 0,
  };
}
