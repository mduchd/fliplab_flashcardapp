// Custom hook để quản lý Toast notifications
import { useState, useCallback } from 'react';
import type { ToastMessage } from '../types';
import { generateId } from '../utils/helpers';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (
      message: string,
      type: ToastMessage['type'] = 'info',
      duration: number = 5000,
      onUndo?: () => void
    ) => {
      const id = generateId();
      const toast: ToastMessage = {
        id,
        message,
        type,
        duration,
        onUndo,
      };

      setToasts((prev) => [...prev, toast]);

      // Tự động xóa sau duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, onUndo?: () => void) => {
      return showToast(message, 'success', 5000, onUndo);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, onUndo?: () => void) => {
      return showToast(message, 'error', 5000, onUndo);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, onUndo?: () => void) => {
      return showToast(message, 'info', 5000, onUndo);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, onUndo?: () => void) => {
      return showToast(message, 'warning', 5000, onUndo);
    },
    [showToast]
  );

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
};
