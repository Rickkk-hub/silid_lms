/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Loader2, Plus, Search, Activity, AlertCircle } from "lucide-react";
import BatchGradeModal from "../../Layout/HomeLayout/batchGradeModal";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

export default function TeacherGrades() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isReady, setIsReady] = useState(false);

  const user = useMemo(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      return { id: savedUser.userId || savedUser.id };
    } catch (e) {
      return {};
    }
  }, []);

  const fetchSectionGrades = useCallback(
    async (sectionName) => {
      if (!sectionName || !user.id) return;

      try {
        setTableLoading(true);
        setErrorMessage("");

        const [enrollRes, gradesRes] = await Promise.all([
          api.get(`/enrollments/teacher/${user.id}`),
          api.get(`/grades/teacher/${user.id}/section/${sectionName}`),
        ]);

        const enrolledStudents = (enrollRes.data || []).filter(
          (en) => en.section === sectionName && en.student && en.student.id
        );

        const mergedData = enrolledStudents.map((enrollment) => {
          const gradeRecord = (gradesRes.data || []).find(
            (g) => String(g.student?.id) === String(enrollment.student?.id)
          );

          return {
            studentId: enrollment.student.id,
            studentName: enrollment.student.fullname || "Unknown Identity",
            prelim: gradeRecord ? gradeRecord.prelims : null,
            midterm: gradeRecord ? gradeRecord.midterms : null,
            finals: gradeRecord ? gradeRecord.finals : null,
            average: gradeRecord ? gradeRecord.average : 0,
            remarks: gradeRecord ? gradeRecord.remarks : "N/A",
          };
        });

        setStudentList(mergedData);
        setTimeout(() => setIsReady(true), 50);
      } catch (err) {
        console.error("Sync Error:", err);
        setErrorMessage("Failed to sync grades. Please check backend connection.");
      } finally {
        setTableLoading(false);
      }
    },
    [user.id]
  );

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (!user.id) return;
      try {
        const res = await api.get(`/enrollments/teacher/${user.id}`);
        if (isMounted && res.data) {
          const validEnrollments = res.data.filter(e => e.section && e.student);
          const uniqueSections = [...new Set(validEnrollments.map((e) => e.section))];
          const options = uniqueSections.map((s) => ({ id: s, name: s }));
          
          setSections(options);
          if (options.length > 0 && !selectedSection) {
            setSelectedSection(options[0].id);
          }
        }
      } catch (e) {
        console.error("Initial load error:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (user.id) {
      setTimeout(() => {
        init();
      }, 0);
    }
    return () => { isMounted = false; };
  }, [user.id, selectedSection]);

  useEffect(() => {
    let isMounted = true;
    const sync = async () => {
      if (selectedSection && isMounted) {
        await fetchSectionGrades(selectedSection);
      }
    };

    if (selectedSection) {
      setTimeout(() => {
        sync();
      }, 0);
    }
    return () => { isMounted = false; };
  }, [selectedSection, fetchSectionGrades]);

  const filteredStudents = studentList.filter((s) =>
    s.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F0] p-4 text-center">
      <Loader2 className="animate-spin text-[#3a947e]" size={42} />
    </div>
  );

  return (
    <>
      <div className={`w-full space-y-6 md:space-y-8 pt-4 md:pt-6 text-left transition-all duration-500 ease-out ${
        isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}>
        <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-emerald-900/5 pb-6 sm:pb-4 min-w-0 w-full">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <div className="p-3 rounded-2xl shadow-sm bg-white text-[#3a947e] shrink-0">
              <Activity size={24} className="md:w-7 md:h-7" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 uppercase font-serif truncate">Academic Records</h1>
              <select
                value={selectedSection}
                onChange={(e) => {
                  setIsReady(false);
                  setSelectedSection(e.target.value);
                }}
                className="mt-1.5 bg-white border-none shadow-sm text-slate-700 text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl outline-none cursor-pointer hover:bg-slate-50 transition-all uppercase"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>SECTION: {sec.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto min-w-0">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 shrink-0" size={16} />
              <input
                placeholder="Search student..."
                className="pl-11 pr-4 py-3 bg-white rounded-2xl border-none shadow-sm text-xs font-bold outline-none w-full sm:w-64 focus:ring-2 ring-emerald-500/20 transition-all text-slate-700 placeholder-slate-400"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#062D24] text-[#3a947e] px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-emerald-900 transition-all active:scale-95 shrink-0"
            >
              <Plus size={16} /> Batch Entry
            </button>
          </div>
        </header>

        {errorMessage && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl flex items-center gap-3 text-xs font-bold w-full min-w-0">
            <AlertCircle size={18} className="shrink-0" /> <span className="break-words">{errorMessage}</span>
          </div>
        )}

        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative min-w-0 w-full">
          {tableLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center">
              <Loader2 className="animate-spin text-[#3a947e]" size={24} />
            </div>
          )}

          <div className="hidden lg:block overflow-x-auto w-full min-w-0">
            <table className="w-full text-left">
              <thead className="bg-[#F1F7F5] text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5">Student Name</th>
                  <th className="px-4 py-5 text-center">Prelim</th>
                  <th className="px-4 py-5 text-center">Midterm</th>
                  <th className="px-4 py-5 text-center">Finals</th>
                  <th className="px-8 py-5 text-right">Average / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center opacity-30 italic text-xs uppercase font-black tracking-widest">No records found.</td>
                  </tr>
                ) : (
                  filteredStudents.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 font-bold text-slate-700 text-xs group-hover:text-emerald-700 transition-colors capitalize">
                        {s.studentName}
                      </td>
                      <td className="px-4 py-5 text-center text-xs font-bold text-slate-500 whitespace-nowrap">
                        {s.prelim !== null ? Number(s.prelim).toFixed(2) : "—"}
                      </td>
                      <td className="px-4 py-5 text-center text-xs font-bold text-slate-500 whitespace-nowrap">
                        {s.midterm !== null ? Number(s.midterm).toFixed(2) : "—"}
                      </td>
                      <td className="px-4 py-5 text-center text-xs font-bold text-slate-500 whitespace-nowrap">
                        {s.finals !== null ? Number(s.finals).toFixed(2) : "—"}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex flex-col items-end gap-1 min-w-0">
                          <span className="bg-[#062D24] text-[#3a947e] px-3.5 py-1 rounded-xl font-black text-[10px] shadow-sm whitespace-nowrap">
                            {s.average ? Number(s.average).toFixed(2) : "0.00"}%
                          </span>
                          <span className={`text-[8px] font-black uppercase tracking-tighter whitespace-nowrap ${s.remarks === "PASSED" ? "text-emerald-500" : "text-rose-400"}`}>
                            {s.remarks}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden divide-y divide-slate-50 min-w-0 w-full">
            {filteredStudents.length === 0 ? (
              <div className="py-12 text-center opacity-30 italic text-xs uppercase font-black tracking-widest">No records found.</div>
            ) : (
              filteredStudents.map((s, i) => (
                <div key={i} className="p-5 text-left flex flex-col gap-4 min-w-0 w-full bg-[#FBFBFA]">
                  <div className="flex justify-between items-start gap-4 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 capitalize text-sm break-words leading-tight">{s.studentName}</h4>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">ID: {s.studentId}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 select-none">
                      <span className="bg-[#062D24] text-[#3a947e] px-2.5 py-1 rounded-lg font-black text-[10px] shadow-sm">
                        {s.average ? Number(s.average).toFixed(2) : "0.00"}%
                      </span>
                      <span className={`text-[8px] font-black uppercase tracking-wider ${s.remarks === "PASSED" ? "text-emerald-500" : "text-rose-400"}`}>
                        {s.remarks}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100/70 text-center w-full">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-50">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Prelim</p>
                      <p className="text-xs font-bold text-slate-600 mt-1">{s.prelim !== null ? Number(s.prelim).toFixed(2) : "—"}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-50">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Midterm</p>
                      <p className="text-xs font-bold text-slate-600 mt-1">{s.midterm !== null ? Number(s.midterm).toFixed(2) : "—"}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-50">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Finals</p>
                      <p className="text-xs font-bold text-slate-600 mt-1">{s.finals !== null ? Number(s.finals).toFixed(2) : "—"}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BatchGradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={() => fetchSectionGrades(selectedSection)}
        sectionId={selectedSection}
      />
    </>
  );
}