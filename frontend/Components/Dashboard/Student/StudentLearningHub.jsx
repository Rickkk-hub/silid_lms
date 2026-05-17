
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BookOpen, Calendar, ArrowUpRight, Clock, Loader2 } from 'lucide-react';

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true 
});

export default function LearningHub() {
  const [user] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetching Logic: Getting courses specifically assigned to the student
  const fetchCourses = useCallback(async (isMounted) => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/enrollments/student/${user.id}`);
      if (isMounted) {
        setEnrollments(res.data || []);
      }
    } catch (err) {
      console.error("Learning Hub Fetch Error:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [user]);

  // 2. Async Effect Wrapper (React Compiler Safe)
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      await fetchCourses(isMounted);
    };
    init();
    return () => { isMounted = false; };
  }, [fetchCourses]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F0]">
      <Loader2 className="animate-spin text-[#3D967C]" size={42} />
    </div>
  );

  return (
    <main className="p-4 md:p-10 pt-4 min-h-screen mx-auto bg-[#F1F5F0] text-left animate-in fade-in duration-700">
      {/* Header */}
      <section className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-slate-800 tracking-tight">Learning Hub</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
          Active Modules • {enrollments.length} Courses Enrolled
        </p>
      </section>

      {/* Due this week (Mocked based on enrollments) */}
      <section className="mb-12 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
            <Calendar size={20} />
          </div>
          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Deadlines this week</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {enrollments.slice(0, 4).map((en, idx) => (
            <DueTaskCard 
              key={en.id}
              tag={en.course?.code} 
              title={idx % 2 === 0 ? "Module Quiz" : "Lab Exercise"} 
              due={idx % 2 === 0 ? "Tomorrow · 13:00" : "Apr 28 · 23:59"} 
            />
          ))}
        </div>
      </section>

      {/* Dynamic Courses Grid */}
      <section className="pb-10">
        <h3 className="text-2xl font-bold text-slate-800 mb-8">My Courses</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {enrollments.length > 0 ? enrollments.map((en) => (
            <CourseHubCard 
              key={en.id}
              code={en.course?.code} 
              title={en.course?.title} 
              prof={en.teacher?.fullname || "Unassigned"} 
              progress="7 of 10 modules" 
              percentage={((en.id * 13) % 40) + 50} // Stable progress logic
              nextUp="Upcoming Lesson"
              nextDue="Check Syllabus"
            />
          )) : (
            <div className="col-span-2 p-20 text-center text-slate-300 italic font-black uppercase text-[10px] tracking-widest border-2 border-dashed border-slate-200 rounded-[2.5rem]">
              No active courses in registry.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

/* --- Sub-Components --- */

const DueTaskCard = ({ tag, title, due }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-50 shadow-sm transition-all hover:border-orange-200 hover:shadow-md group">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
      <span className="text-[10px] font-black text-[#3D967C] uppercase tracking-widest">{tag}</span>
    </div>
    <h4 className="text-sm font-bold text-slate-800 mb-2 leading-snug group-hover:text-[#3D967C] transition-colors">{title}</h4>
    <p className="text-[10px] font-bold text-slate-400 uppercase">{due}</p>
  </div>
);

const CourseHubCard = ({ code, title, prof, progress, percentage, nextUp, nextDue }) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full group hover:border-[#3D967C]/30 transition-all">
    {/* Card Header */}
    <div className="bg-[#062D24] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3D967C]/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
      <p className="text-[10px] font-black text-[#3D967C] mb-2 uppercase tracking-[0.3em]">{code}</p>
      <h4 className="text-2xl font-serif font-bold leading-tight">{title}</h4>
    </div>

    {/* Progress Body */}
    <div className="p-8 flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400 uppercase">
                {prof.charAt(0)}
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{prof}</p>
        </div>
        <span className="text-xs font-black text-[#3D967C]">{percentage}%</span>
      </div>
      
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{progress}</span>
      </div>

      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-10">
        <div 
          className="bg-[#3D967C] h-full rounded-full transition-all duration-1000" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50/50 -mx-8 -mb-8 p-6 px-8 border-t border-slate-50 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Module In-Focus</p>
          <p className="text-sm font-bold text-slate-800 leading-tight">{nextUp}</p>
          <p className="text-[10px] font-bold text-[#3D967C] uppercase mt-0.5">{nextDue}</p>
        </div>
        <button className="bg-[#062D24] text-[#3D967C] hover:bg-emerald-900 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
          Open Course <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  </div>
);