import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, UserPlus, ShieldCheck, FileText, 
  Book, Users, GraduationCap, MoreHorizontal, AlertCircle, Loader2,
  MapPin, User
} from 'lucide-react';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, coursesRes] = await Promise.all([
          axios.get('http://localhost:8080/api/admin/stats'),
          axios.get('http://localhost:8080/api/courses')
        ]);
        setStats(statsRes.data);
        setCourses(coursesRes.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load Admin Dashboard:", err);
        setError("Connection failed. Please check if the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FBFA]">
      <Loader2 className="animate-spin text-[#3a947e] mb-4" size={42} />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Accessing Central Registry...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FBFA] p-8 text-center">
      <AlertCircle className="text-red-500 mb-4" size={48} />
      <h2 className="text-xl font-bold text-slate-800">System Offline</h2>
      <p className="text-slate-500 text-sm mt-2">{error}</p>
      <button onClick={() => window.location.reload()} className="mt-6 bg-[#3a947e] text-white px-6 py-2 rounded-xl font-bold text-sm">Retry Connection</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FBFA] p-4 md:p-8 font-sans animate-in fade-in duration-700">
      {/* Header */}
      <header className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-4xl font-serif font-bold text-slate-800 tracking-tight">Good morning, Admin.</h1>
        <p className="text-slate-500 mt-2 text-xs md:text-sm">
          Verdant LMS • A.Y. 2025—2026 • 1st Semester • 
          <span className="text-[#3a947e] font-bold underline cursor-pointer ml-1">
            {stats?.unassignedCount || 0} items need attention
          </span>
        </p>
      </header>

      {/* Warning Banner */}
      {stats?.unassignedCount > 0 && (
        <div className="bg-[#FFF9F0] border border-orange-100 rounded-2xl p-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-orange-500 shrink-0" size={20} />
            <p className="text-sm text-slate-700 font-medium">
              <span className="font-bold">{stats.unassignedCount} courses have no teacher assigned.</span>
            </p>
          </div>
          <button className="w-full md:w-auto whitespace-nowrap text-orange-700 text-[10px] font-black uppercase tracking-widest border border-orange-200 px-4 py-2 rounded-lg hover:bg-orange-100 transition-all">
            Assign Now →
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        <StatCard icon={<Book className="text-emerald-600" />} label="Total Courses" value={stats?.totalCourses} sub={`Across ${stats?.departmentCount} Depts`} trend="+ 6 new" />
        <StatCard 
          icon={<Users className="text-orange-600" />} 
          label="Active Faculty" 
          value={stats?.activeFaculty} 
          sub="Verified Instructors" 
          trend={stats?.unassignedCount > 0 ? `⚠️ ${stats.unassignedCount} pending` : "✓ Complete"}
          trendColor={stats?.unassignedCount > 0 ? "text-orange-600 bg-orange-50" : "text-emerald-600 bg-emerald-50"}
        />
        <StatCard icon={<GraduationCap className="text-red-600" />} label="Total Students" value={stats?.totalStudents?.toLocaleString()} sub="Registered" trend="↑ 12% Growth" />
        <StatCard icon={<ShieldCheck className="text-amber-600" />} label="Active Roles" value={stats?.activeRoles} sub="Security Groups" trend="✓ Verified" />
      </div>

      {/* Course Registry Section */}
      <section className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-serif font-bold text-lg md:text-xl text-slate-800">Course Registry</h3>
          <button className="w-full sm:w-auto bg-[#3a947e] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-lg transition-all active:scale-95">
            <Plus size={16} /> New Course
          </button>
        </div>
        
        {/* MOBILE CARDS (Visible only on small screens) */}
        <div className="grid grid-cols-1 divide-y divide-slate-50 md:hidden">
          {courses.map((course) => (
            <div key={course.id} className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-black">{course.code}</span>
                  <h4 className="font-bold text-slate-800 text-sm">{course.title}</h4>
                </div>
                <button className="text-slate-300 p-1"><MoreHorizontal size={18} /></button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <User size={14} className={!course.teacherName ? "text-orange-500" : "text-slate-400"} />
                  <span className={!course.teacherName ? "text-orange-600 italic" : ""}>{course.teacherName || "Unassigned"}</span>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${course.teacherName ? "text-emerald-600 bg-emerald-50" : "text-orange-600 bg-orange-50"}`}>
                  {course.teacherName ? "Active" : "Pending"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP TABLE (Hidden on small screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
              <tr>
                <th className="px-8 py-5">Code</th>
                <th className="px-4 py-5">Course Title</th>
                <th className="px-4 py-5">Faculty</th>
                <th className="px-4 py-5">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {courses.map((course) => (
                <CourseRow 
                  key={course.id}
                  code={course.code} 
                  title={course.title} 
                  teacher={course.teacherName || "Unassigned"} 
                  status={course.teacherName ? "Active" : "Pending"}
                  statusColor={course.teacherName ? "text-emerald-600 bg-emerald-50" : "text-orange-600 bg-orange-50"}
                  isAlert={!course.teacherName}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* Sub-Components */
function StatCard({ icon, label, value, sub, trend, trendColor = "text-emerald-600 bg-emerald-50" }) {
  return (
    <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm group hover:border-emerald-200 transition-all">
      <div className="mb-4 p-3 bg-slate-50 w-fit rounded-2xl group-hover:bg-emerald-50 transition-colors">{icon}</div>
      <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">{label}</p>
      <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 my-1">{value || 0}</h2>
      <p className="text-slate-400 text-[10px] md:text-[11px] mb-4">{sub}</p>
      <span className={`px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-tighter ${trendColor}`}>{trend}</span>
    </div>
  );
}

function CourseRow({ code, title, teacher, status, statusColor, isAlert }) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-8 py-5">
        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-black">{code}</span>
      </td>
      <td className="px-4 py-5 font-bold text-slate-700">{title}</td>
      <td className={`px-4 py-5 text-xs font-bold ${isAlert ? 'text-orange-600 italic' : 'text-slate-500'}`}>
        {isAlert && "⚠️ "}{teacher}
      </td>
      <td className="px-4 py-5">
        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusColor}`}>{status}</span>
      </td>
      <td className="px-8 py-5 text-right">
        <button className="text-slate-300 hover:text-slate-600 transition-colors"><MoreHorizontal size={20} /></button>
      </td>
    </tr>
  );
}