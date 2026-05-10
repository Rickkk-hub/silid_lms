import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Loader2, Plus, Search, AlertCircle, Activity } from 'lucide-react';
import BatchGradeModal from '../../Layout/HomeLayout/batchGradeModal';

export default function TeacherGrades() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch { return {}; }
  }, []);

  const fetchSectionGrades = useCallback(async (sectionId) => {
    if (!sectionId) return;
    try {
      setTableLoading(true);
      const res = await axios.get(`http://localhost:8080/api/grades/section/${sectionId}/summary`);
      setStudentList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch grades:", err);
      setStudentList([]);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      if (!user.id) return;
      try {
        const res = await axios.get(`http://localhost:8080/api/sections/teacher/${user.id}`);
        if (isMounted) {
          const sectionData = res.data || [];
          setSections(sectionData);
          if (sectionData.length > 0) {
            const firstId = sectionData[0].id;
            setSelectedSection(firstId);
            fetchSectionGrades(firstId);
          }
        }
      } catch (err) {
        console.error("Error loading sections:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();
    return () => { isMounted = false; };
  }, [user.id, fetchSectionGrades]);

  const handleSectionChange = (e) => {
    const id = e.target.value;
    setSelectedSection(id);
    fetchSectionGrades(id);
  };

  const filteredStudents = studentList.filter(s => 
    s.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F0]">
      <Loader2 className="animate-spin text-[#3a947e] mb-4" size={42} />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Syncing Gradebooks...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F0] px-6 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* High-Fidelity Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl shadow-lg shadow-emerald-900/20 bg-white border border-slate-50">
            <Activity className="text-[#3a947e]" size={28} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">
              Grade Management
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <select 
                value={selectedSection}
                onChange={handleSectionChange}
                className="bg-white border-none shadow-sm text-slate-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-[#3a947e]/20 cursor-pointer"
              >
                {sections.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.courseCode} — {sec.room}</option>
                ))}
              </select>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-60">
                Active Grading Session
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative group w-full sm:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
             <input 
               type="text"
               placeholder="Search student..."
               className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-[#3a947e]/20 outline-none text-[11px] font-bold text-slate-600"
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto bg-[#062D24] text-[#3a947e] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#0a3d31] transition-all border border-[#3a947e]/20 shadow-xl active:scale-95"
          >
            <Plus size={16} /> Batch Entry Mode
          </button>
        </div>
      </header>

      {/* Main Table Content */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
        {tableLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center text-[#3a947e]">
            <Loader2 className="animate-spin" size={30} />
          </div>
        )}

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em] border-b border-slate-50 bg-slate-50/30">
                <th className="px-8 py-6">Student Information</th>
                <th className="px-4 py-6 text-center">Prelim</th>
                <th className="px-4 py-6 text-center">Midterm</th>
                <th className="px-4 py-6 text-center">Finals</th>
                <th className="px-8 py-6 text-right">Computed Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-32 text-center opacity-20">
                    <AlertCircle size={40} className="mx-auto mb-2" />
                    <p className="text-sm font-bold uppercase tracking-widest">No student records match search</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 font-bold text-slate-700 text-sm group-hover:text-[#3a947e]">
                      {student.studentName}
                    </td>
                    <td className="px-4 py-5 text-center text-xs font-bold text-slate-500">
                      {student.prelim?.toFixed(2) || "—"}
                    </td>
                    <td className="px-4 py-5 text-center text-xs font-bold text-slate-500">
                      {student.midterm?.toFixed(2) || "—"}
                    </td>
                    <td className="px-4 py-5 text-center text-xs font-bold text-slate-500">
                      {student.finals?.toFixed(2) || "—"}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="bg-[#F1F7F5] text-[#3a947e] px-4 py-1.5 rounded-xl font-black text-[11px] border border-[#EBF5F2] shadow-sm">
                        {student.standing?.toFixed(2) || "0.00"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Branding - Consistent across modules */}
      <div className="flex flex-col items-center gap-2 opacity-20 py-10">
        <div className="w-12 h-[1px] bg-emerald-950"></div>
        <p className="text-[8px] font-black uppercase tracking-[0.6em] text-emerald-950">
          Silid Gradebook Management System — 2026
        </p>
      </div>

      <BatchGradeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={() => fetchSectionGrades(selectedSection)} 
        sectionId={selectedSection} 
      />
    </div>
  );
}