import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Layers, User, BarChart3, Clock } from 'lucide-react';

export default function TeacherSubject() {
  const [sections, setSections] = useState([]); // Changed name to sections for clarity
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchSections = async () => {
      try {
        // FIXED: Fetching from sections endpoint to get Teacher + Course data
        const res = await axios.get("http://localhost:8080/api/sections");
        if (isMounted) {
          setSections(res.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch sections:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSections();
    return () => { isMounted = false; };
  }, []);

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
        <div className="p-3 rounded-2xl shadow-lg shadow-emerald-900/20">
            <Layers className="text-[#3a947e]" size={28} />
        </div>
        <div>
            <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">Assigned Sections</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 italic">
            Official Curriculum Repository · A.Y. 2025–2026
            </p>
        </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest">No active sections assigned</p>
            </div>
        ) : (
          sections.map((section) => (
            <div 
              key={section.id} 
              className="group bg-white p-2 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Subject Header Banner */}
              <div className="bg-[#062D24] p-8 rounded-[2rem] text-white relative overflow-hidden group-hover:bg-[#0a3d31] transition-colors">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-teal-500/10 transition-all" />
                
                <div className="flex justify-between items-start mb-4">
                    <span className="inline-block text-[10px] font-black opacity-80 uppercase tracking-[0.2em] border border-white/20 px-4 py-1.5 rounded-full">
                    {/* FIXED: Course code from nested object */}
                    {section.course?.code || "SUBJ-XXX"}
                    </span>
                    {/* ADDED: Section Name display */}
                    <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest bg-white/10 px-3 py-1 rounded-md">
                      {section.name}
                    </span>
                </div>
                <h2 className="text-2xl font-serif font-bold leading-tight max-w-[90%]">
                  {/* FIXED: Course title from nested object */}
                  {section.course?.title || "Untitled Course"}
                </h2>
              </div>

              {/* Subject Details */}
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-[#3a947e]">
                        <User size={14} />
                    </div>
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
                        {/* FIXED: Calling the assigned teacher name */}
                        {section.teacherName || section.teacher?.fullname || "Unassigned Instructor"}
                    </span>
                  </div>
                  <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                    {section.course?.units || 3} Units
                  </span>
                </div>

                {/* Schedule / Room Section */}
                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-50">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={12} className="text-orange-400" />
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Schedule & Venue</p>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-bold">
                        {section.schedule} | {section.room}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 italic">
                        {section.course?.description || "No description available for this course template."}
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
    </div>
  );
}