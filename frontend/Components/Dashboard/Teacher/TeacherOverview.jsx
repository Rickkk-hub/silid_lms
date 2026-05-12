import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Calendar, Bell, BarChart3, Clock, MapPin } from 'lucide-react';

export default function TeacherOverview() {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchOverviewData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        // ALIGNED: Using the enrollments endpoint we just finalized
        const response = await axios.get(`http://localhost:8080/api/enrollments/teacher/${user.id}`);
        
        // Grouping unique sections (same logic as TeacherClasses)
        const uniqueSections = response.data.reduce((acc, curr) => {
          if (!acc.find(item => item.section === curr.section)) {
            acc.push(curr);
          }
          return acc;
        }, []);

        setClassesData(uniqueSections);
      } catch (error) {
        console.error("Error fetching overview:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F0]">
        <Loader2 className="animate-spin mb-3 text-[#3a947e]" size={40} />
        <p className="text-sm font-semibold uppercase text-slate-400 tracking-widest">Syncing Silid LMS...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 space-y-8 bg-[#F1F5F0] text-left">
      
      {/* GREETING SECTION */}
      <section className="text-left">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2D362F] tracking-tight">
          Good morning, {user.fullname?.split(' ')[0] || "Teacher"}!
        </h1>
        <p className="text-slate-400 text-sm mt-1 font-medium tracking-tight uppercase text-[10px] font-black">
           {classesData.length} active sections recorded for {classesData[0]?.schoolYear || "2025-2026"}
        </p>
      </section>

      {/* TOP GRID: SCHEDULE & ANNOUNCEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Real-Time Schedule Card */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-full text-left">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-[#3a947e]" />
              <h2 className="text-xl font-serif font-bold text-slate-800 tracking-tight">Today's Class Load</h2>
            </div>
          </div>
          
          <div className="space-y-3">
            {classesData.length === 0 ? (
              <p className="p-10 text-center text-slate-300 italic text-sm">No classes initialized in the registry.</p>
            ) : (
              classesData.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex items-center gap-5 p-5 rounded-3xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-300 group">
                  <div className="flex flex-col items-center justify-center bg-[#062D24] text-[#3a947e] min-w-[80px] py-3 rounded-xl text-[10px] font-black italic shadow-sm">
                    {item.course?.code || "SUBJ"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate group-hover:text-[#3a947e] transition-colors text-sm uppercase">
                      {item.course?.title || "Academic Instruction"}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                         <Clock size={12} className="text-[#3a947e]" /> {item.schedule}
                       </span>
                       <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                         <MapPin size={12} className="text-[#3a947e]" /> {item.room}
                       </span>
                       <span className="text-[10px] font-black text-[#3a947e] bg-emerald-50 px-2 py-0.5 rounded ml-auto tracking-widest">{item.section}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-full text-left">
          <div className="flex items-center gap-2 mb-8">
            <Bell size={20} className="text-[#3a947e]" />
            <h2 className="text-xl font-serif font-bold text-slate-800 tracking-tight">System Bulletins</h2>
          </div>
          <div className="space-y-4">
             <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100">
                <span className="text-[9px] font-black text-[#3a947e] uppercase tracking-[0.2em]">Curriculum Sync</span>
                <h3 className="text-sm font-bold text-slate-700 leading-snug mt-1">Your department (CCS) has finalized the 2nd Semester course templates.</h3>
                <p className="text-[11px] text-slate-400 mt-2 italic font-medium">May 12, 2026</p>
             </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: PROGRESS */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 text-left">
        <div className="flex items-center gap-2 mb-10">
          <BarChart3 size={20} className="text-[#3a947e]" />
          <h2 className="text-xl font-serif font-bold text-slate-800 tracking-tight">Term Performance Tracking</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
          {classesData.map((cls, idx) => (
            <div key={idx} className="group p-2 rounded-2xl transition-all">
              <div className="flex justify-between items-end mb-4">
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-[#3a947e] uppercase tracking-widest mb-1 italic">{cls.section}</p>
                  <h3 className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors truncate uppercase">
                    {cls.course?.title || "Subject"}
                  </h3>
                </div>
                <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md">INITIALIZED</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#3a947e] h-full rounded-full transition-all duration-1000" style={{ width: `10%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}