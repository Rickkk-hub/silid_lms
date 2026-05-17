/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  Loader2, BookOpen, MapPin, 
  Clock, Users, GraduationCap, CheckCircle
} from "lucide-react";
import DashboardModal from "../../Layout/HomeLayout/DashboardModal";

const api = axios.create({ baseURL: "http://localhost:8080/api", withCredentials: true });

export default function TeacherClasses() {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [studentList, setStudentList] = useState([]);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (error) { 
      console.error("Auth parsing error:", error);
      return {}; 
    }
  }, []);

  const loadData = useCallback(async (isMounted) => {
    if (!user?.id) return;
    try {
      if (isMounted) setLoading(true);
      
      const response = await api.get(`/enrollments/teacher/${user.id}`);
      
      const sections = response.data.reduce((acc, curr) => {
        const sectionKey = `${curr.course?.code}-${curr.section}`;
        if (!acc[sectionKey]) {
          acc[sectionKey] = {
            ...curr,
            studentCount: curr.student ? 1 : 0,
            students: curr.student ? [curr.student] : []
          };
        } else if (curr.student) {
          acc[sectionKey].studentCount += 1;
          acc[sectionKey].students.push(curr.student);
        }
        return acc;
      }, {});

      if (isMounted) {
        setClassesData(Object.values(sections));
        setTimeout(() => setIsReady(true), 50);
      }
    } catch (error) {
      console.error(">>> FETCH ERROR:", error.response?.data || error.message);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      if (isMounted) {
        loadData(isMounted);
      }
    }, 0);
    return () => { isMounted = false; };
  }, [loadData]);

  const handleViewStudents = (sectionObj) => {
    setStudentList(sectionObj.students || []);
    setSelectedSection(sectionObj);
    setIsViewModalOpen(true);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F0] p-4">
      <Loader2 className="animate-spin mb-4 text-[#3a947e]" size={42} />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] text-center">Syncing Faculty Load...</p>
    </div>
  );

  return (
    <>
      <div className={`w-full space-y-6 md:space-y-8 pt-4 md:pt-6 text-left transition-all duration-500 ease-out ${
        isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}>
        
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-900/5 pb-6 sm:pb-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 rounded-2xl shadow-sm bg-white text-[#3a947e] shrink-0"><BookOpen size={24} className="md:w-7 md:h-7" /></div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 truncate">Teaching Load</h1>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 italic truncate">Confirmed Instructional Blocks</p>
            </div>
          </div>
          <div className="w-fit bg-white px-4 py-2 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-2.5 shrink-0">
            <CheckCircle size={16} className="text-[#3a947e]" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight whitespace-nowrap">Semester: 1st 2025-2026</span>
          </div>
        </header>

        <div className="bg-[#062D24] p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-xl relative overflow-hidden min-w-0">
          <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2 md:mb-4 truncate">Instructor Portfolio</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tighter italic break-words leading-none">
            {classesData.length} <span className="text-lg sm:text-xl md:text-2xl text-slate-400 not-italic ml-1 md:ml-2 uppercase tracking-widest">Active Subjects</span>
          </h2>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-w-0">
          <div className="divide-y divide-slate-50">
            {classesData.length === 0 ? (
              <div className="p-16 text-center text-slate-300 italic text-xs md:text-sm">Walang naka-assign na load sa registry.</div>
            ) : (
              classesData.map((item, idx) => (
                <div key={idx} className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-slate-50/50 transition-all text-left min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6 min-w-0 flex-1">
                    <div className="flex sm:flex-col items-center justify-center bg-[#F1F7F5] text-[#3a947e] min-w-0 lg:min-w-[120px] py-2.5 sm:py-4 px-4 sm:px-2 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black border border-teal-100 uppercase tracking-widest w-fit sm:w-auto shrink-0 select-none">
                      {item.section}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 text-base md:text-lg hover:text-[#3a947e] transition-colors uppercase font-serif break-words leading-snug">
                        {item.course?.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 min-w-0">
                         <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase shrink-0"><Clock size={12} className="text-[#3a947e] shrink-0"/> {item.schedule}</span>
                         <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase shrink-0"><MapPin size={12} className="text-[#3a947e] shrink-0"/> Room {item.room || "TBA"}</span>
                         <span className="text-[10px] text-teal-600 font-black flex items-center gap-1 uppercase tracking-widest shrink-0 whitespace-nowrap"><Users size={12} className="shrink-0"/> {item.studentCount} Students</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 pt-2 lg:pt-0 border-t lg:border-none border-slate-50 flex sm:justify-end">
                    <button 
                      onClick={() => handleViewStudents(item)}
                      className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-[#062D24] text-[#3a947e] rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-900 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                    >
                      <Users size={14} className="shrink-0" /> View Class List
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <DashboardModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Class List: ${selectedSection?.course?.code} - ${selectedSection?.section}`}>
        <div className="space-y-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto pr-1 text-left">
          {studentList.length === 0 ? (
            <p className="text-center py-12 text-slate-400 italic text-xs md:text-sm uppercase tracking-widest">Wala pang naka-enroll na estudyante.</p>
          ) : (
            studentList.map((student, i) => (
              <div key={i} className="flex items-center justify-between p-4 md:p-5 bg-[#F1F7F5] rounded-xl md:rounded-2xl border border-teal-50 group hover:bg-white hover:shadow-md transition-all gap-4 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 bg-white rounded-lg text-[#3a947e] shadow-sm shrink-0"><GraduationCap size={18} /></div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs md:text-sm font-bold text-slate-800 uppercase break-words leading-tight">{student.fullname}</h5>
                    <p className="text-[9px] font-black text-[#3a947e] uppercase tracking-[0.2em] mt-0.5 truncate">{student.studentId || "2025-001"}</p>
                  </div>
                </div>
                <span className="bg-[#062D24] text-[#3a947e] text-[8px] font-black px-2.5 py-1.5 rounded-lg uppercase italic shrink-0 select-none">Official</span>
              </div>
            ))
          )}
        </div>
      </DashboardModal>
    </>
  );
}