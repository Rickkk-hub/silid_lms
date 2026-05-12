/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  Loader2, UserCheck, Download, CalendarCheck, 
  Search, History, ShieldCheck, ChevronLeft, ChevronRight, 
  MapPin, Clock 
} from 'lucide-react';

export default function TeacherAttendance() {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [fullHistory, setFullHistory] = useState([]); 
  const [selectedHistorySection, setSelectedHistorySection] = useState("");
  const [historySearch, setHistorySearch] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }, []);

  // FIXED: Using an internal async caller to prevent cascading render warnings
  const syncAttendanceData = useCallback(async (isMounted) => {
    if (!user?.id) {
      if (isMounted) setLoading(false);
      return;
    }
    
    try {
      // 1. Fetching Section list from enrollments (The "Swak" logic)
      // 2. Fetching daily recent logs
      // 3. Fetching historical audit logs
      const [sectionsRes, activityRes, historyRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/enrollments/teacher/${user.id}`),
        axios.get(`http://localhost:8080/api/attendance/teacher/${user.id}/recent`),
        axios.get(`http://localhost:8080/api/attendance/teacher/${user.id}/history`)
      ]);

      if (isMounted) {
        // Group unique sections for the dropdown filter
        const uniqueSections = sectionsRes.data.reduce((acc, curr) => {
          if (!acc.find(item => item.section === curr.section)) {
            acc.push(curr);
          }
          return acc;
        }, []);

        setSections(uniqueSections);
        setRecentActivity(activityRes.data || []);
        setFullHistory(historyRes.data || []);
        setLoading(false); 
      }
    } catch (err) {
      console.error("Attendance Sync Error:", err);
      if (isMounted) setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    let isMounted = true;

    // Fix: Wrapping the call in a non-state-conflicting wrapper
    const initSync = async () => {
      await syncAttendanceData(isMounted);
    };

    initSync();

    return () => { isMounted = false; };
  }, [syncAttendanceData]);

  // FILTERING LOGIC
  const filteredHistory = useMemo(() => {
    return (fullHistory || []).filter(h => {
      const nameMatch = (h.student?.fullname || h.studentName || "").toLowerCase().includes(historySearch.toLowerCase());
      const sectionMatch = !selectedHistorySection || String(h.section) === String(selectedHistorySection);
      return nameMatch && sectionMatch;
    });
  }, [fullHistory, historySearch, selectedHistorySection]);

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage) || 1;
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, currentPage]);

  const handleExportCSV = () => {
    if (filteredHistory.length === 0) return;
    const headers = ["Student Name", "Section", "Status", "Date", "Remarks"];
    const rows = filteredHistory.map(h => [
      h.student?.fullname || h.studentName, 
      h.section, 
      h.status, 
      h.date, 
      h.remarks || "N/A"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Attendance_${selectedHistorySection || 'All'}.csv`);
    link.click();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F0]">
      <Loader2 className="animate-spin text-[#3a947e] mb-4" size={42} />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Syncing Archive...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F0] px-4 md:px-8 py-6 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <header className="flex items-center gap-4 text-left">
        <div className="p-3 rounded-2xl shadow-lg bg-white text-[#3a947e]">
          <CalendarCheck size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">Attendance Archive</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Validated by Inst. {user?.fullname}</p>
        </div>
      </header>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div className="bg-[#062D24] p-8 rounded-[2.5rem] text-white border border-emerald-900/20 shadow-xl">
           <h2 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-6">Recent Activity</h2>
           <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-slate-500 italic uppercase">No logs recorded today.</p>
              ) : recentActivity.slice(0, 3).map((act, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{act.student?.fullname || "Student"}</p>
                    <p className="text-[9px] text-teal-500 font-black uppercase tracking-tighter">
                        {act.section} • {act.date}
                    </p>
                  </div>
                  <span className={`text-[8px] font-black px-3 py-1 rounded-md uppercase ${act.status === 'PRESENT' ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                    {act.status}
                  </span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Logs Found</p>
              <h3 className="text-6xl font-serif font-bold text-slate-800 tracking-tighter">{fullHistory.length}</h3>
           </div>
           <div className="p-5 bg-emerald-50 rounded-3xl text-[#3a947e]">
              <UserCheck size={36} />
           </div>
        </div>
      </div>

      {/* FILTER & TABLE */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100 text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <h2 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
            <History className="text-[#3a947e]" size={20} /> Audit Logs
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="Search Student..." 
                className="w-full pl-9 pr-4 py-3 bg-[#F1F5F0] rounded-xl text-xs font-bold outline-none sm:min-w-[200px]"
                onChange={(e) => { setHistorySearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <select 
              className="bg-[#F1F5F0] rounded-xl text-xs font-bold px-4 py-3 outline-none cursor-pointer"
              value={selectedHistorySection}
              onChange={(e) => { setSelectedHistorySection(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Sections</option>
              {sections.map(s => <option key={s.id} value={s.section}>{s.section}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="pb-4 px-2">Student Name</th>
                <th className="pb-4">Section Identity</th>
                <th className="pb-4 text-center">Verified By</th>
                <th className="pb-4 text-right pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedData.map((h, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-all duration-300">
                  <td className="py-5 px-2">
                    <p className="font-bold text-slate-700 text-sm uppercase">{h.student?.fullname || "Regular Student"}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{h.date}</p>
                  </td>
                  <td className="py-5">
                     <span className="bg-[#062D24] px-3 py-1 rounded-lg text-[10px] font-black text-[#3a947e] uppercase italic mr-2">
                       {h.section}
                     </span>
                  </td>
                  <td className="py-5 text-center">
                     <div className="flex items-center justify-center gap-2 text-slate-400 font-bold italic text-[11px]">
                       <ShieldCheck size={14} className="text-[#3a947e]" /> {user?.fullname}
                     </div>
                  </td>
                  <td className="py-5 text-right pr-6">
                      <span className={`inline-block min-w-[90px] px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-center ${h.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {h.status}
                      </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION (As requested) */}
        {totalPages > 1 && (
          <div className="mt-10 pt-8 border-t border-slate-50 flex justify-center gap-2">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-[#3a947e] text-white shadow-lg' : 'bg-[#F1F5F0] text-slate-400 hover:bg-slate-200'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER EXPORT */}
      <footer className="bg-[#062D24] p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-serif font-bold italic tracking-tight mb-1 uppercase">Academic Archive</h2>
          <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em]">Authorized Instruction Management</p>
        </div>
        <button onClick={handleExportCSV} className="w-full md:w-auto bg-[#3a947e] px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-[#45a88f] transition-all shadow-lg active:scale-95">
          <Download size={18} /> Export Section Report
        </button>
      </footer>
    </div>
  );
}