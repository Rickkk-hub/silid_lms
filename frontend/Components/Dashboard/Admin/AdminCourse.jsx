/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Search, Plus, Filter, Trash2, Edit3, 
  BookOpen, Loader2, Download, CheckCircle, GraduationCap 
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminCourse() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:8080/api/courses";

  // FIXED: Using useCallback to prevent cascading renders
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setCourses(res.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const performFetch = async () => {
      // We only execute if the component is still mounted
      if (isMounted) {
        await fetchCourses();
      }
    };

    performFetch();

    // Cleanup function to prevent memory leaks/race conditions
    return () => {
      isMounted = false;
    };
  }, [fetchCourses]);

  const handleUpsertCourse = async (courseToEdit = null) => {
    const { value: formValues } = await Swal.fire({
      title: `<span class="text-2xl font-serif font-bold text-[#2D362F]">${courseToEdit ? 'Edit' : 'New'} Course</span>`,
      background: "#FFFFFF",
      showCancelButton: true,
      confirmButtonColor: '#062D24',
      confirmButtonText: courseToEdit ? 'Update Subject' : 'Register Subject',
      customClass: {
        popup: 'rounded-[2.5rem]',
        confirmButton: 'rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest text-[#3a947e]',
        cancelButton: 'rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400'
      },
      html: `
        <div class="flex flex-col gap-5 mt-6 text-left">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase text-[#3a947e] ml-1 tracking-widest">Department Assignment</label>
            <select id="swal-dept" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none outline-none text-sm font-bold appearance-none">
              <option value="CCS" ${courseToEdit?.department === 'CCS' ? 'selected' : ''}>College of Computer Studies</option>
              <option value="CBA" ${courseToEdit?.department === 'CBA' ? 'selected' : ''}>Business Administration</option>
              <option value="COE" ${courseToEdit?.department === 'COE' ? 'selected' : ''}>College of Engineering</option>
              <option value="CAS" ${courseToEdit?.department === 'CAS' ? 'selected' : ''}>Arts and Sciences</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase text-[#3a947e] ml-1 tracking-widest">Course Code</label>
              <input id="swal-code" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none outline-none text-sm font-bold" value="${courseToEdit?.code || ''}" placeholder="e.g., CS311">
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase text-[#3a947e] ml-1 tracking-widest">Units</label>
              <input id="swal-units" type="number" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none outline-none text-sm font-bold" value="${courseToEdit?.units || 3}">
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase text-[#3a947e] ml-1 tracking-widest">Course Title</label>
            <input id="swal-title" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none outline-none text-sm font-bold" value="${courseToEdit?.title || ''}" placeholder="e.g., Data Structures">
          </div>
          <div class="space-y-1.5">
             <label class="text-[10px] font-black uppercase text-[#3a947e] ml-1 tracking-widest">Category Description</label>
             <input id="swal-desc" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none outline-none text-sm font-bold" value="${courseToEdit?.description || ''}" placeholder="e.g., Major Requirement">
          </div>
        </div>
      `,
      preConfirm: () => {
        const code = document.getElementById('swal-code').value;
        const title = document.getElementById('swal-title').value;
        const dept = document.getElementById('swal-dept').value;
        if (!code || !title) return Swal.showValidationMessage('Required fields missing');
        return { 
          id: courseToEdit?.id || null,
          code: code.toUpperCase(), 
          title, 
          department: dept,
          description: document.getElementById('swal-desc').value, 
          units: parseInt(document.getElementById('swal-units').value) 
        };
      }
    });

    if (formValues) {
      try {
        const res = await axios.post(`${API_URL}/upsert`, formValues);
        if(res.data.success) {
            Swal.fire({ icon: 'success', title: 'Registry Updated', background: '#F1F5F0', timer: 1500, showConfirmButton: false });
            fetchCourses();
        }
      } catch (err) { Swal.fire("Error", "Check backend connection", "error"); }
    }
  };

  const handleDelete = async (id, code) => {
    const result = await Swal.fire({
      title: `Delete ${code}?`,
      text: "This will remove the course from the official curriculum.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete',
      background: "#F1F5F0",
      customClass: { popup: 'rounded-[2rem]' }
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${API_URL}/${id}`);
        if(res.data.success) {
            setCourses(courses.filter(c => c.id !== id));
            Swal.fire("Deleted", res.data.message, "success");
        }
      } catch (err) { console.error(err); }
    }
  };

  const filteredCourses = courses.filter(c => 
    c.code?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F1F5F0] px-4 md:px-6 lg:px-10 py-6 animate-in fade-in duration-700">
      
      <header className="mb-6 md:mb-10 flex flex-row items-center justify-between text-left border-b border-emerald-900/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white shadow-sm text-[#3a947e]">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#2D362F] tracking-tight">Course Registry</h1>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1">Official Curriculum · Silid LMS</p>
          </div>
        </div>
        
        <button 
          onClick={() => handleUpsertCourse()} 
          className="bg-[#062D24] text-[#3a947e] px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> <span className="hidden sm:inline">New Offering</span>
        </button>
      </header>

      <div className="relative mb-8 text-left">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input 
          type="text" 
          placeholder="Search by Code, Title, or Department (e.g. CCS)..."
          className="w-full bg-white border-none shadow-sm rounded-2xl py-4 pl-12 text-sm outline-none focus:ring-2 focus:ring-[#3a947e]/20 font-bold"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* MOBILE LIST */}
      <div className="md:hidden space-y-4 mb-20 text-left">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#3a947e]" /></div>
        ) : filteredCourses.map(course => (
          <div key={course.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-[#3a947e] bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-widest">
                {course.code}
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{course.department}</span>
            </div>
            <h4 className="text-lg font-serif font-bold text-[#2D362F] leading-tight">{course.title}</h4>
            <div className="flex gap-2 mt-5 pt-4 border-t border-slate-50">
               <button onClick={() => handleUpsertCourse(course)} className="flex-1 py-2 bg-slate-50 text-slate-400 rounded-xl flex justify-center"><Edit3 size={16}/></button>
               <button onClick={() => handleDelete(course.id, course.code)} className="flex-1 py-2 bg-red-50 text-red-400 rounded-xl flex justify-center"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden text-left">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-gray-50">
              <th className="p-6 text-[10px] uppercase tracking-widest text-slate-400 font-black">Subject Code</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-slate-400 font-black">Curriculum Info</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-slate-400 font-black text-center">Units</th>
              <th className="p-6 text-[10px] uppercase tracking-widest text-slate-400 font-black text-right pr-10">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="4" className="py-20 text-center uppercase font-black text-slate-300">Syncing Registry...</td></tr>
            ) : filteredCourses.map((course) => (
              <tr key={course.id} className="hover:bg-emerald-50/10 transition-all group">
                <td className="p-6">
                  <div className="flex flex-col gap-1">
                    <span className="w-fit bg-[#062D24] text-[#3a947e] px-4 py-2 rounded-xl text-[11px] font-black italic border border-teal-900/20">{course.code}</span>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">{course.department}</span>
                  </div>
                </td>
                <td className="p-6">
                  <h4 className="text-sm font-bold text-[#2D362F] font-serif uppercase tracking-tight">{course.title}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{course.description || "Core Requirement"}</p>
                </td>
                <td className="p-6 text-center text-sm font-black text-slate-600">{course.units}</td>
                <td className="p-6 text-right pr-10">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => handleUpsertCourse(course)} className="p-2.5 text-slate-400 hover:text-[#3a947e] hover:bg-emerald-50 rounded-xl transition-colors"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(course.id, course.code)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}