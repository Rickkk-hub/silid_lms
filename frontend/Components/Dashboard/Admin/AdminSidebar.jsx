import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  Library,
  X,
} from "lucide-react";

const NavItem = ({ icon, label, to, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} onClick={onClick}>
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? "bg-[#E8EDE7] text-[#0e2c15]"
            : "text-gray-500 hover:bg-gray-100"
        }`}
      >
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
};

export default function AdminSidebar({ open, setOpen }) {
  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50
          h-screen w-64 bg-white border-r border-gray-200
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* CONTENT WRAPPER (SCROLL AREA) */}
        <div className="flex flex-col h-full overflow-y-auto p-6">

          {/* Close button (mobile) */}
          <div className="flex justify-end md:hidden mb-4">
            <button onClick={() => setOpen(false)}>
              <X size={22} />
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#3D967C] rounded-2xl flex items-center justify-center">
              <GraduationCap className="text-white" size={24} />
            </div>

            <div className="flex flex-col">
              <h1 className="text-xl font-serif font-bold text-[#2D362F]">
                SILID LMS
              </h1>
              <span className="text-xs text-gray-500">
                Admin Portal
              </span>
            </div>
          </div>
          {/* NAV */}
          <nav className="space-y-2">
            <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" to="/AdminDashboard" onClick={() => setOpen(false)} />
            <NavItem icon={<BookOpen size={18} />} label="Courses" to="/A-Course" onClick={() => setOpen(false)} />
            <NavItem icon={<GraduationCap size={18} />} label="Assign Teacher" to="/A-Assign" onClick={() => setOpen(false)} />
            <NavItem icon={<Users size={18} />} label="Teacher Account" to="/A-TeacherAccount" onClick={() => setOpen(false)} />
              <NavItem icon={<Users size={18} />} label="Student Account" to="/A-StudentAccount" onClick={() => setOpen(false)} />
          </nav>

        </div>
      </aside>
    </>
  );
}