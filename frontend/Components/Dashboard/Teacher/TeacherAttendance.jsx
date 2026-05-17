/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Loader2, CalendarCheck, Search, Plus, ShieldCheck, Filter } from 'lucide-react';
import MarkAttendanceModal from '../../Layout/HomeLayout/MarkAttendanceModal';

const api = axios.create({ baseURL: "http://localhost:8080/api", withCredentials: true });

export default function TeacherAttendance() {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [fullHistory, setFullHistory] = useState([]); 
  const [historySearch, setHistorySearch] = useState(""); 
  const [selectedSectionFilter, setSelectedSectionFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const user = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : {};
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return {}; 
    }
  }, []);

  const loginUserId = user.id || user.userId;

  const syncAttendanceData = useCallback(async (isMounted) => {
    if (!loginUserId) {
      if (isMounted) setLoading(false);
      return;
    }
    
    try {
      if (isMounted) setLoading(true);

      // ALIGNED FIXED QUERY: Gumamit ng direktang login ID gaya ng ginawa natin sa TeacherOverview at TeacherClasses
      const [historyRes, sectionsRes, activityRes] = await Promise.all([
        api.get(`/attendance/teacher/${loginUserId}/history`),
        api.get(`/enrollments/teacher/${loginUserId}`),
        api.get(`/attendance/teacher/${loginUserId}/recent`)
      ]);

      if (isMounted) {
        const rawSections = sectionsRes.data || [];
        const fetchedHistory = historyRes.data || [];
        
        const uniqueSections = rawSections.reduce((acc, curr) => {
          const sectionName = curr.section || curr.course?.section;
          
          if (sectionName) {
            const cleanSection = String(sectionName).trim();
            if (!acc.includes(cleanSection)) {
              acc.push(cleanSection);
            }
          }
          return acc;
        }, []);
        
        setSections(uniqueSections);
        setRecentActivity(activityRes.data || []);
        setFullHistory(fetchedHistory);
        setTimeout(() => setIsReady(true), 50);
      }
    } catch (err) {
      console.error("Attendance Real-Time Sync failed:", err.message);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [loginUserId]);

  useEffect(() => {
    let isMounted = true;
    if (loginUserId) {
      setTimeout(() => {
        if (isMounted) {
          syncAttendanceData(isMounted);
        }
      }, 0);
    }
    return () => { isMounted = false; };
  }, [loginUserId, syncAttendanceData]);

  const filteredHistory = useMemo(() => {
    return fullHistory.filter(h => {
      const studentName = h.student?.fullname || h.studentName || "";
      const matchesSearch = studentName.toLowerCase().includes(historySearch.toLowerCase());
      
      const currentLogSection = h.section || h.course?.section || "";
      const matchesSection = selectedSectionFilter === "" || 
        String(currentLogSection).toLowerCase().trim() === selectedSectionFilter.toLowerCase().trim();
        
      return matchesSearch && matchesSection;
    });
  }, [fullHistory, historySearch, selectedSectionFilter]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F0] p-4 text-center">
      <Loader2 className="animate-spin text-[#3a947e]" size={42} />
      <p className="text-[10px] font-black uppercase text-slate-400 mt-4 tracking-widest">Synchronizing Faculty Records...</p>
    </div>
  );

  return (
    <>
      <div className={`w-full space-y-6 md:space-y-8 pt-4 md:pt-6 text-left transition-all duration-500 ease-out ${
        isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}>
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b border-emerald-900/5 pb-6 sm:pb-4">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="p-3 rounded-2xl bg-white text-[#3a947e] shadow-sm shrink-0"><CalendarCheck size={24} className="md:w-7 md:h-7" /></div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight uppercase font-serif truncate">Attendance Archive</h1>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">
                Instructor Panel Session: {user.fullname || "Faculty Instructor"} • Live Synchronized
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full sm:w-auto bg-[#062D24] text-[#3a947e] px-6 md:px-8 py-3.5 md:py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all shrink-0"
          >
            <Plus size={16} /> Mark Daily Attendance
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0 w-full">
          <div className="lg:col-span-2 bg-[#062D24] p-6 sm:p-8 md:p-10 rounded-[2rem] text-white shadow-xl relative border border-emerald-900/20 flex flex-col justify-between min-w-0 w-full">
             <h2 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-6">Real-Time Log Feeds (Today)</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full min-w-0">
                {recentActivity.length === 0 ? (
                  <p className="text-xs italic text-white/30 py-6 uppercase font-black tracking-widest col-span-full">No student logs registered today.</p>
                ) : (
                  recentActivity.slice(0, 3).map((act, i) => (
                    <div key={i} className="bg-white/5 p-4 md:p-5 rounded-2xl border border-white/5 flex flex-col justify-between min-w-0">
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate uppercase text-slate-100 break-words leading-tight">{act.student?.fullname || "Active Student"}</p>
                        <p className="text-[9px] font-black text-teal-400 mt-1.5 truncate">Section {act.section || act.course?.section || "N/A"}</p>
                      </div>
                      <div className="mt-4 shrink-0">
                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md whitespace-nowrap tracking-wider ${act.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10' : 'bg-amber-500/20 text-amber-400 border border-amber-500/10'}`}>
                          {act.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm flex flex-col justify-center border border-slate-100 min-w-0 w-full">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grand Total Verified Logs</p>
              <h3 className="text-5xl md:text-6xl font-bold text-slate-800 tracking-tighter mt-1 md:mt-2 truncate">{fullHistory.length}</h3>
              <div className="mt-4 flex items-center gap-2 text-[#3a947e] font-black text-[9px] uppercase tracking-widest truncate"><ShieldCheck size={14} className="shrink-0" /> Encrypted Central Ledger</div>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row gap-4 mb-6 md:mb-8">
            <div className="flex-1 flex items-center gap-4 bg-[#F1F5F0] rounded-xl px-4 py-1.5 border border-transparent focus-within:border-slate-200/60 transition-all">
               <Search size={16} className="text-slate-400 shrink-0" />
               <input placeholder="Search Student Name..." className="w-full bg-transparent py-2.5 text-xs font-bold outline-none text-slate-700 placeholder-slate-400" onChange={(e) => setHistorySearch(e.target.value)} />
            </div>
            
            <div className="flex items-center gap-3 bg-[#F1F5F0] rounded-xl px-4 py-2 border border-transparent sm:max-w-[220px] w-full">
               <Filter size={16} className="text-slate-400 shrink-0" />
               <select 
                 className="w-full bg-transparent text-xs font-bold outline-none text-slate-700 cursor-pointer appearance-none uppercase"
                 value={selectedSectionFilter}
                 onChange={(e) => setSelectedSectionFilter(e.target.value)}
               >
                 <option value="">All Sections</option>
                 {sections.map((sectionCode, idx) => (
                   <option key={idx} value={sectionCode}>{sectionCode}</option>
                 ))}
               </select>
            </div>
          </div>
          
          <div className="hidden md:block overflow-x-auto w-full min-w-0">
            <table className="w-full text-left">
              <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="pb-4 px-4">Student Identification</th>
                  <th className="pb-4 px-4">Assigned Section</th>
                  <th className="pb-4 px-4">Date Logged</th>
                  <th className="pb-4 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-16 text-center text-slate-300 italic text-xs uppercase font-black tracking-widest">No verified matching data rows found.</td>
                  </tr>
                ) : (
                  filteredHistory.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-4 text-xs font-bold uppercase text-slate-700">{h.student?.fullname || "Active Student Account"}</td>
                      <td className="py-4 px-4"><span className="text-[10px] font-black bg-slate-100 px-2.5 py-1 rounded-md text-slate-600 uppercase whitespace-nowrap">{h.section || h.course?.section}</span></td>
                      <td className="py-4 px-4 text-xs font-bold text-slate-400 whitespace-nowrap">{h.date}</td>
                      <td className="py-4 px-4 text-right">
                         <span className={`text-[9px] font-black px-4 py-1.5 rounded-xl uppercase whitespace-nowrap ${h.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                           {h.status}
                         </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4 min-w-0 w-full">
            {filteredHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-300 italic text-xs uppercase font-black tracking-widest">No matching records</div>
            ) : (
              filteredHistory.map((h, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#FBFBFA] border border-slate-100 text-left flex justify-between items-start gap-4 min-w-0">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-700 uppercase text-xs break-words leading-tight">{h.student?.fullname || "Active Student"}</h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[9px] font-black uppercase text-slate-400">
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{h.section || h.course?.section}</span>
                      <span className="text-slate-200">•</span>
                      <span>{h.date}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase whitespace-nowrap ${h.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {h.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <MarkAttendanceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onRefresh={() => syncAttendanceData(true)} />
    </>
  );
}