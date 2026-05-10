import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Menu, Search, Bell, LogOut, User, Settings, ChevronDown, X } from "lucide-react";
import Swal from "sweetalert2";

export default function AttendanceHeader({ setSidebarOpen }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const navigate = useNavigate(); 

  const handleLogout = () => {
    localStorage.removeItem("user");

    Swal.fire({
      icon: "success",
      title: "Logged out successfully",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      background: "#F1F5F0",
      iconColor: "#3a947e"
    });
    
    setTimeout(() => {
      navigate("/login"); 
    }, 1500);

    setIsProfileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F1F5F0] px-4 md:px-10 py-4 flex items-center justify-between">
      
      {isProfileOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
      )}

      {/* LEFT SECTION */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:block w-full max-w-md relative">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  className="w-full bg-white border-none shadow-sm rounded-xl py-2 pl-10 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                  placeholder="Search Attendance..."
                />
          </div>
        </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-2 md:gap-5 relative z-20">
        
        <button 
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="md:hidden p-2 text-gray-600 hover:bg-white rounded-full transition-all"
        >
          <Search size={20} />
        </button>

        <button className="relative p-2 text-gray-600 hover:bg-white hover:shadow-sm rounded-full transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#F1F5F0]"></span>
        </button>

        {/* PROFILE TRIGGER */}
        <button 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-2 p-1 pr-1 md:pr-3 rounded-full hover:bg-white hover:shadow-sm transition-all border border-transparent"
        >
          <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
            R
          </div>
          <ChevronDown size={14} className={`hidden md:block text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* PROFILE MODAL / DROPDOWN */}
        {isProfileOpen && (
          <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-gray-50 bg-gray-50/50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Student Account</p>
              <h4 className="text-sm font-bold text-[#2D362F]">Ronald Picardal</h4>
              <p className="text-[10px] text-gray-500 truncate">ronald@university.edu</p>
            </div>

            <div className="p-2">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-colors group">
                <User size={16} className="text-gray-400 group-hover:text-teal-600" />
                Profile Details
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-teal-50 hover:text-teal-700 rounded-xl transition-colors group">
                <Settings size={16} className="text-gray-400 group-hover:text-teal-600" />
                Settings
              </button>
            </div>

            <div className="p-2 border-t border-gray-50 bg-gray-50/30">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE SEARCH OVERLAY */}
      {isSearchOpen && (
        <div className="absolute inset-x-0 top-0 h-16 bg-[#F1F5F0] z-40 flex items-center px-4 animate-in slide-in-from-top duration-200 md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              autoFocus
              className="w-full bg-white border-none shadow-md rounded-xl py-2 pl-10 pr-10 text-sm outline-none"
              placeholder="Search..."
            />
            <button 
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-3 top-2 text-gray-400"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}