import React, { useEffect } from 'react';
import { HiCheckCircle, HiXCircle, HiExclamationTriangle, HiInformationCircle, HiXMark, HiArrowUturnLeft } from 'react-icons/hi2';
import type { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const { id, type, message, duration, onUndo } = toast;

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const handleUndo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUndo) {
      onUndo();
      onClose(id);
    }
  };

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <HiCheckCircle className="w-[22px] h-[22px] text-white" />,
          bg: 'bg-gradient-to-r from-emerald-500 to-teal-600',
          shadow: 'shadow-emerald-500/30',
          border: 'border-emerald-400/30'
        };
      case 'error':
        return {
          icon: <HiXCircle className="w-[22px] h-[22px] text-white" />,
          bg: 'bg-gradient-to-r from-red-500 to-rose-600',
          shadow: 'shadow-red-500/30',
          border: 'border-red-400/30'
        };
      case 'warning':
        return {
          icon: <HiExclamationTriangle className="w-[22px] h-[22px] text-white" />,
          bg: 'bg-gradient-to-r from-amber-500 to-orange-600',
          shadow: 'shadow-amber-500/30',
          border: 'border-amber-400/30'
        };
      case 'info':
      default:
        return {
          icon: <HiInformationCircle className="w-[22px] h-[22px] text-white" />,
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
        flex items-center gap-3 p-3.5 rounded-lg
        ${config.bg} ${config.shadow} 
        border ${config.border}
        shadow-lg backdrop-blur-md
        min-w-[300px] max-w-sm
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
      <div className="flex-shrink-0 p-1.5 bg-white/20 rounded-lg backdrop-blur-sm border border-white/10">
        {config.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pointer-events-none">
        <p className="font-medium text-sm leading-snug opacity-95 break-words">
          {message}
        </p>
      </div>

      {/* Undo Button - Only show if onUndo is provided */}
      {onUndo && (
        <button
          onClick={handleUndo}
          className="flex-shrink-0 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-md text-sm font-semibold transition-all flex items-center gap-1.5 border border-white/10"
        >
          <HiArrowUturnLeft className="w-3.5 h-3.5" />
          Hoàn tác
        </button>
      )}

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(id);
        }}
        className="flex-shrink-0 p-1 rounded-md hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all text-white/80 hover:text-white"
      >
        <HiXMark className="w-4 h-4" />
      </button>
    </div>
  );
};
