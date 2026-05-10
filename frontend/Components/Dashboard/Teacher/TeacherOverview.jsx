import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Calendar, Bell, BarChart3 } from 'lucide-react';

export default function TeacherOverview() {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const fetchOverviewData = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/sections/teacher/${user.id}`);
        setClassesData(response.data);
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
        <p className="text-sm font-semibold uppercase text-slate-400 tracking-widest">Loading Overview...</p>
      </div>
    );
  }

  return (
    /* Animation classes removed from the div below */
    <div className="min-h-screen px-6 py-8 space-y-8 bg-[#F1F5F0]">
      
      {/* GREETING SECTION */}
      <section>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2D362F] tracking-tight">
          Good morning, {user.fullname?.split(' ')[0] || "Teacher"}!
        </h1>
        <p className="text-slate-400 text-sm mt-1 font-medium">You have {classesData.length} classes scheduled for this term.</p>
      </section>

      {/* TOP GRID: SCHEDULE & ANNOUNCEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        
        {/* Real-Time Schedule Card */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-full">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <Calendar size={20} className="text-[#3a947e]" />
              <h2 className="text-xl font-serif font-bold text-slate-800">Today's schedule</h2>
            </div>
          </div>
          
          <div className="space-y-2">
            {classesData.length === 0 ? (
              <p className="p-10 text-center text-slate-400 italic text-sm">No classes assigned yet.</p>
            ) : (
              classesData.slice(0, 4).map((item, idx) => (
                <div key={idx} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-all duration-300 group">
                  <div className="flex flex-col items-center justify-center bg-[#F1F7F5] text-[#3a947e] min-w-[70px] py-3 rounded-xl text-[10px] font-black border border-teal-50">
                    {item.courseCode}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate group-hover:text-[#3a947e] transition-colors text-sm">
                      {item.courseName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.schedule}</span>
                       <span className="text-slate-300">•</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.room}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Announcements */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-full">
          <div className="flex items-center gap-2 mb-8">
            <Bell size={20} className="text-[#3a947e]" />
            <h2 className="text-xl font-serif font-bold text-slate-800">Announcements</h2>
          </div>
          <div className="space-y-4">
             <div className="p-5 rounded-2xl bg-slate-50/50 border border-transparent">
                <span className="text-[9px] font-black text-[#3a947e] uppercase tracking-[0.1em]">SYSTEM</span>
                <h3 className="text-sm font-bold text-slate-700 leading-snug">Welcome to the new Silid LMS Dashboard.</h3>
             </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: PROGRESS */}
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-10">
          < BarChart3 size={20} className="text-[#3a947e]" />
          <h2 className="text-xl font-serif font-bold text-slate-800">Class completion progress</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
          {classesData.map((course, idx) => (
            <div key={idx} className="group">
              <div className="flex justify-between items-end mb-4">
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-[#3a947e] uppercase tracking-widest mb-1">{course.courseCode}</p>
                  <h3 className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition-colors truncate">
                    {course.courseName}
                  </h3>
                </div>
                <span className="text-xs font-black text-slate-800">0%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-[#3a947e] h-full rounded-full" style={{ width: `0%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}