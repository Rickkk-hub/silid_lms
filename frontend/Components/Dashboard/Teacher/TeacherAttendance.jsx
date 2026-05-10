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

  const syncAttendanceData = useCallback(async (isMounted) => {
    if (!user?.id) {
      if (isMounted) setLoading(false);
      return;
    }
    
    try {
      const [sectionsRes, activityRes, historyRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/sections/teacher/${user.id}`),
        axios.get(`http://localhost:8080/api/attendance/teacher/${user.id}/recent`),
        axios.get(`http://localhost:8080/api/attendance/teacher/${user.id}/history`)
      ]);

      if (isMounted) {
        setSections(sectionsRes.data || []);
        setRecentActivity(activityRes.data || []);
        setFullHistory(historyRes.data || []);
        setLoading(false); 
      }
    } catch (err) {
      console.error("Sync Error:", err);
      if (isMounted) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    syncAttendanceData(isMounted);
    return () => { isMounted = false; };
  }, [syncAttendanceData]);

  const filteredHistory = useMemo(() => {
    return (fullHistory || []).filter(h => {
      const nameMatch = (h.studentName || "").toLowerCase().includes(historySearch.toLowerCase());
      const sectionMatch = !selectedHistorySection || String(h.sectionId) === String(selectedHistorySection);
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
    const headers = ["Student Name", "Course", "Room", "Date", "Status", "Approved By"];
    const rows = filteredHistory.map(h => [
      h.studentName, h.courseCode, h.roomName || h.room || "TBA", h.date, h.status, user?.fullname || "Instructor"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Attendance_Report.csv`);
    link.click();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F0]">
      <Loader2 className="animate-spin text-[#3a947e] mb-4" size={42} />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Syncing Archive...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F0] px-4 md:px-8 py-6 space-y-8 overflow-x-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER */}
      <header className="flex items-center gap-4">
        <div className="p-3 rounded-2xl shadow-lg bg-white border border-slate-50 text-[#3a947e]">
          <CalendarCheck size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">Teacher Registry</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Inst: {user?.fullname}</p>
        </div>
      </header>

      {/* OVERVIEW SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#062D24] p-6 md:p-8 rounded-[2.5rem] text-white border border-emerald-900/20 shadow-xl">
           <h2 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-6">Live Logs</h2>
           <div className="space-y-4">
              {recentActivity.slice(0, 2).map((act, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate">{act.studentName}</p>
                    <p className="text-[9px] text-teal-500 font-black uppercase tracking-tighter">
                        {act.courseCode} • {act.roomName || "RM"}
                    </p>
                  </div>
                  <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase ${act.status === 'PRESENT' ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                    {act.status}
                  </span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Validated History</p>
              <h3 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 tracking-tighter">{fullHistory.length}</h3>
           </div>
           <div className="p-4 md:p-5 bg-emerald-50 rounded-3xl text-[#3a947e]">
              <UserCheck size={32} />
           </div>
        </div>
      </div>

      {/* AUDIT LOGS CONTAINER */}
      <div className="bg-white p-5 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <h2 className="text-xl font-serif font-bold text-slate-800 flex items-center gap-2">
            <History className="text-[#3a947e]" size={20} /> Audit Logs
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-9 pr-4 py-3 bg-slate-50 rounded-xl text-xs font-bold outline-none sm:min-w-[200px]"
                value={historySearch}
                onChange={(e) => { setHistorySearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <select 
              className="bg-slate-50 rounded-xl text-xs font-bold px-4 py-3 outline-none cursor-pointer"
              value={selectedHistorySection}
              onChange={(e) => { setSelectedHistorySection(e.target.value); setCurrentPage(1); }}
            >
              <option value="">All Subjects</option>
              {sections.map(s => <option key={s.id} value={s.id}>{s.courseCode}</option>)}
            </select>
          </div>
        </div>

        <div className="min-h-[300px]">
          {/* MOBILE VIEW (CARDS) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {paginatedData.map((h, idx) => (
              <div key={idx} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{h.studentName}</p>
                    <div className="flex items-center gap-1 text-slate-400 mt-1">
                      <Clock size={10} />
                      <p className="text-[9px] font-black uppercase tracking-tighter">{h.date}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${h.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {h.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                  <div className="flex items-center gap-2">
                    <span className="bg-white px-2 py-1 rounded text-[9px] font-black text-[#3a947e] uppercase border border-teal-100/50">
                      {h.courseCode || "Gen"}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <MapPin size={10} />
                      <span className="text-[9px] font-bold italic">{h.roomName || "TBA"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                    <ShieldCheck size={12} className="text-[#3a947e]" /> Admin
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW (TABLE) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="pb-4 px-2">Student Name</th>
                    <th className="pb-4">Section & Room</th>
                    <th className="pb-4 text-center">Approval</th>
                    <th className="pb-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedData.map((h, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50 transition-all duration-300">
                    <td className="py-5 px-2">
                      <p className="font-bold text-slate-700 text-sm">{h.studentName}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{h.date}</p>
                    </td>
                    <td className="py-5">
                       <span className="bg-slate-50 px-2 py-1 rounded text-[10px] font-black text-[#3a947e] uppercase mr-2 border border-teal-100/50">
                         {h.courseCode}
                       </span>
                       <span className="text-[10px] font-bold text-slate-400 italic">RM: {h.roomName || "TBA"}</span>
                    </td>
                    <td className="py-5 text-center">
                       <div className="flex items-center justify-center gap-2 text-slate-400 font-bold italic text-[11px]">
                         <ShieldCheck size={14} className="text-[#3a947e]" /> {user?.fullname}
                       </div>
                    </td>
                    <td className="py-5 text-center">
                        <span className={`inline-block min-w-[90px] px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${h.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {h.status}
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredHistory.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
              <History size={48} className="mb-4 opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest">No matching logs found</p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col items-center gap-5">
            <div className="flex items-center gap-3">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 text-slate-300 hover:text-[#3a947e] disabled:opacity-20 transition-all">
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`min-w-[36px] h-9 rounded-xl text-[11px] font-black transition-all ${currentPage === i + 1 ? 'bg-[#3a947e] text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 text-slate-300 hover:text-[#3a947e] disabled:opacity-20 transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="bg-[#062D24] p-8 md:p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-serif font-bold italic tracking-tight mb-1">Authenticated Archive</h2>
          <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em]">Verified by Inst. {user?.fullname}</p>
        </div>
        <button onClick={handleExportCSV} className="w-full md:w-auto bg-[#3a947e] px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-[#45a88f] transition-all shadow-lg active:scale-95">
          <Download size={18} /> Export CSV Report
        </button>
      </div>
    </div>
  );
}