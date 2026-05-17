/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, Book, Users, GraduationCap, 
  RefreshCw, Loader2, User, AlertCircle, Bookmark
} from 'lucide-react';

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true 
});

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [offerings, setOfferings] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (error) { 
      console.error("Local storage sync error:", error);
      return {}; 
    }
  }, []);

  const fetchDashboardData = useCallback(async (isMounted) => {
    try {
      const [statsRes, offeringsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/enrollments') 
      ]);
      
      if (isMounted) {
        setStats(statsRes.data);
        setOfferings(offeringsRes.data || []);
        setError(null);
        setTimeout(() => setIsReady(true), 50);
      }
    } catch (err) {
      console.error("Registry Sync Error:", err.message);
      if (isMounted) setError("Failed to connect to the central registry.");
    } finally {
      if (isMounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const startInitialFetch = async () => {
      await fetchDashboardData(isMounted);
    };

    startInitialFetch();

    const interval = setInterval(() => {
      fetchDashboardData(isMounted);
    }, 15000);

    return () => { 
      isMounted = false; 
      clearInterval(interval);
    };
  }, [fetchDashboardData]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FBFA] p-4 text-center">
      <Loader2 className="animate-spin text-[#3D967C] mb-4" size={42} /> 
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Syncing Master Registry...</p>
    </div>
  );

  return (
    <div className={`w-full space-y-6 md:space-y-8 pt-4 md:pt-6 text-left transition-all duration-500 ease-out ${
      isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
    }`}>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-xs font-bold shadow-sm w-full min-w-0">
          <AlertCircle size={18} className="shrink-0" /> <span className="break-words">{error}</span>
        </div>
      )}

      <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b border-emerald-900/5 pb-6 sm:pb-4 w-full min-w-0">
        <div className="min-w-0">
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-800 tracking-tight italic truncate">Registry Overview</h1>
          <p className="text-slate-500 mt-1 text-xs md:text-sm font-medium truncate">
            Welcome, <span className="text-slate-800 font-bold uppercase">{user.fullname || 'Admin'}</span>
          </p>
        </div>
        <button 
          onClick={() => { setIsReady(false); setLoading(true); fetchDashboardData(true); }}
          className="w-fit p-3.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#3D967C] transition-all shadow-sm active:scale-95 shrink-0"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 min-w-0 w-full">
        <StatCard icon={<Book size={20} />} label="Total Courses" value={stats?.totalCourses} trend="Registry" />
        <StatCard 
          icon={<Users size={20} />} 
          label="Active Faculty" 
          value={stats?.activeFaculty} 
          trend={stats?.unassignedCount > 0 ? `${stats.unassignedCount} Pending` : "Fully Staffed"}
          trendColor={stats?.unassignedCount > 0 ? "text-orange-600 bg-orange-50" : "text-emerald-600 bg-emerald-50"}
        />
        <StatCard icon={<GraduationCap size={20} />} label="Total Students" value={stats?.totalStudents} trend="Synced" />
        <ShieldCheckCard offerings={offerings} />
      </div>

      <section className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden border-b-4 border-b-[#3D967C] min-w-0 w-full">
        <div className="p-6 md:p-10 border-b border-slate-50 text-left min-w-0 w-full">
          <h3 className="font-serif font-bold text-2xl md:text-3xl text-slate-800 uppercase tracking-tighter italic truncate">Active Section Registry</h3>
          <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic truncate">Real-Time Course Offerings & Faculty Load</p>
        </div>
        
        <div className="hidden md:block overflow-x-auto w-full min-w-0">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
              <tr>
                <th className="px-8 py-6">Code & Section</th>
                <th className="px-6 py-5">Course Name</th>
                <th className="px-6 py-5">Assigned Instructor</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {offerings.map((offering) => (
                <tr key={offering.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl text-[10px] font-black group-hover:bg-[#3D967C] group-hover:text-white transition-all whitespace-nowrap">
                      {offering.course?.code} - {offering.section}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-700 text-xs md:text-sm group-hover:text-[#3D967C] transition-colors break-words">
                    {offering.course?.title}
                  </td>
                  <td className={`px-6 py-5 text-xs font-bold ${!offering.teacher ? 'text-orange-500 italic' : 'text-slate-500 uppercase'}`}>
                     <div className="flex items-center gap-2 max-w-[200px] truncate">
                        <User size={14} className={!offering.teacher ? "text-orange-400 shrink-0" : "text-[#3D967C] shrink-0"} />
                        <span className="truncate">{offering.teacher?.fullname || "Unassigned"}</span>
                     </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className={`px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap ${offering.status === 'ACTIVE' ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-orange-600 bg-orange-50 border border-orange-100"}`}>
                       {offering.status}
                    </span>
                  </td>
                </tr>
              ))}
              {offerings.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-16 text-center text-xs md:text-sm italic text-slate-400">
                    No active sections initialized in the registry yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-50 min-w-0 w-full">
          {offerings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 italic text-xs">No active sections initialized.</div>
          ) : (
            offerings.map((offering) => (
              <div key={offering.id} className="p-5 text-left flex flex-col gap-4 bg-[#FBFBFA] min-w-0 w-full">
                <div className="flex justify-between items-center gap-4 min-w-0">
                  <span className="bg-[#062D24] text-[#3D967C] px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 select-none">
                    {offering.course?.code} — {offering.section}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border shrink-0 ${offering.status === 'ACTIVE' ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-orange-600 bg-orange-50 border-orange-100"}`}>
                     {offering.status}
                  </span>
                </div>
                
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 text-sm break-words leading-tight uppercase font-serif">{offering.course?.title}</h4>
                  <div className={`mt-2.5 flex items-center gap-1.5 text-[10px] font-bold ${!offering.teacher ? 'text-orange-500 italic' : 'text-slate-400 uppercase tracking-tight'}`}>
                    <User size={12} className={!offering.teacher ? "text-orange-400 shrink-0" : "text-[#3D967C] shrink-0"} />
                    <span className="truncate">Instructor: {offering.teacher?.fullname || "Unassigned"}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, trend, trendColor = "text-emerald-600 bg-emerald-50" }) {
  return (
    <div className="bg-white p-6 md:p-8 lg:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:border-[#3D967C]/30 hover:shadow-xl hover:shadow-slate-200/50 flex flex-col justify-between min-w-0 w-full text-left">
      <div>
        <div className="mb-6 p-4 bg-slate-50 w-fit rounded-2xl text-[#3D967C] shrink-0 select-none">{icon}</div>
        <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 truncate">{label}</p>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-800 mb-4 truncate">{value?.toLocaleString() || "0"}</h2>
      </div>
      <span className={`px-4 py-1.5 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest w-fit whitespace-nowrap ${trendColor}`}>
        {trend}
      </span>
    </div>
  );
}

function ShieldCheckCard({ offerings }) {
  return (
    <div className="bg-white p-6 md:p-8 lg:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm transition-all hover:border-[#3D967C]/30 hover:shadow-xl hover:shadow-slate-200/50 flex flex-col justify-between min-w-0 w-full text-left">
      <div>
        <div className="mb-6 p-4 bg-slate-50 w-fit rounded-2xl text-[#3D967C] shrink-0 select-none"><Bookmark size={20} /></div>
        <p className="text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 truncate">Active Offerings</p>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-800 mb-4 truncate">{offerings.length}</h2>
      </div>
      <span className="px-4 py-1.5 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 w-fit whitespace-nowrap">
        Live Sections
      </span>
    </div>
  );
}