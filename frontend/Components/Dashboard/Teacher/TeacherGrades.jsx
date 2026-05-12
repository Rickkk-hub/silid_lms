/* eslint-disable no-unused-vars */
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
    } catch (error) { 
      console.error("Auth error:", error);
      return {}; 
    }
  }, []);

  // ALIGNMENT: Mapping backend JSON (prelims/midterms/finals) to local state
  const fetchSectionGrades = useCallback(async (sectionName) => {
    if (!sectionName || !user.id) return;
    try {
      setTableLoading(true);
      
      // 1. Get Enrollments (Source of truth for who should be in the table)
      const enrollRes = await axios.get(`http://localhost:8080/api/enrollments/teacher/${user.id}`);
      const enrolledInThisSection = enrollRes.data.filter(en => en.section === sectionName && en.student !== null);

      // 2. Get Grades (The actual scores)
      const gradesRes = await axios.get(`http://localhost:8080/api/grades/teacher/${user.id}/section/${sectionName}`);

      // 3. MERGE: Match by student.id
      const mergedList = enrolledInThisSection.map(enrollment => {
        // Look for existing grade record where the student ID matches
        const existingGrade = gradesRes.data.find(g => g.student.id === enrollment.student.id);
        
        return {
          studentId: enrollment.student.id,
          studentName: enrollment.student.fullname,
          // We use the plural keys from your @JsonProperty in Java
          prelim: existingGrade ? existingGrade.prelims : null,
          midterm: existingGrade ? existingGrade.midterms : null,
          finals: existingGrade ? existingGrade.finals : null,
          standing: existingGrade ? existingGrade.average : 0
        };
      });

      setStudentList(mergedList);
    } catch (err) {
      console.error("Grade sync error:", err);
      setStudentList([]);
    } finally {
      setTableLoading(false);
    }
  }, [user.id]);

  // INITIAL LOAD: Get sections
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      if (!user.id) return;
      try {
        const res = await axios.get(`http://localhost:8080/api/enrollments/teacher/${user.id}`);
        if (isMounted) {
          const enrollments = res.data || [];
          const uniqueNames = [...new Set(enrollments.map(e => e.section))];
          const options = uniqueNames.map(sec => ({ id: sec, name: sec }));
          setSections(options);
          
          if (options.length > 0 && !selectedSection) {
            setSelectedSection(options[0].id);
          }
        }
      } catch (err) { console.error("Error loading sections:", err); }
      finally { if (isMounted) setLoading(false); }
    };
    loadInitialData();
    return () => { isMounted = false; };
  }, [user.id, selectedSection]);

  // SYNC: Re-fetch grades whenever the section changes
  useEffect(() => {
    let isMounted = true;

    const syncGrades = async () => {
      if (selectedSection && isMounted) {
        await fetchSectionGrades(selectedSection);
      }
    };

    syncGrades();

    return () => {
      isMounted = false;
    };
  }, [selectedSection, fetchSectionGrades]);

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  const filteredStudents = studentList.filter(s => 
    s.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F0]">
      <Loader2 className="animate-spin text-[#3a947e] mb-4" size={42} />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Syncing Records...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F0] px-6 py-6 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-emerald-900/5 pb-8">
        <div className="flex items-center gap-4 text-left">
          <div className="p-3 rounded-2xl shadow-lg bg-white text-[#3a947e]"><Activity size={28} /></div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-tight text-left">Academic Records</h1>
            <div className="flex items-center gap-3 mt-1">
              <select 
                value={selectedSection}
                onChange={handleSectionChange}
                className="bg-white border-none shadow-sm text-slate-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl outline-none"
              >
                {sections.map(sec => <option key={sec.id} value={sec.id}>SECTION: {sec.name}</option>)}
              </select>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic opacity-60">Database Connected</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
             <input type="text" placeholder="Search registry..." className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm text-[11px] font-bold outline-none" onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#062D24] text-[#3a947e] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 active:scale-95 shadow-xl transition-all">
            <Plus size={16} /> Batch Entry
          </button>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative text-left">
        {tableLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#3a947e]" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F1F7F5] border-b border-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">
              <tr>
                <th className="px-8 py-6">Student Information</th>
                <th className="px-4 py-6 text-center">Prelim</th>
                <th className="px-4 py-6 text-center">Midterm</th>
                <th className="px-4 py-6 text-center">Finals</th>
                <th className="px-8 py-6 text-right">General Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredStudents.length === 0 ? (
                <tr><td colSpan="5" className="py-32 text-center opacity-20 italic">No records found for this section.</td></tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5 font-bold text-slate-700 text-sm group-hover:text-[#3a947e] uppercase">{student.studentName}</td>
                    <td className="px-4 py-5 text-center text-xs font-bold text-slate-500">{student.prelim ? student.prelim.toFixed(2) : "—"}</td>
                    <td className="px-4 py-5 text-center text-xs font-bold text-slate-500">{student.midterm ? student.midterm.toFixed(2) : "—"}</td>
                    <td className="px-4 py-5 text-center text-xs font-bold text-slate-500">{student.finals ? student.finals.toFixed(2) : "—"}</td>
                    <td className="px-8 py-5 text-right">
                      <span className="bg-[#062D24] text-[#3a947e] px-4 py-1.5 rounded-xl font-black text-[11px] border border-teal-900/10">
                        {student.standing ? student.standing.toFixed(2) : "0.00"}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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