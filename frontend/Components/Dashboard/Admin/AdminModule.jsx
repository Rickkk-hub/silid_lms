/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { FileText, Plus, Search, Trash2, ExternalLink, BookOpen, Layers, User, Hash } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import DashboardModal from "../../Layout/HomeLayout/DashboardModal";

const api = axios.create({ baseURL: "http://localhost:8080/api", withCredentials: true });

export default function AdminModule() {
  const [modules, setModules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isReady, setIsReady] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    fileUrl: "",
    description: "",
    section: "",
    teacherId: ""
  });

  const fetchData = useCallback(async (isMounted) => {
    try {
      const [modRes, teaRes] = await Promise.all([
        api.get("/modules"),
        api.get("/teachers")
      ]);
      if (isMounted) {
        setModules(modRes.data || []);
        setTeachers(teaRes.data || []);
        setTimeout(() => setIsReady(true), 50);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/modules/upload", formData);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Module Uploaded",
          text: response.data.message,
          confirmButtonColor: "#3D967C"
        });
        setShowModal(false);
        setFormData({ title: "", fileUrl: "", description: "", section: "", teacherId: "" });
        setIsReady(false);
        await fetchData(true); 
      }
    } catch (err) {
      console.error("Upload error:", err);
      Swal.fire("Error", "Could not upload module", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = modules.filter(m => 
    m.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.section?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className={`w-full space-y-6 md:space-y-8 pt-4 md:pt-6 text-left transition-all duration-500 ease-out ${
        isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}>
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b border-emerald-900/5 pb-6 sm:pb-4 min-w-0 w-full">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 flex items-center gap-2.5 truncate">
              <BookOpen className="text-[#3D967C] shrink-0" size={26} /> Learning Modules
            </h1>
            <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 truncate">Upload and organize academic resources</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto bg-[#062D24] text-[#3D967C] px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 shrink-0 active:scale-95 transition-all"
          >
            <Plus size={16} /> Add New Module
          </button>
        </header>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full min-w-0">
          <div className="bg-white p-4 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-0 w-full sm:max-w-[240px] text-left shrink-0">
              <div className="p-2.5 bg-[#F1F5F0] rounded-xl text-[#3D967C] shrink-0 select-none"><Layers size={18}/></div>
              <div className="min-w-0">
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest truncate">Total Modules</p>
                  <p className="text-lg md:text-xl font-bold text-slate-800 mt-0.5 truncate">{modules.length}</p>
              </div>
          </div>
          
          <div className="relative flex-1 bg-white rounded-xl md:rounded-2xl shadow-sm border border-transparent focus-within:border-slate-200/60 transition-all min-w-0 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 shrink-0" />
              <input 
                  type="text" 
                  placeholder="Search by title or section..."
                  className="w-full bg-transparent py-3 md:py-3.5 pl-11 pr-4 text-xs md:text-sm font-bold outline-none text-slate-700 placeholder-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
        </div>

        <div className="hidden md:block bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-w-0 w-full">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F1F7F5] text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
              <tr>
                <th className="px-8 py-5">Resource Info</th>
                <th className="px-6 py-5">Assigned Section</th>
                <th className="px-6 py-5">Uploaded By</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-8 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredModules.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center opacity-30 italic text-xs uppercase font-black tracking-widest">No active modules found.</td>
                </tr>
              ) : (
                filteredModules.map((mod) => (
                  <tr key={mod.id} className="hover:bg-emerald-50/10 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4 min-w-0">
                          <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl shrink-0 select-none"><FileText size={18}/></div>
                          <div className="min-w-0">
                              <div className="font-bold text-slate-700 text-sm group-hover:text-emerald-700 transition-colors break-words leading-tight">{mod.title}</div>
                              <a href={mod.fileUrl} target="_blank" rel="noreferrer" className="w-fit text-[9px] md:text-[10px] text-blue-500 flex items-center gap-1 hover:underline font-bold uppercase mt-1">
                                  <ExternalLink size={10}/> View Resource
                              </a>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="bg-emerald-50 text-[#3D967C] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-emerald-100 whitespace-nowrap">
                          {mod.section}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">
                      {mod.teacher?.fullname || "Admin"}
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-slate-400 whitespace-nowrap">
                      {mod.uploadedAt ? new Date(mod.uploadedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-8 py-5 text-center shrink-0">
                      <div className="flex justify-center">
                        <button type="button" className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
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
          {filteredModules.length === 0 ? (
            <div className="py-12 text-center opacity-30 italic text-xs uppercase font-black tracking-widest">No matching modules registered.</div>
          ) : (
            filteredModules.map((mod) => (
              <div key={mod.id} className="p-5 text-left flex flex-col gap-4 bg-[#FBFBFA] min-w-0 w-full">
                <div className="flex justify-between items-start gap-4 min-w-0">
                  <div className="min-w-0 flex-1 flex gap-3">
                    <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl h-fit shrink-0"><FileText size={18}/></div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm break-words leading-tight">{mod.title}</h4>
                      <a href={mod.fileUrl} target="_blank" rel="noreferrer" className="w-fit text-[10px] text-blue-500 flex items-center gap-1 hover:underline font-bold uppercase mt-1.5">
                        <ExternalLink size={10}/> View Resource
                      </a>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-[#3D967C] px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border border-emerald-100 shrink-0 select-none">
                    {mod.section}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 bg-white border border-slate-50 p-3 rounded-xl min-w-0 w-full">
                  <div className="truncate text-slate-400">BY: <span className="text-slate-700 font-bold uppercase">{mod.teacher?.fullname || "Admin"}</span></div>
                  <div className="truncate text-right text-slate-400">{mod.uploadedAt ? new Date(mod.uploadedAt).toLocaleDateString() : "—"}</div>
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-100/70 shrink-0 w-full">
                  <button type="button" className="p-2 bg-slate-50 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all flex items-center gap-1.5 text-[10px] font-black uppercase"><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <DashboardModal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Resource">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8 text-left">
          <div className="sm:col-span-2 space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Module Title</label>
            <input
              required
              placeholder="e.g. Introduction to React"
              className="w-full bg-[#F1F5F0] border-none rounded-xl px-4 py-3.5 text-xs md:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]/20 text-slate-700 placeholder-slate-400"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">File URL / Link</label>
            <div className="relative">
              <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 shrink-0" size={14} />
              <input
                required
                placeholder="https://google-drive.com/your-file"
                className="w-full bg-[#F1F5F0] border-none rounded-xl pl-11 pr-4 py-3.5 text-xs md:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]/20 text-slate-700"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5 flex items-center gap-1">
              <Hash size={12} className="shrink-0" /> Target Section
            </label>
            <input
              required
              placeholder="e.g. BSIT-3A"
              className="w-full bg-[#F1F5F0] border-none rounded-xl p-4 text-xs md:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]/20 text-slate-700 placeholder-slate-400 uppercase"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5 flex items-center gap-1">
              <User size={12} className="shrink-0" /> Instructor
            </label>
            <select
              required
              className="w-full bg-[#F1F5F0] border-none rounded-xl p-4 text-xs md:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]/20 text-slate-700 cursor-pointer appearance-none"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
            >
              <option value="">Select Teacher...</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.fullname}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2 space-y-1.5 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Description (Optional)</label>
            <textarea
              rows="3"
              placeholder="Additional instructions for students..."
              className="w-full bg-[#F1F5F0] border-none rounded-xl px-4 py-3.5 text-xs md:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]/20 text-slate-700 placeholder-slate-400 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="sm:col-span-2 pt-4 mt-2 shrink-0">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#062D24] text-[#3D967C] py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 disabled:opacity-40 transition-all"
            >
              {loading ? "Uploading..." : "Save Module"}
            </button>
          </div>
        </form>
      </DashboardModal>
    </>
  );
}