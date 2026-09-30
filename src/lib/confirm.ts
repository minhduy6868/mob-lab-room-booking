import { AppAlertTone, showAppConfirm, showAppNotice } from './app-alert';

export function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void,
  tone?: AppAlertTone
) {
  const dangerAction = /hủy|huỷ|xóa|xoá/i.test(confirmLabel);
  showAppConfirm({
    title,
    message,
    confirmText: confirmLabel,
    cancelText: 'Hủy',
    tone: tone ?? (dangerAction ? 'danger' : 'info'),
    onConfirm,
  });
}

export function notify(title: string, message: string, tone: AppAlertTone = 'info') {
  showAppNotice({ title, message, tone });
}
