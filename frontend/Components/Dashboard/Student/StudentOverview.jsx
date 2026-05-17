/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  Award, BookOpen, Calendar, Clock, ChevronRight, Bell, Loader2 
} from 'lucide-react';

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true 
});

export default function StudentOverview() {
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (e) { return null; }
  });

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ enrollments: [], attendance: [], grades: [] });
  const [isReady, setIsReady] = useState(false);

  const fetchInsights = useCallback(async (isMounted) => {
    const studentId = user?.userId || user?.id;
    if (!studentId) return;
    
    try {
      if (isMounted) setLoading(true);
      const [enrollRes, attendRes, gradesRes] = await Promise.all([
        api.get(`/enrollments/student/${studentId}`),
        api.get(`/attendance/student/${studentId}`),
        api.get(`/grades/student/${studentId}`)
      ]);
      if (isMounted) {
        setData({
          enrollments: enrollRes.data || [],
          attendance: attendRes.data || [],
          grades: gradesRes.data || []
        });
        setTimeout(() => setIsReady(true), 50);
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      setTimeout(() => {
        if (isMounted) fetchInsights(isMounted);
      }, 0);
    }
    return () => { isMounted = false; };
  }, [user, fetchInsights]);

  const insights = useMemo(() => {
    const enrolls = data.enrollments || [];
    const attends = data.attendance || [];
    const marks = data.grades || [];
    
    const totalUnits = enrolls.reduce((acc, curr) => acc + (curr.course?.units || 3), 0);
    const courseCount = enrolls.length;
    
    const present = attends.filter(a => a.status === 'PRESENT').length;
    const attendanceRate = attends.length > 0 
      ? Math.round((present / attends.length) * 100) 
      : 0;

    const validGrades = marks.filter(g => g.average && !isNaN(g.average));
    const sum = validGrades.reduce((acc, curr) => acc + parseFloat(curr.average), 0);
    const computedGpa = validGrades.length > 0 ? (sum / validGrades.length).toFixed(2) : "0.00";

    const courseProgress = enrolls.map(en => {
      const matchGrade = marks.find(g => String(g.course?.id || g.courseId) === String(en.course?.id));
      return {
        id: en.id,
        title: en.course?.title || "Unknown Course",
        code: en.course?.code || "TBA",
        schedule: en.schedule || "No Schedule Set", 
        room: en.room || "No Room Set",             
        teacher: en.teacher?.fullname || "Unassigned Instructor",
        section: en.section || "A",
        units: en.course?.units || 3,
        progressValue: matchGrade?.average ? Math.round(parseFloat(matchGrade.average)) : 0
      };
    });

    return { totalUnits, courseCount, attendanceRate, courseProgress, computedGpa };
  }, [data]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F0]">
      <Loader2 className="animate-spin text-[#3D967C]" size={42} />
    </div>
  );

  return (
    <main className={`min-h-screen mx-auto p-4 md:p-10 pt-4 bg-[#F1F5F0] text-left transition-all duration-700 ease-out ${
      isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}>
      <section className="mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-slate-800 tracking-tight">
          Good morning, {user?.fullname ? user.fullname.split(' ')[0] : "Student"}!
        </h1>
        <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] md:text-[10px] mt-1">
          Registry ID: {user?.userId || user?.id} • Active Semester Insights
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        <StatCard icon={<Award className="text-teal-600" />} label="Current GPA" value={`${insights.computedGpa}%`} sub="Academic Standing" trend={parseFloat(insights.computedGpa) >= 75 ? "Passed" : "No Records"} />
        <StatCard icon={<BookOpen className="text-blue-500" />} label="Enrolled Units" value={insights.totalUnits} sub={`${insights.courseCount} Courses`} />
        <StatCard icon={<Calendar className="text-green-600" />} label="Attendance" value={`${insights.attendanceRate}%`} sub="Verified Logs" />
        <StatCard icon={<Clock className="text-orange-500" />} label="Pending" value="0" sub="Tasks this week" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
        <div className="lg:col-span-2 space-y-6 md:space-y-8 min-w-0">
          
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg md:text-xl font-bold text-slate-800">Enrolled Schedule</h3>
              <button type="button" className="text-[10px] font-black uppercase text-[#3D967C] tracking-widest flex items-center gap-1">
                View All <ChevronRight size={14}/>
              </button>
            </div>
            
            <div className="space-y-4">
              {insights.courseProgress.length === 0 ? (
                <p className="text-xs italic text-slate-300 py-8 text-center">No active course enrollments verified for this profile.</p>
              ) : (
                insights.courseProgress.map((cp) => (
                  <ClassRow 
                    key={cp.id} 
                    time={cp.schedule} 
                    type={cp.room} 
                    title={cp.title} 
                    code={`${cp.code} • Section ${cp.section} • ${cp.teacher}`} 
                    units={`${cp.units} units`} 
                  />
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100">
            <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6 md:mb-8">Course Progress</h3>
            <div className="space-y-6 md:space-y-8">
              {insights.courseProgress.length === 0 ? (
                <p className="text-xs italic text-slate-300 py-4 text-center">No active course progress statistics found.</p>
              ) : (
                insights.courseProgress.map((cp) => (
                  <ProgressRow key={cp.id} label={cp.title} value={cp.progressValue} />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 md:space-y-8 min-w-0">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100">
             <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-6">Upcoming Tasks</h3>
             <div className="space-y-6 md:space-y-8">
                <UpcomingItem tag="CS 331" type="quiz" title="Process Scheduling Quiz" due="Due · Tomorrow" />
                <UpcomingItem tag="CS 311" type="lab" title="AVL Tree Implementation" due="Due · Apr 24" />
             </div>
          </div>

          <div className="bg-[#062D24] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <Bell size={18} className="text-[#3D967C]" />
              <h3 className="text-lg md:text-xl font-bold italic">Announcements</h3>
            </div>
            <div className="space-y-6">
              <AnnouncementItem source="REGISTRAR" text="Pre-enrollment for next term starts May 5" time="2h ago" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const StatCard = ({ icon, label, value, sub, trend }) => (
  <div className="bg-white p-6 md:p-7 rounded-[2rem] border border-slate-100 shadow-sm relative group hover:border-[#3D967C]/30 transition-all min-w-0">
    <div className="flex items-center justify-between mb-6">
      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-emerald-50 transition-colors shrink-0">{icon}</div>
      {trend && <span className="text-[9px] font-black text-[#3D967C] bg-emerald-50 px-2 py-1 rounded-full shrink-0">{trend}</span>}
    </div>
    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 truncate">{label}</p>
    <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 mb-1 truncate">{value}</h2>
    <p className="text-[10px] text-slate-400 font-medium truncate">{sub}</p>
  </div>
);

const ClassRow = ({ time, type, title, code, units }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 bg-[#FBFBFA] rounded-2xl md:rounded-3xl border border-transparent hover:border-[#3D967C]/20 transition-all text-left">
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 min-w-0 w-full">
      <div className="min-w-0 sm:min-w-[100px] sm:border-r sm:border-slate-100 sm:pr-4 pb-2 sm:pb-0">
        <p className="text-[9px] font-black text-[#3D967C] uppercase tracking-tighter truncate">{type}</p>
        <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{time}</p>
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-bold text-slate-800 text-[14px] md:text-[15px] break-words leading-tight">{title}</h4>
        <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 break-words">{code}</p>
      </div>
    </div>
    <div className="flex sm:justify-end shrink-0 pl-0 sm:pl-2">
      <span className="text-[8px] md:text-[9px] font-black px-3 py-1 bg-slate-100 text-slate-500 rounded-full whitespace-nowrap">{units}</span>
    </div>
  </div>
);

const ProgressRow = ({ label, value }) => (
  <div className="min-w-0">
    <div className="flex justify-between items-center text-[10px] font-black mb-2.5 uppercase tracking-wider gap-8">
      <span className="text-slate-700 truncate pr-2">{label}</span>
      <span className="text-slate-400 shrink-0 tabular-nums">{value}%</span>
    </div>
    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
      <div className="bg-[#3D967C] h-full rounded-full transition-all duration-1000" style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const UpcomingItem = ({ tag, type, title, due }) => (
  <div className="group cursor-pointer min-w-0">
    <div className="flex justify-between items-center mb-2 gap-4">
      <span className="text-[9px] font-black px-2 py-1 bg-emerald-50 text-[#3D967C] rounded-lg shrink-0">{tag}</span>
      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest shrink-0">{type}</span>
    </div>
    <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#3D967C] transition-colors leading-tight mb-1 break-words">{title}</h4>
    <p className="text-[10px] text-slate-400 font-medium truncate">{due}</p>
  </div>
);

const AnnouncementItem = ({ source, text, time }) => (
  <div className="pb-5 last:pb-0 border-b border-white/10 last:border-0 mb-5 last:mb-0 text-left">
    <p className="text-[9px] font-black text-[#3D967C] tracking-[0.2em] mb-1.5 uppercase shrink-0">{source}</p>
    <p className="text-sm font-bold text-white/90 leading-snug mb-1.5 break-words">{text}</p>
    <p className="text-[10px] text-white/40 truncate">{time}</p>
  </div>
);