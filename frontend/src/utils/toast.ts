import { toast as sonnerToast } from 'sonner';

const SUCCESS_STYLE = {
  background: '#1a2744',
  color: '#ffffff',
  border: '1px solid rgba(134,239,172,0.3)',
};

const ERROR_STYLE = {
  background: '#1a2744',
  color: '#ffffff',
  border: '1px solid rgba(252,165,165,0.3)',
};

const INFO_STYLE = {
  background: '#1a2744',
  color: '#ffffff',
  border: '1px solid rgba(147,197,253,0.3)',
};

export const toast = {
  success: (message: string) => sonnerToast.success(message, { style: SUCCESS_STYLE }),
  error: (message: string) => sonnerToast.error(message, { style: ERROR_STYLE }),
  info: (message: string) => sonnerToast.info(message, { style: INFO_STYLE }),
};

export const showSuccess = (message: string) =>
  sonnerToast.success(message, { style: SUCCESS_STYLE });

export const showError = (message: string) =>
  sonnerToast.error(message, { style: ERROR_STYLE });

export const showInfo = (message: string) =>
  sonnerToast.info(message, { style: INFO_STYLE });
