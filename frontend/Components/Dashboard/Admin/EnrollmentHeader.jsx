import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Menu, Bell, LogOut, User, Settings, ChevronDown, LayoutDashboard } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminHeader({ setSidebarOpen }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate(); 

  // --- REAL-TIME USER DATA FETCH ---
  // This memo ensures that whenever the header re-renders, it pulls the latest email/name
  const user = useMemo(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      return storedUser;
    } catch (err) {
      console.error("Failed to parse session data", err);
      return {};
    }
  }, []);

  const userInitial = user.fullname ? user.fullname.charAt(0).toUpperCase() : "U";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    Swal.fire({
      icon: "success",
      title: "Session Terminated",
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
    <header className="sticky top-0 z-30 bg-[#F1F5F0] px-4 md:px-10 py-6 flex items-center justify-between border-b border-slate-200/50 backdrop-blur-md">
      
      {/* Backdrop for closing dropdown */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
      )}

      {/* LEFT SECTION - Standardized Verdant UI Icon Box */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-[#3a947e] hover:bg-slate-50 transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-4">
          {/* THE ICON BOX: Same shadow and rounding as your Dashboard Cards */}
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-xl font-serif font-bold text-slate-800 tracking-tight leading-none">
              Admin Enrollment Dashboard
            </h1>
          
          </div>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3 md:gap-6 relative z-20">
        
        {/* Notifications */}
        <button className="relative p-3 text-slate-400 hover:bg-white hover:text-[#3a947e] hover:shadow-sm rounded-2xl transition-all border border-transparent hover:border-slate-100">
          <Bell className="w-5 h-5" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#F1F5F0]"></span>
        </button>

        {/* PROFILE TRIGGER: Verdant Rounded Square Style */}
        <button 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-3 p-1.5 pr-3 md:pr-4 rounded-2xl hover:bg-white hover:shadow-md transition-all group border border-transparent hover:border-slate-100"
        >
          {/* Rounded-xl Square Avatar */}
          <div className="w-10 h-10 bg-[#062D24] text-[#3a947e] rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-900/20 uppercase transition-transform group-hover:scale-105">
            {userInitial}
          </div>
          <div className="hidden md:flex flex-col items-start">
             <p className="text-[10px] font-black text-slate-800 leading-none mb-1 uppercase tracking-tighter">Account</p>
             <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* DROPDOWN: Matching the 2rem+ radius of your dashboard modules */}
        {isProfileOpen && (
          <div className="absolute right-0 top-16 w-72 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-12 h-12 bg-[#3a947e] text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-inner">
                    {userInitial}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#3a947e] uppercase tracking-widest leading-none mb-1">
                      {user.role || 'Teacher'}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 truncate max-w-[150px]">
                      {user.fullname || "User Profile"}
                    </h4>
                 </div>
              </div>
              
              {/* REAL-TIME EMAIL CARD: Verified from Database */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                 <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Verified Email</p>
                 <p className="text-xs text-slate-600 truncate font-bold italic">
                   {user.email || "No email synchronized"}
                 </p>
              </div>
            </div>

            <div className="p-4 space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-[#3a947e] rounded-xl transition-all group">
                <User size={16} className="text-slate-300 group-hover:text-[#3a947e]" />
                Profile Settings
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-[#3a947e] rounded-xl transition-all group">
                <Settings size={16} className="text-slate-300 group-hover:text-[#3a947e]" />
                Security Preferences
              </button>
            </div>

            <div className="p-4 bg-slate-50/50">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
              >
                <LogOut size={16} />
                Logout Session
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}