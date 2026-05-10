/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, UserPlus, BookOpen, Clock, 
  MapPin, Loader2, GraduationCap 
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminAssign() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = "http://localhost:8080/api";

  // 1. Fetching Faculty and Course Registry
  const loadData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        axios.get(`${API_BASE}/users/role/TEACHER`), 
        axios.get(`${API_BASE}/courses`)
      ]);
      setTeachers(tRes.data || []);
      setCourses(cRes.data || []);
    } catch (err) {
      console.error("Assignment Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, []);

  // 2. Search filtering logic
  const filteredTeachers = teachers.filter(t => 
    (t.fullname || t.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. The Assignment Modal (Aligned with your Section table)
  const handleAssignSubject = async (teacher) => {
    const { value: formValues } = await Swal.fire({
      title: '<span class="text-2xl font-serif font-bold text-[#2D362F]">Assign Subject Load</span>',
      background: "#FFFFFF",
      padding: '2rem',
      showCancelButton: true,
      confirmButtonColor: '#062D24',
      confirmButtonText: 'Confirm Assignment',
      customClass: {
        popup: 'rounded-[2.5rem] shadow-2xl',
        confirmButton: 'rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest text-[#3a947e]'
      },
      html: `
        <div class="flex flex-col gap-5 mt-6 text-left">
          <p class="text-[11px] text-gray-400 bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold uppercase tracking-wider">
            Instructor: <span class="text-[#3a947e]">${teacher.fullname || teacher.name}</span>
          </p>
          
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase text-[#3a947e] ml-1 tracking-[0.2em]">Select Course</label>
            <select id="swal-course" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none text-sm font-bold text-gray-700 outline-none">
              <option value="" disabled selected>Choose Registry Subject...</option>
              ${courses.map(c => `<option value="${c.id}">${c.code} — ${c.title}</option>`).join('')}
            </select>
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase text-[#3a947e] ml-1 tracking-[0.2em]">Section Name</label>
            <input id="swal-section-name" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none text-sm font-bold text-gray-700 outline-none" placeholder="e.g. Section A">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase text-[#3a947e] ml-1 tracking-[0.2em]">Schedule</label>
              <input id="swal-sched" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none text-sm font-bold text-gray-700 outline-none" placeholder="TTH 1:00-3:00">
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase text-[#3a947e] ml-1 tracking-[0.2em]">Room</label>
              <input id="swal-room" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none text-sm font-bold text-gray-700 outline-none" placeholder="IL605">
            </div>
          </div>
        </div>
      `,
      preConfirm: () => {
        const courseId = document.getElementById('swal-course').value;
        const name = document.getElementById('swal-section-name').value;
        const schedule = document.getElementById('swal-sched').value;
        const room = document.getElementById('swal-room').value;

        if (!courseId || !name) return Swal.showValidationMessage('Course and Section Name are required');

        // RETURN FORMAT: Matches SectionDTO exactly
        return { 
          teacherId: teacher.id, 
          courseId: courseId,
          academicYearId: "1a0471ab-11d0-4f5f-bc50-460d6312ca10", // Verified ID from your terminal
          name: name, 
          schedule: schedule,
          room: room,
          maxSlots: 40
        };
      }
    });

    if (formValues) {
      try {
        await axios.post(`${API_BASE}/sections`, formValues);
        Swal.fire({ 
          icon: 'success', 
          title: 'Load Assigned', 
          text: 'Faculty assignment saved successfully.',
          background: '#F1F5F0', 
          timer: 1500, 
          showConfirmButton: false 
        });
        loadData(); 
      } catch (err) {
        console.error("Post Error Details:", err.response?.data);
        Swal.fire({
          icon: 'error',
          title: 'Assignment Failed',
          text: err.response?.data?.message || "Check server logs for database constraints.",
          background: '#F1F5F0',
          confirmButtonColor: '#062D24'
        });
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F1F5F0] px-4 md:px-10 py-8 animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-[#3a947e]">
            <UserPlus size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-[#2D362F]">Faculty Load</h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Assignment Dashboard</p>
          </div>
        </div>
        <div className="bg-white px-5 py-3 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <GraduationCap size={20} className="text-[#3a947e]"/>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Active Teachers: {teachers.length}</span>
        </div>
      </header>

      <div className="relative max-w-md mb-10 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input 
          type="text" 
          placeholder="Search by instructor name..."
          className="w-full bg-white border-none shadow-sm rounded-2xl py-4 pl-12 text-sm font-bold text-gray-700 outline-none transition-all focus:ring-2 focus:ring-teal-500/20"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
        {loading ? (
          <div className="col-span-full py-32 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-[#3a947e]" size={48} />
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em]">Gathering Faculty Data...</p>
          </div>
        ) : filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-[#062D24] text-[#3a947e] rounded-2xl flex items-center justify-center text-xl font-black italic shadow-inner">
                    {(teacher.fullname || teacher.name || "U")?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#2D362F] leading-tight group-hover:text-[#3a947e] transition-colors">
                      {teacher.fullname || teacher.name}
                    </h4>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Faculty Instructor</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <BookOpen size={14} className="text-gray-400"/>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Sections</span>
                  </div>
                  <span className="text-sm font-black text-[#3a947e]">{teacher.activeSections || 0}</span>
                </div>
              </div>

              <button 
                onClick={() => handleAssignSubject(teacher)}
                className="w-full bg-[#062D24] text-[#3a947e] py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0a3d31] transition-all shadow-lg active:scale-95"
              >
                <UserPlus size={16} /> Assign Load
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-gray-400 italic">No instructor matches found.</div>
        )}
      </div>
    </div>
  );
}