/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function DashboardModal({ isOpen, onClose, title, children }) {
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 select-none">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 z-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-100 z-10 max-h-[92vh] sm:max-h-[85vh] flex flex-col">
        <div className="h-2 w-full bg-gradient-to-r from-[#3a947e] to-[#4fb79f] shrink-0" />

        <div className="p-4 sm:p-8 flex flex-col overflow-hidden min-h-0">
          <div className="flex items-center justify-between mb-3 sm:mb-6 shrink-0 px-1">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-800">
              {title}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-[#3a947e] transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="bg-[#F1F5F0]/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-50 overflow-y-auto block clear-both h-full min-w-0">
            {children}
          </div>
          
          <div className="mt-3 sm:mt-6 text-center shrink-0 hidden sm:block">
            <p className="text-[9px] sm:text-[10px] text-slate-300 font-black uppercase tracking-widest">
              Silid Learning Management System · 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}