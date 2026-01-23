import React, { useEffect, useState } from 'react';
import { HiCheck, HiXMark, HiExclamationTriangle, HiInformationCircle } from 'react-icons/hi2';
import type { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const { id, type, message, duration = 3000, onUndo } = toast;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!duration || duration <= 0) return;

    const startTime = Date.now();
    const endTime = startTime + duration * (progress / 100);

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      const newProgress = (remaining / duration) * 100;
      
      setProgress(newProgress);

      if (remaining <= 0) {
        clearInterval(interval);
        onClose(id);
      }
    }, 10);

    return () => clearInterval(interval);
  }, [id, duration, onClose]);

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><HiCheck className="w-4 h-4 text-white stroke-2" /></div>,
          title: 'Success',
          barColor: 'bg-green-500',
        };
      case 'error':
        return {
          icon: <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"><HiXMark className="w-4 h-4 text-white stroke-2" /></div>,
          title: 'Error',
          barColor: 'bg-red-500',
        };
      case 'warning':
        return {
          icon: <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0"><HiExclamationTriangle className="w-4 h-4 text-white stroke-2" /></div>,
          title: 'Warning',
          barColor: 'bg-amber-500',
        };
      case 'info':
      default:
        return {
          icon: <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0"><HiInformationCircle className="w-4 h-4 text-white" /></div>,
          title: 'Info',
          barColor: 'bg-blue-500',
        };
    }
  };

  const config = getConfig();

  return (
    <div 
      className="relative overflow-hidden w-80 bg-white dark:bg-slate-800 rounded shadow-lg border border-slate-100 dark:border-slate-700 pointer-events-auto flex flex-col animate-in slide-in-from-right fade-in duration-300"
    >
      <div className="flex items-center gap-3 p-4">
        {config.icon}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-slate-800 dark:text-gray-100 leading-none mb-1">
            {config.title}
          </p>
          <div className="flex items-center justify-between gap-3 mt-0.5">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug break-words">
              {message}
            </p>
            {onUndo && (
               <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUndo();
                  onClose(id);
                }}
                className="shrink-0 px-3 py-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                Hoàn tác
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => onClose(id)}
          className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors cursor-pointer"
        >
          <HiXMark className="w-5 h-5" />
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-700 mt-auto">
        <div 
          className={`h-full ${config.barColor} transition-all duration-75 linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
