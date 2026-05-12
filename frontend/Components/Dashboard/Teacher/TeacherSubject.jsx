import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Loader2, Layers, User, Clock, MapPin } from 'lucide-react';

export default function TeacherSubject() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch { return {}; }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchTeacherCurriculum = async () => {
      if (!user.id) return;
      try {
        // 1. Fetch enrollments assigned to this teacher
        const res = await axios.get(`http://localhost:8080/api/enrollments/teacher/${user.id}`);
        
        if (isMounted) {
          const data = res.data || [];
          
          // 2. Group unique sections (since many students are in one section)
          // We use the section string as the key
          const uniqueSections = data.reduce((acc, current) => {
            const x = acc.find(item => item.sectionName === current.section);
            if (!x) {
              return acc.concat([{
                sectionName: current.section,
                teacherName: current.teacher?.fullname,
                // These are placeholders since we removed the Course entity 
                // but kept the visual layout for your high-fidelity UI
                courseCode: "CRSE-" + current.section.split('-')[0],
                courseTitle: "Academic Instruction",
                units: 3,
                room: "Assigned Room"
              }]);
            } else {
              return acc;
            }
          }, []);

          setSections(uniqueSections);
        }
      } catch (err) {
        console.error("Failed to fetch curriculum:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTeacherCurriculum();
    return () => { isMounted = false; };
  }, [user.id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F0]">
      <Loader2 className="animate-spin text-[#3a947e] mb-4" size={42} />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Syncing Curriculum...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F0] px-6 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl shadow-lg shadow-emerald-900/20 bg-white border border-slate-50">
            <Layers className="text-[#3a947e]" size={28} />
        </div>
        <div>
            <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">Assigned Sections</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 italic text-left">
            Official Curriculum Repository · A.Y. 2025–2026
            </p>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest">No active sections found for your account</p>
            </div>
        ) : (
          sections.map((sec, idx) => (
            <div 
              key={idx} 
              className="group bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Subject Header Banner */}
              <div className="bg-[#062D24] p-8 rounded-[2rem] text-white relative overflow-hidden group-hover:bg-[#0a3d31] transition-colors text-left">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all" />
                
                <div className="flex justify-between items-start mb-4">
                    <span className="inline-block text-[10px] font-black opacity-80 uppercase tracking-[0.2em] border border-white/20 px-4 py-1.5 rounded-full">
                      {sec.courseCode}
                    </span>
                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-md">
                      {sec.sectionName}
                    </span>
                </div>
                <h2 className="text-2xl font-serif font-bold leading-tight max-w-[90%]">
                  {sec.courseTitle}
                </h2>
              </div>

              {/* Subject Details */}
              <div className="p-6 space-y-6 text-left">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-[#3a947e]">
                        <User size={14} />
                    </div>
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
                        {sec.teacherName}
                    </span>
                  </div>
                  <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                    {sec.units} Units
                  </span>
                </div>

                {/* Schedule / Room Section */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin size={12} className="text-[#3a947e]" />
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Venue & Class Info</p>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-bold">
                        Instructional Room: {sec.room}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 italic">
                        This section is currently active for grading and module distribution for the 2025-2026 Academic Year.
                    </p>
                </div>

                {/* Footer Action */}
                <div className="px-2 pb-2">
                   <button className="w-full py-3 bg-[#F1F7F5] text-[#3a947e] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-teal-100 hover:bg-[#3a947e] hover:text-white transition-all">
                        View Section Details
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Footer Branding */}
      <div className="flex flex-col items-center gap-2 opacity-20 py-10">
        <div className="w-12 h-[1px] bg-emerald-950"></div>
        <p className="text-[8px] font-black uppercase tracking-[0.6em] text-emerald-950">
          Silid Learning Management System — 2026
        </p>
      </div>
    </div>
  );
}