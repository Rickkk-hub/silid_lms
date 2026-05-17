/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Plus, Trash2, Edit3, BookOpen, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true 
});

export default function AdminCourse() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const fetchCourses = useCallback(async (isMounted) => {
    try {
      if (isMounted) setLoading(true);
      const res = await api.get("/courses");
      if (isMounted) {
        setCourses(res.data || []);
        setTimeout(() => setIsReady(true), 50);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      if (isMounted) {
        fetchCourses(isMounted);
      }
    }, 0);
    return () => { isMounted = false; };
  }, [fetchCourses]);

  const handleUpsertCourse = async (courseToEdit = null) => {
    const { value: formValues } = await Swal.fire({
      title: `<span class="text-2xl font-serif font-bold text-slate-800">${courseToEdit ? 'Edit' : 'New'} Course</span>`,
      background: "#FFFFFF",
      showCancelButton: true,
      confirmButtonColor: '#062D24',
      confirmButtonText: courseToEdit ? 'Update Subject' : 'Register Subject',
      customClass: {
        popup: 'rounded-[2.5rem]',
        confirmButton: 'rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest text-[#3D967C]',
        cancelButton: 'rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400'
      },
      html: `
        <div class="flex flex-col gap-5 mt-6 text-left">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase text-[#3D967C] ml-1 tracking-widest">Department Assignment</label>
            <select id="swal-dept" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none outline-none text-sm font-bold appearance-none">
              <option value="CCS" ${courseToEdit?.department === 'CCS' ? 'selected' : ''}>College of Computer Studies</option>
              <option value="CBA" ${courseToEdit?.department === 'CBA' ? 'selected' : ''}>Business Administration</option>
              <option value="COE" ${courseToEdit?.department === 'COE' ? 'selected' : ''}>College of Engineering</option>
              <option value="CAS" ${courseToEdit?.department === 'CAS' ? 'selected' : ''}>Arts and Sciences</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase text-[#3D967C] ml-1 tracking-widest">Course Code</label>
              <input id="swal-code" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none outline-none text-sm font-bold" value="${courseToEdit?.code || ''}" placeholder="e.g., CS311">
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase text-[#3D967C] ml-1 tracking-widest">Units</label>
              <input id="swal-units" type="number" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none outline-none text-sm font-bold" value="${courseToEdit?.units || 3}">
            </div>
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase text-[#3D967C] ml-1 tracking-widest">Course Title</label>
            <input id="swal-title" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none outline-none text-sm font-bold" value="${courseToEdit?.title || ''}" placeholder="e.g., Data Structures">
          </div>
          <div class="space-y-1.5">
             <label class="text-[10px] font-black uppercase text-[#3D967C] ml-1 tracking-widest">Category Description</label>
             <input id="swal-desc" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none outline-none text-sm font-bold" value="${courseToEdit?.description || ''}" placeholder="e.g., Major Requirement">
          </div>
        </div>
      `,
      preConfirm: () => {
        const code = document.getElementById('swal-code').value;
        const title = document.getElementById('swal-title').value;
        const department = document.getElementById('swal-dept').value;
        if (!code || !title) return Swal.showValidationMessage('Required fields missing');
        return { 
          id: courseToEdit?.id || null,
          code: code.toUpperCase().trim(), 
          title: title.trim(), 
          department,
          description: document.getElementById('swal-desc').value, 
          units: parseInt(document.getElementById('swal-units').value) 
        };
      }
    });

    if (formValues) {
      try {
        const res = await api.post('/courses/upsert', formValues);
        if(res.data.success) {
          Swal.fire({ icon: 'success', title: 'Registry Updated', background: '#F1F5F0', timer: 1500, showConfirmButton: false });
          setIsReady(false);
          fetchCourses(true);
        } else {
          Swal.fire("Error", res.data.message, "error");
        }
      } catch (err) { Swal.fire("Error", "Check backend connection", "error"); }
    }
  };

  const handleDelete = async (id, code) => {
    const result = await Swal.fire({
      title: `Delete ${code}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete',
      background: "#FFFFFF",
      customClass: { popup: 'rounded-[2.5rem]' }
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/courses/${id}`);
        if(res.data.success) {
          setCourses(prev => prev.filter(c => c.id !== id));
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F0] p-4 text-center">
      <Loader2 className="animate-spin text-[#3D967C]" size={42} />
    </div>
  );

  return (
    <div className={`w-full space-y-6 md:space-y-8 pt-4 md:pt-6 text-left transition-all duration-500 ease-out ${
      isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
    }`}>
      <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b border-slate-200 pb-6 sm:pb-4 min-w-0 w-full">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="p-3 rounded-2xl bg-white shadow-sm text-[#3D967C] shrink-0"><BookOpen size={24} className="md:w-7 md:h-7" /></div>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 truncate">Course Registry</h1>
            <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-0.5 truncate">Curriculum Management</p>
          </div>
        </div>
        <button onClick={() => handleUpsertCourse()} className="w-full sm:w-auto bg-[#062D24] text-[#3D967C] px-6 md:px-8 py-3.5 md:py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-all">
          <Plus size={16} /> New Offering
        </button>
      </header>

      <div className="relative mb-4 bg-white rounded-2xl shadow-sm border border-transparent focus-within:border-slate-200 transition-all">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 shrink-0" />
        <input type="text" placeholder="Search registry..." className="w-full bg-transparent py-4 md:py-5 pl-12 pr-4 text-xs md:text-sm outline-none font-bold text-slate-700 placeholder-slate-400" onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="hidden md:block bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-w-0 w-full">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
              <th className="p-8">Subject Code</th>
              <th className="p-4">Course Info</th>
              <th className="p-4 text-center">Units</th>
              <th className="p-8 text-right pr-10">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-16 text-center opacity-30 italic text-xs uppercase font-black tracking-widest">No verified matching data rows found.</td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-emerald-50/10 transition-all group">
                  <td className="p-8">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <span className="w-fit bg-[#062D24] text-[#3D967C] px-3.5 py-1.5 rounded-xl text-[10px] font-black italic whitespace-nowrap select-none">{course.code}</span>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1 truncate">{course.department}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <h4 className="text-sm md:text-base font-bold text-slate-800 font-serif leading-snug break-words uppercase">{course.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 break-words">{course.description || "Core Requirement"}</p>
                  </td>
                  <td className="p-4 text-center text-xs md:text-sm font-black text-slate-600 whitespace-nowrap">{course.units}</td>
                  <td className="p-8 text-right pr-10 shrink-0">
                    <div className="flex justify-end gap-2.5">
                      <button onClick={() => handleUpsertCourse(course)} className="p-2 text-slate-400 hover:text-[#3D967C] transition-colors"><Edit3 size={16} /></button>
                      <button onClick={() => handleDelete(course.id, course.code)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-slate-50 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-w-0 w-full">
        {filteredCourses.length === 0 ? (
          <div className="py-12 text-center opacity-30 italic text-xs uppercase font-black tracking-widest">No records found.</div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} className="p-5 text-left flex flex-col gap-4 bg-[#FBFBFA] min-w-0 w-full">
              <div className="flex justify-between items-center gap-4 min-w-0">
                <span className="bg-[#062D24] text-[#3D967C] px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 select-none">
                  {course.code}
                </span>
                <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider truncate">
                  Units: {course.units}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-slate-800 text-sm break-words leading-tight uppercase font-serif">{course.title}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 break-words">{course.description || "Core Requirement"}</p>
                <div className="mt-2 text-[9px] font-black text-[#3D967C] bg-emerald-50/50 px-2 py-0.5 rounded w-fit uppercase">
                  Dept: {course.department}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100/70 shrink-0 w-full">
                <button onClick={() => handleUpsertCourse(course)} className="p-2.5 bg-slate-50 hover:bg-emerald-50 rounded-xl text-slate-400 hover:text-[#3D967C] transition-all flex items-center gap-1.5 text-[10px] font-black uppercase"><Edit3 size={14} /> Edit</button>
                <button onClick={() => handleDelete(course.id, course.code)} className="p-2.5 bg-slate-50 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase"><Trash2 size={14} /> Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}