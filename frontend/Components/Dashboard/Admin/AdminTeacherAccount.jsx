/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, Trash2, Lock, ShieldCheck, Mail, Building, Phone, Edit3 } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import DashboardModal from "../../Layout/HomeLayout/DashboardModal";

export default function AdminTeacherAccount() {
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    department: "",
    phone_number: "",
    address: "",
  });

  const fetchTeachers = useCallback(async (isMounted) => {
    try {
      const res = await axios.get("http://localhost:8080/api/teachers");
      if (isMounted) {
        setTeachers(res.data || []);
        setTimeout(() => setIsReady(true), 50);
      }
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    setTimeout(() => {
      if (isMounted) {
        fetchTeachers(isMounted);
      }
    }, 0);
    return () => { isMounted = false; };
  }, [fetchTeachers]);

  const handleOpenRegister = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({ fullname: "", email: "", password: "", department: "", phone_number: "", address: "" });
    setConfirmPassword("");
    setShowModal(true);
  };

  const handleOpenEdit = (teacher) => {
    setIsEdit(true);
    setEditId(teacher.id);
    setFormData({
      fullname: teacher.fullname || "",
      email: teacher.email || "",
      password: "", 
      department: teacher.department || "",
      phone_number: teacher.phone_number || "",
      address: teacher.address || "",
    });
    setConfirmPassword("");
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `Purge Account?`,
      text: `This will permanently delete ${name} and their master credentials from the registry.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, Purge Record',
      background: "#FFFFFF",
      customClass: { popup: 'rounded-[2.5rem]' }
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`http://localhost:8080/api/teachers/${id}`);
        if (response.data.success) {
          Swal.fire({ icon: 'success', title: 'Purged!', text: response.data.message, timer: 1500, showConfirmButton: false });
          setIsReady(false);
          fetchTeachers(true);
        }
      } catch (err) {
        console.error("Delete failed:", err);
        Swal.fire("Error", err.response?.data?.message || "Could not complete purge action.", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password || confirmPassword) {
      if (formData.password !== confirmPassword) {
        return Swal.fire("Error", "Passwords do not match!", "error");
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        confirmPassword: confirmPassword 
      };

      const url = isEdit 
        ? `http://localhost:8080/api/teachers/update/${editId}`
        : "http://localhost:8080/api/teachers/register";

      const response = isEdit 
        ? await axios.put(url, payload)
        : await axios.post(url, payload);

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: isEdit ? 'Account Updated' : 'Account Created',
          text: response.data.message,
          background: "#F1F5F0",
          confirmButtonColor: "#3D967C"
        });
        
        setShowModal(false);
        setFormData({ fullname: "", email: "", password: "", department: "", phone_number: "", address: "" });
        setConfirmPassword("");
        setIsReady(false);
        fetchTeachers(true); 
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Operation failed. Check server connection.";
      Swal.fire("Error", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`w-full space-y-6 md:space-y-8 pt-4 md:pt-6 text-left transition-all duration-500 ease-out ${
        isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}>
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b border-emerald-900/5 pb-6 sm:pb-4 min-w-0 w-full">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 truncate">Teacher Management</h1>
            <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">Manage faculty credentials and department assignments</p>
          </div>
          <button 
            onClick={handleOpenRegister}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#062D24] text-[#3D967C] px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all shrink-0"
          >
            <UserPlus size={16} /> Add New Teacher
          </button>
        </header>

        <div className="hidden md:block bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-w-0 w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F1F7F5] text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="px-8 py-5">Faculty Member</th>
                <th className="px-6 py-5">Department</th>
                <th className="px-6 py-5">Contact Number</th>
                <th className="px-8 py-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-16 text-center opacity-30 italic text-xs uppercase font-black tracking-widest">No active faculty records registered.</td>
                </tr>
              ) : (
                teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-emerald-50/10 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-700 text-sm group-hover:text-emerald-700 transition-colors capitalize leading-tight">{t.fullname}</div>
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5 flex items-center gap-1"><Mail size={12} className="text-[#3D967C]" /> {t.email}</div>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-600">
                      <span className="bg-emerald-50 text-[#3D967C] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-emerald-100 whitespace-nowrap">
                        {t.department || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-[#3D967C]" />
                        {t.phone_number || "—"}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center shrink-0">
                      <div className="flex justify-center gap-2">
                        <button type="button" onClick={() => handleOpenEdit(t)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Edit Profile">
                          <Edit3 size={16} />
                        </button>
                        <button type="button" onClick={() => handleDelete(t.id, t.fullname)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Delete Teacher">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-50 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-w-0 w-full">
          {teachers.length === 0 ? (
            <div className="py-12 text-center opacity-30 italic text-xs uppercase font-black tracking-widest">No faculty logs registered.</div>
          ) : (
            teachers.map((t) => (
              <div key={t.id} className="p-5 text-left flex flex-col gap-4 bg-[#FBFBFA] min-w-0 w-full">
                <div className="flex justify-between items-start gap-4 min-w-0">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-800 capitalize text-sm break-words leading-tight">{t.fullname}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 truncate flex items-center gap-1"><Mail size={12} className="text-[#3D967C]" /> {t.email}</p>
                  </div>
                  <span className="bg-emerald-50 text-[#3D967C] px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border border-emerald-100 shrink-0 select-none">
                    {t.department || "General"}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-slate-500 bg-white border border-slate-50 p-3 rounded-xl flex items-center gap-2 truncate">
                  <Phone size={13} className="text-[#3D967C]" />
                  <span>Contact: {t.phone_number || "—"}</span>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100/70 shrink-0 w-full">
                  <button type="button" onClick={() => handleOpenEdit(t)} className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-500 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase"><Edit3 size={14} /> Edit</button>
                  <button type="button" onClick={() => handleDelete(t.id, t.fullname)} className="p-2 bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase"><Trash2 size={14} /> Purge</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <DashboardModal isOpen={showModal} onClose={() => setShowModal(false)} title={isEdit ? "Update Faculty Profile" : "Faculty Registration"}>
        <form onSubmit={handleSubmit} className="space-y-4 pb-8 text-left w-full block">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Full Name</label>
              <input required className="w-full bg-[#F1F5F0] border-none rounded-xl px-4 py-3 text-xs md:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]/20 text-slate-700 placeholder-slate-400" 
                value={formData.fullname} placeholder="e.g., Prof. John Doe" onChange={e => setFormData({...formData, fullname: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Email Address</label>
              <input required type="email" className="w-full bg-[#F1F5F0] border-none rounded-xl px-4 py-3 text-xs md:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]/20 text-slate-700 placeholder-slate-400" 
                value={formData.email} placeholder="username@school.edu" onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Department</label>
              <input required className="w-full bg-[#F1F5F0] border-none rounded-xl px-4 py-3 text-xs md:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]/20 text-slate-700 placeholder-slate-400 uppercase" 
                value={formData.department} placeholder="e.g., CCS" onChange={e => setFormData({...formData, department: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Phone Number</label>
              <input required type="text" className="w-full bg-[#F1F5F0] border-none rounded-xl px-4 py-3 text-xs md:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]/20 text-slate-700 placeholder-slate-400" 
                value={formData.phone_number} placeholder="09XXXXXXXXX" onChange={e => setFormData({...formData, phone_number: e.target.value})} />
            </div>
          </div>

          <div className="w-full space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Home Address</label>
            <input required className="w-full bg-[#F1F5F0] border-none rounded-xl px-4 py-3 text-xs md:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]/20 text-slate-700 placeholder-slate-400" 
              value={formData.address} placeholder="Street, City, Province" onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 shrink-0" size={14} />
                <input required={!isEdit} type="password" placeholder={isEdit ? "New Password" : "••••••••"} className="w-full bg-[#F1F5F0] border-none rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]/20 text-slate-700" 
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Confirm Password</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 shrink-0" size={14} />
                <input required={!isEdit || formData.password.length > 0} type="password" placeholder={isEdit ? "Confirm Password" : "••••••••"} className="w-full bg-[#F1F5F0] border-none rounded-xl pl-10 pr-4 py-3 text-xs md:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]/20 text-slate-700" 
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="w-full pt-4 mt-2 shrink-0">
            <button type="submit" disabled={loading} className="w-full bg-[#062D24] text-[#3D967C] py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 disabled:opacity-40 transition-all">
              {loading ? "Processing..." : isEdit ? "Update Faculty Info" : "Create Teacher Account"}
            </button>
          </div>
        </form>
      </DashboardModal>
    </>
  );
}