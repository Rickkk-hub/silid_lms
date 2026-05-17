/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  UserPlus, GraduationCap, Loader2, CheckCircle, 
  X, Trash2, MapPin, Clock, Edit3, Search, LayoutGrid, Users
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import DashboardModal from "../../Layout/HomeLayout/DashboardModal";

const api = axios.create({ baseURL: "http://localhost:8080/api", withCredentials: true });

export default function AdminEnrollment() {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  
  const [activeTab, setActiveTab] = useState("catalog"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({ 
    courseId: "", teacherId: "", section: "", 
    semester: "1st Semester", schoolYear: "2025-2026", 
    department: "CCS", schedule: "", room: "" 
  });

  const fetchData = useCallback(async (isMounted) => {
    try {
      setTableLoading(true);
      const [enRes, coRes, teRes] = await Promise.all([
        api.get("/enrollments"), 
        api.get("/courses"), 
        api.get("/teachers")
      ]);
      if (isMounted) {
        setEnrollments(enRes.data || []);
        setCourses(coRes.data || []);
        setTeachers(teRes.data || []);
        setTimeout(() => setIsReady(true), 50);
      }
    } catch (err) { 
      console.error("Fetch Error:", err); 
    } finally { 
      if (isMounted) setTableLoading(false); 
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    setTimeout(() => {
      if (isMounted) {
        fetchData(isMounted);
      }
    }, 0);

    return () => { isMounted = false; };
  }, [fetchData]);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(en => {
      const matchesTab = activeTab === "catalog" 
        ? (en.status === "OPEN" || en.status === "PENDING")
        : en.status === "ACTIVE";

      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        en.student?.fullname?.toLowerCase().includes(query) ||
        en.course?.code?.toLowerCase().includes(query) ||
        en.course?.title?.toLowerCase().includes(query) ||
        en.section?.toLowerCase().includes(query);

      return matchesTab && matchesSearch;
    });
  }, [enrollments, activeTab, searchQuery]);

  const handleOpenCreate = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({ 
      courseId: "", teacherId: "", section: "", 
      semester: "1st Semester", schoolYear: "2025-2026", 
      department: "CCS", schedule: "", room: "" 
    });
    setShowModal(true);
  };

  const handleApprove = async (id) => {
    try {
      const res = await api.put(`/enrollments/approve/${id}`);
      if (res.data.success) {
        Swal.fire({ icon: 'success', title: 'Approved', text: res.data.message, confirmButtonColor: '#3D967C' });
        setIsReady(false);
        fetchData(true);
      }
    } catch (err) { Swal.fire("Error", "Approval failed", "error"); }
  };

  const handleDecline = async (id) => {
    const result = await Swal.fire({
      title: 'Decline Application?',
      text: "Remove student and re-open this section?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      confirmButtonText: 'Yes, Decline'
    });
    if (result.isConfirmed) {
      try {
        const res = await api.put(`/enrollments/decline/${id}`);
        if (res.data.success) {
          Swal.fire('Declined', res.data.message, 'success');
          setIsReady(false);
          fetchData(true);
        }
      } catch (err) { Swal.fire("Error", "Decline failed", "error"); }
    }
  };

  const handleEdit = (en) => {
    setIsEdit(true);
    setEditId(en.id);
    setFormData({
      courseId: en.course?.id || "",
      teacherId: en.teacher?.teacher_id || en.teacher?.id || "",
      section: en.section || "",
      semester: en.semester || "1st Semester",
      schoolYear: en.schoolYear || "2025-2026",
      department: en.department || "CCS",
      schedule: en.schedule || "",
      room: en.room || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Offering?',
      text: "Permanent removal from registry.",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      background: "#FFFFFF",
      customClass: { popup: 'rounded-[2.5rem]' }
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/enrollments/delete/${id}`);
        
        if (res.data.success) {
          Swal.fire('Deleted!', res.data.message, 'success');
          setIsReady(false);
          fetchData(true);
        } else {
          Swal.fire("Action Denied", res.data.message, "warning");
        }
      } catch (err) { 
        console.error("Delete failed:", err);
        
        const backendValidationMessage = err.response?.data?.message || "Delete failed: Section has active data constraints.";
        
        Swal.fire({
          icon: 'error',
          title: 'Operation Blocked',
          text: backendValidationMessage,
          confirmButtonColor: '#062D24',
          customClass: { popup: 'rounded-[2rem]' }
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, teacherId: parseInt(formData.teacherId), courseId: parseInt(formData.courseId) };
      const url = isEdit ? `/enrollments/update/${editId}` : "/enrollments/create-section";
      const res = isEdit ? await api.put(url, payload) : await api.post(url, payload);
      if (res.data.success) {
        Swal.fire({ icon: 'success', title: 'Success', text: res.data.message });
        setShowModal(false);
        setIsReady(false);
        fetchData(true);
      }
    } catch (err) { 
      Swal.fire("Error", "Submission failed", "error"); 
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className={`w-full space-y-6 md:space-y-8 pt-4 md:pt-6 text-left transition-all duration-500 ease-out ${
        isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}>
        
        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 min-w-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 min-w-0 w-full">
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 flex items-center gap-2.5 truncate">
                <GraduationCap className="text-[#3D967C] shrink-0" size={28} /> Enrollment Registry
              </h1>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">Registry Management</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 flex-grow max-w-2xl justify-end min-w-0 w-full">
              <div className="relative w-full max-w-md min-w-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 shrink-0" size={16} />
                <input 
                  type="text" 
                  placeholder="Search student, code, or subject..."
                  className="w-full pl-12 pr-4 py-3.5 bg-[#F1F5F0] border-none rounded-xl md:rounded-2xl text-[11px] font-bold focus:ring-2 ring-[#3D967C]/20 transition-all outline-none text-slate-700 placeholder-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button 
                type="button"
                onClick={handleOpenCreate} 
                className="w-full sm:w-auto whitespace-nowrap bg-[#062D24] text-[#3D967C] px-6 py-3.5 rounded-xl md:rounded-2xl shadow-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-all"
              >
                <UserPlus size={16}/> New Offering
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6 p-1.5 bg-[#F1F5F0] w-full sm:w-fit rounded-xl md:rounded-2xl min-w-0">
            <button 
              type="button"
              onClick={() => setActiveTab("catalog")}
              className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "catalog" ? "bg-white text-[#3D967C] shadow-sm" : "text-gray-400 hover:text-slate-500"}`}
            >
              <LayoutGrid size={14} className="shrink-0" /> Course Catalog
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab("enrolled")}
              className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === "enrolled" ? "bg-white text-[#3D967C] shadow-sm" : "text-gray-400 hover:text-slate-500"}`}
            >
              <Users size={14} className="shrink-0" /> Enrolled Students
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100 min-w-0 w-full relative">
          {tableLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center">
              <Loader2 className="animate-spin text-[#3D967C]" size={24} />
            </div>
          )}

          <div className="hidden lg:block overflow-x-auto w-full min-w-0">
            <table className="w-full text-left">
              <thead className="bg-[#F1F5F0] text-gray-400 text-[10px] uppercase tracking-widest font-black border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5">Registry Details</th>
                  <th className="px-8 py-5">{activeTab === "catalog" ? "Instructor" : "Student Name"}</th>
                  <th className="px-8 py-5">Schedule</th>
                  <th className="px-8 py-5 text-center">Status & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-16 text-center text-slate-300 italic text-xs uppercase font-black tracking-widest">No registry records found</td>
                  </tr>
                ) : (
                  filteredEnrollments.map(en => (
                    <tr key={en.id} className="hover:bg-emerald-50/10 transition-colors group">
                      <td className="px-8 py-6">
                          <div className="font-bold text-gray-800 uppercase text-xs">{en.course?.title}</div>
                          <div className="text-[10px] text-[#3D967C] font-black uppercase mt-0.5">{en.course?.code} • Section {en.section}</div>
                      </td>
                      <td className="px-8 py-6 uppercase font-bold text-xs text-slate-600">
                          {activeTab === "catalog" 
                            ? (en.teacher?.fullname || <span className="italic opacity-30 tracking-widest">-- TBD --</span>)
                            : (
                              <div className="flex flex-col min-w-0">
                                <span className="truncate">{en.student?.fullname}</span>
                                <span className="text-[8px] font-black opacity-40 mt-0.5">ID: {en.student?.id}</span>
                              </div>
                            )
                          }
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col gap-1 text-[10px] font-bold text-gray-400 uppercase">
                            <div className="flex items-center gap-2 whitespace-nowrap"><Clock size={12} className="text-[#3D967C] shrink-0"/> {en.schedule}</div>
                            <div className="flex items-center gap-2 truncate"><MapPin size={12} className="text-[#3D967C] shrink-0"/> {en.room}</div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center gap-2 min-w-0">
                          <span className={`px-3.5 py-1 rounded-xl text-[9px] font-black uppercase border whitespace-nowrap shrink-0 ${en.status === 'ACTIVE' ? 'bg-emerald-50 text-[#3D967C] border-emerald-100' : en.status === 'PENDING' ? 'bg-orange-50 text-orange-500 border-orange-100 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                            {en.status}
                          </span>
                          <div className="flex justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {en.status === 'PENDING' && (
                              <>
                                <button type="button" onClick={() => handleApprove(en.id)} className="text-[#3D967C] p-1.5 hover:bg-emerald-50 rounded-lg" title="Approve"><CheckCircle size={16} /></button>
                                <button type="button" onClick={() => handleDecline(en.id)} className="text-rose-500 p-1.5 hover:bg-rose-50 rounded-lg" title="Decline"><X size={16} className="stroke-[3px]"/></button>
                              </>
                            )}
                            {en.status !== 'ACTIVE' && (
                              <button type="button" onClick={() => handleEdit(en)} className="text-blue-500 p-1.5 hover:bg-blue-50 rounded-lg" title="Edit"><Edit3 size={16} /></button>
                            )}
                            <button type="button" onClick={() => handleDelete(en.id)} className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg" title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden divide-y divide-slate-50 min-w-0 w-full">
            {filteredEnrollments.length === 0 ? (
              <div className="py-12 text-center text-slate-300 italic text-xs uppercase font-black tracking-widest">No matching registry rows.</div>
            ) : (
              filteredEnrollments.map(en => (
                <div key={en.id} className="p-5 text-left flex flex-col gap-4 bg-[#FBFBFA] min-w-0 w-full">
                  <div className="flex justify-between items-start gap-4 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 text-sm break-words leading-tight uppercase font-serif">{en.course?.title}</h4>
                      <p className="text-[10px] text-[#3D967C] font-black uppercase tracking-wider mt-1">{en.course?.code} • Section {en.section}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border shrink-0 ${en.status === 'ACTIVE' ? 'bg-emerald-50 text-[#3D967C] border-emerald-100' : en.status === 'PENDING' ? 'bg-orange-50 text-orange-500 border-orange-100 animate-pulse' : 'bg-slate-50 text-slate-400'}`}>
                      {en.status}
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-slate-600 bg-white border border-slate-50/70 p-3 rounded-xl space-y-1.5 min-w-0 w-full">
                    <div className="text-slate-700 uppercase break-words">
                      <span className="text-[9px] font-black tracking-wider text-slate-400 block mb-0.5">{activeTab === "catalog" ? "INSTRUCTOR" : "STUDENT NAME"}</span>
                      {activeTab === "catalog" 
                        ? (en.teacher?.fullname || <span className="italic opacity-30 tracking-widest lowercase first-letter:uppercase">Unassigned</span>)
                        : `${en.student?.fullname} (ID: ${en.student?.id})`
                      }
                    </div>
                    <div className="pt-2 border-t border-slate-50 flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 uppercase text-[10px]">
                      <span className="flex items-center gap-1 shrink-0"><Clock size={12} className="text-[#3D967C]" /> {en.schedule}</span>
                      <span className="flex items-center gap-1 truncate"><MapPin size={12} className="text-[#3D967C]" /> {en.room}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1.5 border-t border-slate-100 shrink-0 w-full">
                    {en.status === 'PENDING' && (
                      <>
                        <button type="button" onClick={() => handleApprove(en.id)} className="p-2 bg-emerald-50 rounded-xl text-[#3D967C] font-black text-[9px] uppercase tracking-wider flex items-center gap-1"><CheckCircle size={14} /> Approve</button>
                        <button type="button" onClick={() => handleDecline(en.id)} className="p-2 bg-rose-50 rounded-xl text-rose-500 font-black text-[9px] uppercase tracking-wider flex items-center gap-1"><X size={14} /> Decline</button>
                      </>
                    )}
                    {en.status !== 'ACTIVE' && (
                      <button type="button" onClick={() => handleEdit(en)} className="p-2 bg-blue-50 rounded-xl text-blue-500 font-black text-[9px] uppercase tracking-wider flex items-center gap-1"><Edit3 size={14} /> Edit Sched</button>
                    )}
                    <button type="button" onClick={() => handleDelete(en.id)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 font-black text-[9px] uppercase tracking-wider flex items-center gap-1"><Trash2 size={14} /> Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <DashboardModal isOpen={showModal} onClose={() => setShowModal(false)} title={isEdit ? "Update Enrollment Record" : "New Section Offering"}>
        <form onSubmit={handleSubmit} className="space-y-4 pb-8 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0 w-full">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Course Subject</label>
              <select required className="w-full bg-[#F1F5F0] border-none rounded-xl p-4 text-xs md:text-sm font-bold outline-none text-slate-700 cursor-pointer appearance-none" value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})}>
                <option value="">-- Choose Subject --</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
              </select>
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Assigned Teacher</label>
              <select required className="w-full bg-[#F1F5F0] border-none rounded-xl p-4 text-xs md:text-sm font-bold outline-none text-slate-700 cursor-pointer appearance-none" value={formData.teacherId} onChange={(e) => setFormData({...formData, teacherId: e.target.value})}>
                <option value="">-- Choose Instructor --</option>
                {teachers.map(t => <option key={t.teacher_id || t.id} value={t.teacher_id || t.id}>{t.fullname}</option>)}
              </select>
            </div>
          </div>
          
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Class Section</label>
            <input required placeholder="e.g. SBIS-2A" className="w-full bg-[#F1F5F0] border-none rounded-xl p-4 text-xs md:text-sm font-bold outline-none text-slate-700 placeholder-slate-400 uppercase" value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0 w-full">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Day & Time Sched</label>
              <input required placeholder="e.g. MW 9:00AM - 10:30AM" className="w-full bg-[#F1F5F0] border-none rounded-xl p-4 text-xs md:text-sm font-bold shadow-sm outline-none text-slate-700 placeholder-slate-400" value={formData.schedule} onChange={(e) => setFormData({...formData, schedule: e.target.value})} />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Room Assignment</label>
              <input required placeholder="e.g. Lab 3 / TBA" className="w-full bg-[#F1F5F0] border-none rounded-xl p-4 text-xs md:text-sm font-bold shadow-sm outline-none text-slate-700 placeholder-slate-400 uppercase" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} />
            </div>
          </div>

          <div className="pt-4 mt-2 shrink-0">
            <button type="submit" disabled={loading} className="w-full bg-[#062D24] text-[#3D967C] py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 disabled:opacity-40 transition-all">
              {loading ? "Processing..." : isEdit ? "Update Registry" : "Initialize Section"}
            </button>
          </div>
        </form>
      </DashboardModal>
    </>
  );
}