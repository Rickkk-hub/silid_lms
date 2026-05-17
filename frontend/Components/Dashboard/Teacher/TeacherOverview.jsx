/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Loader2, Calendar, Bell, BarChart3, Clock, MapPin } from 'lucide-react';

export default function TeacherOverview() {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) { return {}; }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchOverviewData = async () => {
      if (!user?.id) return;
      try {
        if (isMounted) setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/enrollments/teacher/${user.id}`);
        
        const uniqueSections = response.data.reduce((acc, curr) => {
          if (!acc.find(item => item.section === curr.section)) {
            acc.push(curr);
          }
          return acc;
        }, []);

        if (isMounted) {
          setClassesData(uniqueSections);
          setTimeout(() => setIsReady(true), 50);
        }
      } catch (error) {
        console.error("Error fetching overview:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOverviewData();
    return () => { isMounted = false; };
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F0] p-4">
        <Loader2 className="animate-spin mb-3 text-[#3a947e]" size={40} />
        <p className="text-xs font-bold uppercase text-slate-400 tracking-widest text-center">Syncing Silid LMS...</p>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 bg-[#F1F5F0] text-left transition-all duration-700 ease-out transform-gpu ${
      isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
    }`}>
      
      <section className="text-left min-w-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2D362F] tracking-tight truncate">
          Good morning, {user.fullname?.split(' ')[0] || "Teacher"}!
        </h1>
        <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] md:text-[10px] mt-1.5 truncate">
           {classesData.length} active sections recorded for {classesData[0]?.schoolYear || "2025-2026"}
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start min-w-0">
        
        <div className="lg:col-span-3 bg-white p-5 sm:p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 text-left min-w-0">
          <div className="flex justify-between items-center mb-6 md:mb-8">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-[#3a947e] shrink-0" />
              <h2 className="text-lg md:text-xl font-serif font-bold text-slate-800 tracking-tight">Today's Class Load</h2>
            </div>
          </div>
          
          <div className="space-y-4">
            {classesData.length === 0 ? (
              <p className="p-12 text-center text-slate-300 italic text-xs md:text-sm">No classes initialized in the registry.</p>
            ) : (
              classesData.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-[#FBFBFA] border border-transparent hover:border-slate-100 transition-all duration-300 group min-w-0">
                  <div className="flex sm:flex-col items-center justify-center bg-[#062D24] text-[#3a947e] min-w-0 sm:min-w-[90px] py-2.5 sm:py-3 px-4 sm:px-2 rounded-xl text-[9px] md:text-[10px] font-black italic shadow-sm w-fit sm:w-auto shrink-0 select-none">
                    {item.course?.code || "SUBJ"}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-bold text-slate-800 break-words group-hover:text-[#3a947e] transition-colors text-sm md:text-base uppercase leading-tight">
                      {item.course?.title || "Academic Instruction"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 min-w-0">
                       <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 shrink-0">
                         <Clock size={12} className="text-[#3a947e] shrink-0" /> {item.schedule}
                       </span>
                       <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1 shrink-0">
                         <MapPin size={12} className="text-[#3a947e] shrink-0" /> {item.room}
                       </span>
                       <span className="text-[9px] md:text-[10px] font-black text-[#3a947e] bg-emerald-50 px-2 py-0.5 rounded sm:ml-auto tracking-widest whitespace-nowrap shrink-0 uppercase border border-emerald-100">
                         {item.section}
                       </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-5 sm:p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 text-left min-w-0 w-full">
          <div className="flex items-center gap-2 mb-6 md:mb-8">
            <Bell size={20} className="text-[#3a947e] shrink-0" />
            <h2 className="text-lg md:text-xl font-serif font-bold text-slate-800 tracking-tight">System Bulletins</h2>
          </div>
          <div className="space-y-4 min-w-0 w-full">
             <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-slate-50/50 border border-slate-100 text-left min-w-0 w-full">
                <span className="text-[9px] font-black text-[#3a947e] uppercase tracking-[0.2em] shrink-0">Curriculum Sync</span>
                <h3 className="text-xs md:text-sm font-bold text-slate-700 leading-snug mt-2 break-words">Your department (CCS) has finalized the 2nd Semester course templates.</h3>
                <p className="text-[10px] md:text-[11px] text-slate-400 mt-2.5 italic font-medium truncate">May 12, 2026</p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 lg:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-slate-100 text-left min-w-0">
        <div className="flex items-center gap-2 mb-8 md:mb-10">
          <BarChart3 size={20} className="text-[#3a947e] shrink-0" />
          <h2 className="text-lg md:text-xl font-serif font-bold text-slate-800 tracking-tight">Term Performance Tracking</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 min-w-0">
          {classesData.map((cls, idx) => (
            <div key={idx} className="group p-1 rounded-2xl transition-all min-w-0">
              <div className="flex justify-between items-end mb-3 gap-4 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black text-[#3a947e] uppercase tracking-widest mb-1 italic truncate">{cls.section}</p>
                  <h3 className="text-xs md:text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors truncate uppercase leading-tight">
                    {cls.course?.title || "Subject"}
                  </h3>
                </div>
                <span className="text-[8px] md:text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded shrink-0 uppercase select-none">INITIALIZED</span>
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