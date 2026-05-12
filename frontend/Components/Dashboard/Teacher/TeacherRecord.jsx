import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Loader2,
  AlertCircle,
  ClipboardCheck,
  Download,
  Filter,
  MapPin,
  User,
} from "lucide-react";

export default function TeacherRecord() {
  const [students, setStudents] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch { return {}; }
  }, []);

  // Updated fetch logic to match our Grade/Enrollment bridge
  const fetchClassRecord = useCallback(async (sectionName) => {
    if (!sectionName || !user.id) return;
    try {
      setTableLoading(true);
      
      // 1. Fetch Enrollments to get the full class list
      const enrollRes = await axios.get(`http://localhost:8080/api/enrollments/teacher/${user.id}`);
      const enrolledInThisSection = enrollRes.data.filter(en => en.section === sectionName);

      // 2. Fetch Grades for existing scores
      const gradesRes = await axios.get(`http://localhost:8080/api/grades/teacher/${user.id}/section/${sectionName}`);

      // 3. Merge to ensure clean UI records
      const recordData = enrolledInThisSection.map(enrollment => {
        const grade = gradesRes.data.find(g => g.student.id === enrollment.student.id);
        return {
          studentName: enrollment.student.fullname,
          prelim: grade ? grade.prelims : 0,
          midterm: grade ? grade.midterms : 0,
          finals: grade ? grade.finals : 0,
          standing: grade ? grade.average : 0,
          status: grade ? grade.remarks : "Ongoing"
        };
      });

      setStudents(recordData);
    } catch (err) {
      console.error("Fetch Error:", err);
      setStudents([]);
    } finally {
      setTableLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!user.id) {
        setLoading(false);
        return;
      }
      try {
        // Fetch enrollments to extract the unique section strings
        const res = await axios.get(`http://localhost:8080/api/enrollments/teacher/${user.id}`);
        if (isMounted) {
          const enrollments = res.data || [];
          const uniqueSections = [...new Set(enrollments.map(e => e.section))].map(sec => ({
            id: sec,
            name: sec
          }));

          setSections(uniqueSections);
          if (uniqueSections.length > 0) {
            const firstSec = uniqueSections[0].id;
            setSelectedSection(firstSec);
            await fetchClassRecord(firstSec);
          }
        }
      } catch (err) {
        console.error("Load Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [user.id, fetchClassRecord]);

  const handleSectionChange = (e) => {
    const sectionName = e.target.value;
    setSelectedSection(sectionName);
    fetchClassRecord(sectionName);
  };

  const getStandingColor = (standing) => {
    if (!standing || standing === 0) return "bg-slate-50 text-slate-300 border-slate-100";
    if (standing >= 90) return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (standing >= 75) return "bg-blue-50 text-blue-600 border-blue-100";
    return "bg-red-50 text-red-600 border-red-100";
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F0]">
      <Loader2 className="animate-spin text-[#3a947e] mb-4" size={42} />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Loading Academic Records...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F0] px-6 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="p-3 rounded-2xl shadow-lg bg-white border border-slate-50">
            <ClipboardCheck className="text-[#3a947e]" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">Academic Records</h1>
            <div className="flex items-center gap-3 mt-1">
              <select
                value={selectedSection}
                onChange={handleSectionChange}
                className="bg-white border-none shadow-sm text-slate-700 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-[#3a947e]/20 cursor-pointer"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    Section: {sec.name}
                  </option>
                ))}
              </select>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 italic">
                <Filter size={10} className="text-[#3a947e]" /> {students.length} Records Verified
              </span>
            </div>
          </div>
        </div>

        <button onClick={() => window.print()} className="bg-[#062D24] text-[#3a947e] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-[#3a947e]/20 shadow-xl active:scale-95 transition-all">
          <Download size={16} /> Export Academic Report
        </button>
      </header>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
        {tableLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#3a947e]" size={32} />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] border-b border-slate-50 bg-slate-50/30">
                <th className="px-8 py-6">Student Information</th>
                <th className="px-4 py-6 text-center">Prelim</th>
                <th className="px-4 py-6 text-center">Midterm</th>
                <th className="px-4 py-6 text-center">Finals</th>
                <th className="px-4 py-6 text-center">Standing</th>
                <th className="px-8 py-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-32 text-center opacity-30">
                    <AlertCircle size={40} className="mx-auto mb-3" />
                    <p className="text-xs font-black uppercase tracking-widest italic text-slate-500">
                      No matching records for {selectedSection || "this section"}
                    </p>
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-all duration-300 group">
                    <td className="px-8 py-5 text-sm font-bold text-slate-700">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
                          <User size={18} />
                        </div>
                        {student.studentName}
                      </div>
                    </td>
                    
                    <td className="px-4 py-5 text-center text-xs font-bold text-slate-500">
                      {student.prelim.toFixed(2)}
                    </td>
                    <td className="px-4 py-5 text-center text-xs font-bold text-slate-500">
                      {student.midterm.toFixed(2)}
                    </td>
                    <td className="px-4 py-5 text-center text-xs font-bold text-slate-500">
                      {student.finals.toFixed(2)}
                    </td>
                    
                    <td className="px-4 py-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-lg font-black text-[10px] border shadow-sm ${getStandingColor(student.standing)}`}>
                        {student.standing.toFixed(2)}
                      </span>
                    </td>
                    
                    <td className="px-8 py-5 text-right">
                      <span className={`inline-block px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest ${
                          student.status === "PASSED" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                          student.status === "FAILED" ? "bg-red-50 text-red-600 border border-red-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2 opacity-20 py-10">
        <div className="w-12 h-[1px] bg-emerald-950"></div>
        <p className="text-[8px] font-black uppercase tracking-[0.6em] text-emerald-950">
          Silid Learning Management System — v2.0
        </p>
      </div>
    </div>
  );
}