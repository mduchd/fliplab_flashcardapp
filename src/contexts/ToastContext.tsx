import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ToastContainer';

interface ToastContextType {
  success: (message: string, onUndo?: () => void) => void;
  error: (message: string, onUndo?: () => void) => void;
  info: (message: string, onUndo?: () => void) => void;
  warning: (message: string, onUndo?: () => void) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toasts, removeToast, success, error, info, warning } = useToast();

  return (
    <ToastContext.Provider value={{ success, error, info, warning, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
