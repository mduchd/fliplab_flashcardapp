import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const { id, type, message, duration } = toast;

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 size={24} className="text-white" />,
          bg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
          shadow: 'shadow-emerald-500/30',
          border: 'border-emerald-400/30'
        };
      case 'error':
        return {
          icon: <XCircle size={24} className="text-white" />,
          bg: 'bg-gradient-to-r from-red-500 to-rose-600',
          shadow: 'shadow-red-500/30',
          border: 'border-red-400/30'
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={24} className="text-white" />,
          bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
          shadow: 'shadow-amber-500/30',
          border: 'border-amber-400/30'
        };
      case 'info':
      default:
        return {
          icon: <Info size={24} className="text-white" />,
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
          shadow: 'shadow-blue-500/30',
          border: 'border-blue-400/30'
        };
    }
  };

  const config = getConfig();

  return (
    <div 
      className={`
        relative overflow-hidden
        flex items-center gap-4 p-4 rounded-2xl
        ${config.bg} ${config.shadow} 
        border ${config.border}
        shadow-lg backdrop-blur-md
        min-w-[320px] max-w-sm
        animate-in slide-in-from-right
        text-white group
        cursor-pointer
        transition-all hover:scale-[1.02] hover:shadow-xl
      `}
      onClick={() => onClose(id)}
    >
      {/* Decorative Shine Effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Icon Container */}
      <div className="flex-shrink-0 p-2 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner border border-white/10">
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pointer-events-none">
        <h4 className="font-bold text-sm uppercase tracking-wider opacity-90 mb-0.5">
          {type === 'info' ? 'Thông báo' : type === 'warning' ? 'Chú ý' : type === 'error' ? 'Lỗi' : 'Thành công'}
        </h4>
        <p className="font-medium text-[15px] leading-snug opacity-95 break-words">
          {message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(id);
        }}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all text-white/80 hover:text-white"
      >
        <X size={18} />
      </button>
    </div>
  );
};
