import { Alert } from 'react-native';

export type AppAlertTone = 'info' | 'success' | 'warning' | 'danger';
export type AppAlertKind = 'notice' | 'confirm';

export interface AppAlertRequest {
  id?: number;
  kind: AppAlertKind;
  title: string;
  message?: string;
  tone?: AppAlertTone;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

type AppAlertPresenter = (request: AppAlertRequest) => void;

let presenter: AppAlertPresenter | null = null;

export function setAppAlertPresenter(nextPresenter: AppAlertPresenter) {
  presenter = nextPresenter;
  return () => {
    if (presenter === nextPresenter) {
      presenter = null;
    }
  };
}

export function showAppNotice(request: Omit<AppAlertRequest, 'kind'>) {
  present({ ...request, kind: 'notice' });
}

export function showAppConfirm(request: Omit<AppAlertRequest, 'kind'>) {
  present({ ...request, kind: 'confirm' });
}

function present(request: AppAlertRequest) {
  const nextRequest = {
    ...request,
    id: Date.now(),
    tone: request.tone ?? 'info',
  };

  if (presenter) {
    presenter(nextRequest);
    return;
  }

  Alert.alert(
    nextRequest.title,
    nextRequest.message,
    nextRequest.kind === 'confirm'
      ? [
          { text: nextRequest.cancelText ?? 'Hủy', style: 'cancel' },
          {
            text: nextRequest.confirmText ?? 'Đồng ý',
            style: nextRequest.tone === 'danger' ? 'destructive' : 'default',
            onPress: nextRequest.onConfirm,
          },
        ]
      : [{ text: nextRequest.confirmText ?? 'Đã hiểu' }]
  );
}
