/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Plus, Filter, Trash2, Edit3, 
  BookOpen, Loader2, Download, CheckCircle 
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminCourse() {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:8080/api/courses";

  // 1. FETCH DATA
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setCourses(res.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourses();
  }, []);

  // 2. CREATE NEW OFFERING
  const handleAddNewOffering = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<span class="text-2xl font-serif font-bold text-[#2D362F]">New Course Offering</span>',
      background: "#FFFFFF",
      padding: '2rem',
      width: '500px',
      showCancelButton: true,
      confirmButtonColor: '#062D24',
      confirmButtonText: 'Create Offering',
      customClass: {
        popup: 'rounded-[2.5rem] shadow-2xl',
        confirmButton: 'rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest text-[#3a947e]',
        cancelButton: 'rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400'
      },
      html: `
        <div class="flex flex-col gap-5 mt-6 text-left">
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase text-[#3a947e] ml-1 tracking-[0.2em]">Course Code</label>
            <input id="swal-code" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none outline-none text-sm font-bold text-gray-700" placeholder="e.g. CS 311">
          </div>
          <div class="space-y-1.5">
            <label class="text-[10px] font-black uppercase text-[#3a947e] ml-1 tracking-[0.2em]">Course Title</label>
            <input id="swal-title" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none outline-none text-sm font-bold text-gray-700" placeholder="e.g. Data Structures">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase text-[#3a947e] ml-1 tracking-[0.2em]">Dept</label>
              <input id="swal-dept" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none outline-none text-sm font-bold text-gray-700" placeholder="CS">
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-black uppercase text-[#3a947e] ml-1 tracking-[0.2em]">Units</label>
              <input id="swal-units" type="number" class="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none outline-none text-sm font-bold text-gray-700" value="3">
            </div>
          </div>
        </div>
      `,
      preConfirm: () => {
        const code = document.getElementById('swal-code').value;
        const title = document.getElementById('swal-title').value;
        if (!code || !title) return Swal.showValidationMessage('Code and Title are required');
        return { 
          code: code.toUpperCase(), 
          title, 
          department: document.getElementById('swal-dept').value, 
          units: parseInt(document.getElementById('swal-units').value) 
        };
      }
    });

    if (formValues) {
      try {
        await axios.post(API_URL, formValues);
        Swal.fire({ icon: 'success', title: 'Registered', background: '#F1F5F0', timer: 1500, showConfirmButton: false });
        fetchCourses();
      } catch (err) { Swal.fire("Error", "Duplicate code or server error.", "error"); }
    }
  };

  // 3. DELETE ACTION
  const handleDelete = async (id, code) => {
    const result = await Swal.fire({
      title: `Delete ${code}?`,
      text: "This will permanently remove the offering.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      background: "#F1F5F0"
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setCourses(courses.filter(c => c.id !== id));
        Swal.fire("Deleted", "Course removed.", "success");
      } catch (err) { Swal.fire("Error", "Could not delete.", "error"); }
    }
  };

const filteredCourses = courses.filter(c => 
    c.code?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F1F5F0] px-4 md:px-6 lg:px-10 py-6 animate-in fade-in duration-700">
      
      {/* Header */}
      <section className="mb-6 md:mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-4xl font-serif font-semibold text-[#2D362F]">Course Registry</h1>
          <p className="text-gray-500 text-[11px] md:text-sm mt-1">1st Semester · A.Y. 2025–2026</p>
        </div>
        <button onClick={handleAddNewOffering} className="hidden md:flex items-center gap-2 bg-[#062D24] text-[#3a947e] px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
          <Plus size={16} /> New Offering
        </button>
      </section>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search Registry..."
            className="w-full bg-white border-none shadow-sm rounded-2xl py-3.5 pl-12 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase text-gray-500 shadow-sm border border-transparent hover:border-teal-100 transition-all">
          <Filter size={16} /> Filter
        </button>
      </div>

      {/* MOBILE CARD VIEW */}
      <section className="md:hidden space-y-4 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
        {loading ? <Loader2 className="animate-spin text-teal-600 mx-auto" /> : filteredCourses.map(course => (
          <div key={course.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg italic tracking-widest">{course.code}</span>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${course.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {course.isActive ? 'Active' : 'Draft'}
              </span>
            </div>
            <h4 className="text-lg font-bold text-[#2D362F] font-serif leading-tight">{course.title}</h4>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50">
              <span className="text-[10px] font-black text-gray-400 uppercase">{course.units} Units</span>
              <div className="flex gap-2">
                <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl"><Edit3 size={16}/></button>
                <button onClick={() => handleDelete(course.id, course.code)} className="p-2.5 bg-red-50 text-red-400 rounded-xl"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
        <button onClick={handleAddNewOffering} className="w-full py-5 bg-[#062D24] text-[#3a947e] rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
          <Plus size={16} /> Add New Course
        </button>
      </section>

      {/* DESKTOP TABLE VIEW */}
      <section className="hidden md:block overflow-hidden bg-white rounded-[2.5rem] border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left min-w-[850px]">
            <thead>
              <tr className="bg-[#FBFBFA] border-b border-gray-50">
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Code</th>
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Title</th>
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black text-center">Units</th>
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black">Status</th>
                <th className="p-6 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black text-right pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center font-black uppercase tracking-widest text-slate-300">Loading Registry...</td></tr>
              ) : filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-teal-50/20 transition-all">
                  <td className="p-6">
                    <span className="bg-[#062D24] text-[#3a947e] px-4 py-2 rounded-xl text-[11px] font-black italic border border-teal-900/20">{course.code}</span>
                  </td>
                  <td className="p-6">
                    <h4 className="text-sm font-bold text-[#2D362F] font-serif">{course.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mt-1">{course.department || "General"}</p>
                  </td>
                  <td className="p-6 text-center text-sm font-black text-slate-600">{course.units}</td>
                  <td className="p-6">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${course.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {course.isActive ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-6 text-right pr-10">
                    <div className="flex justify-end gap-3 transition-all">
                      <button className="p-2.5 text-gray-400 hover:text-teal-600 bg-white border border-gray-100 rounded-xl shadow-sm"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete(course.id, course.code)} className="p-2.5 text-gray-400 hover:text-red-500 bg-white border border-gray-100 rounded-xl shadow-sm"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}