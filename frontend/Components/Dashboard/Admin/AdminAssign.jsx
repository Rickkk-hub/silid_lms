/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, UserPlus, BookOpen, Clock, MapPin, Loader2, GraduationCap } from 'lucide-react';
import Swal from 'sweetalert2';

const API_BASE = "http://localhost:8080/api";

export default function AdminAssign() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isReady, setIsReady] = useState(false);

  const loadData = useCallback(async (isMounted = true) => {
    try {
      const [tRes, cRes] = await Promise.all([
        axios.get(`${API_BASE}/teachers`), 
        axios.get(`${API_BASE}/courses`)
      ]);
      
      if (isMounted) {
        setTeachers(tRes.data || []);
        setCourses(cRes.data || []);
        setTimeout(() => setIsReady(true), 50);
      }
    } catch (err) {
      console.error("Assignment Load Error:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    setTimeout(() => {
      if (isMounted) {
        loadData(isMounted);
      }
    }, 0);

    return () => { isMounted = false; };
  }, [loadData]);

  const filteredTeachers = teachers.filter(t => 
    (t.fullname || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssignSubject = async (teacher) => {
    const teacherId = teacher.teacher_id || teacher.id;

    const { value: formValues } = await Swal.fire({
      title: '<span class="text-2xl font-serif font-bold text-[#2D362F]">Assign Subject Load</span>',
      background: "#FFFFFF",
      showCancelButton: true,
      confirmButtonColor: '#062D24',
      confirmButtonText: 'Confirm Assignment',
      customClass: {
        popup: 'rounded-[2.5rem] shadow-2xl p-4 sm:p-6 w-[92vw] max-w-md',
        confirmButton: 'rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#3D967C] bg-[#062D24]'
      },
      html: `
        <div class="flex flex-col gap-4 mt-4 text-left">
          <p class="text-[10px] text-gray-400 bg-gray-50 p-3 rounded-xl border border-gray-100 font-black uppercase tracking-wider mb-1">
            Instructor: <span class="text-[#3a947e]">${teacher.fullname}</span>
          </p>
          
          <div class="space-y-1">
            <label class="text-[9px] font-black uppercase text-[#3a947e] ml-0.5 tracking-widest">Select Course</label>
            <select id="swal-course" class="w-full p-3.5 rounded-xl bg-[#F1F5F0] border-none text-xs font-bold text-gray-700 outline-none cursor-pointer">
              <option value="" disabled selected>Choose Registry Subject...</option>
              ${courses.map(c => `<option value="${c.id}">${c.code} — ${c.title}</option>`).join('')}
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-[9px] font-black uppercase text-[#3a947e] ml-0.5 tracking-widest">Section Name</label>
            <input id="swal-section-name" class="w-full p-3.5 rounded-xl bg-[#F1F5F0] border-none text-xs font-bold text-gray-700 outline-none uppercase" placeholder="e.g. BSIS-2A">
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-[9px] font-black uppercase text-[#3a947e] ml-0.5 tracking-widest">Schedule</label>
              <input id="swal-sched" class="w-full p-3.5 rounded-xl bg-[#F1F5F0] border-none text-xs font-bold text-gray-700 outline-none" placeholder="TTH 1:00-3:00">
            </div>
            <div class="space-y-1">
              <label class="text-[9px] font-black uppercase text-[#3a947e] ml-0.5 tracking-widest">Room</label>
              <input id="swal-room" class="w-full p-3.5 rounded-xl bg-[#F1F5F0] border-none text-xs font-bold text-gray-700 outline-none uppercase" placeholder="IL605">
            </div>
          </div>
        </div>
      `,
      preConfirm: () => {
        const courseId = document.getElementById('swal-course').value;
        const section = document.getElementById('swal-section-name').value;
        const schedule = document.getElementById('swal-sched').value;
        const room = document.getElementById('swal-room').value;

        if (!courseId || !section) return Swal.showValidationMessage('Course and Section are required');

        return { 
          teacherId: Number(teacherId), 
          courseId: Number(courseId),
          section: section.trim(), 
          schedule: schedule.trim(),
          room: room.trim().toUpperCase(),
          semester: "1st Semester",
          schoolYear: "2025-2026"
        };
      }
    });

    if (formValues) {
      try {
        const res = await axios.post(`${API_BASE}/enrollments/create-section`, formValues);
        if (res.data.success) {
          Swal.fire({ icon: 'success', title: 'Assigned', text: res.data.message, timer: 1500, showConfirmButton: false });
          setIsReady(false);
          loadData(true); 
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || "Failed to assign." });
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F0] p-4">
      <Loader2 className="animate-spin text-[#3a947e]" size={42} />
    </div>
  );

  return (
    <div className={`w-full space-y-6 md:space-y-8 pt-4 md:pt-6 text-left transition-all duration-500 ease-out ${
      isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
    }`}>
      <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b border-emerald-900/5 pb-6 sm:pb-4 min-w-0 w-full">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="p-3 bg-white rounded-2xl shadow-sm text-[#3a947e] shrink-0">
            <UserPlus size={24} className="md:w-7 md:h-7" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#2D362F] truncate">Faculty Load</h1>
            <p className="text-gray-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-0.5 truncate">Assignment Dashboard</p>
          </div>
        </div>
      </header>

      <div className="relative w-full max-w-md bg-white rounded-xl md:rounded-2xl shadow-sm border border-transparent focus-within:border-slate-200/60 transition-all min-w-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 shrink-0" />
        <input 
          type="text" 
          placeholder="Search instructor name..."
          className="w-full bg-transparent py-3 md:py-3.5 pl-11 pr-4 text-xs md:text-sm font-bold outline-none text-slate-700 placeholder-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 min-w-0 w-full">
        {filteredTeachers.length === 0 ? (
          <div className="py-12 text-center opacity-30 italic text-xs uppercase font-black tracking-widest col-span-full">No instructors found.</div>
        ) : (
          filteredTeachers.map((teacher) => (
            <div key={teacher.teacher_id || teacher.id} className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-gray-100 group flex flex-col justify-between gap-6 min-w-0 w-full text-left">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-[#062D24] text-[#3D967C] rounded-xl md:rounded-2xl flex items-center justify-center text-lg font-black italic shrink-0 select-none">
                  {(teacher.fullname || "U").charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-base md:text-lg font-bold text-[#2D362F] group-hover:text-[#3a947e] transition-colors uppercase font-serif truncate leading-tight">{teacher.fullname}</h4>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1 truncate">Dept: {teacher.department || "General"}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => handleAssignSubject(teacher)}
                className="w-full bg-[#062D24] text-[#3D967C] py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#0a3d31] transition-all shadow-md active:scale-[0.98] shrink-0"
              >
                Assign Load
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}