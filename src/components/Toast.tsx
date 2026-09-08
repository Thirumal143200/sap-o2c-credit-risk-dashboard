import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastNotification, clearNotification } = useApp();

  if (!toastNotification) return null;

  const { type, message } = toastNotification;

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-slate-900 text-white border-emerald-500/50 shadow-emerald-950/30';
      case 'error':
        return 'bg-slate-900 text-white border-rose-500/50 shadow-rose-950/30';
      case 'info':
      default:
        return 'bg-slate-900 text-white border-blue-500/50 shadow-blue-950/30';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300 max-w-md">
      <div
        className={`flex items-start space-x-3 p-4 rounded-xl border shadow-xl ${getStyles()}`}
      >
        {getIcon()}
        <div className="flex-1 text-xs">
          <div className="font-bold mb-0.5 capitalize">{type} Notification</div>
          <p className="text-slate-200 font-medium">{message}</p>
        </div>
        <button
          onClick={clearNotification}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
