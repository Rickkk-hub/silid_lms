import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function DashboardModal({ isOpen, onClose, title, children }) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop with Blur */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-100">
        
        {/* Decorative Header Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-[#3a947e] to-[#4fb79f]" />

        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-slate-800">
              {title}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-[#3a947e] transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="bg-[#F1F5F0]/50 rounded-3xl p-6 border border-slate-50">
            {children}
          </div>
          
          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">
              Silid Learning Management System · 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}