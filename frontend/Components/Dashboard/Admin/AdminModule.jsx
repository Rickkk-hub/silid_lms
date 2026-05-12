import React, { useState, useEffect } from "react";
import { FileText, Plus, Search, Trash2, ExternalLink, BookOpen, Layers, User, Hash } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AdminModule() {
  const [modules, setModules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    fileUrl: "",
    description: "",
    section: "",
    teacherId: ""
  });

  // FIX: Declared fetchData BEFORE useEffect to avoid hoisting errors
  const fetchData = async () => {
    try {
      const [modRes, teaRes] = await Promise.all([
        axios.get("http://localhost:8080/api/modules"),
        axios.get("http://localhost:8080/api/teachers")
      ]);
      setModules(modRes.data);
      setTeachers(teaRes.data);
    } catch (err) {
      // FIX: Used 'err' to satisfy ESLint and SonarQube
      console.error("Failed to fetch dashboard data:", err);
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Could not reach the server. Please check the backend.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  useEffect(() => {
    // FIX: Calling the async function within a local async wrapper
    const loadInitialData = async () => {
      await fetchData();
    };
    loadInitialData();
  }, []); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/api/modules/upload", formData);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Module Uploaded",
          text: response.data.message,
          confirmButtonColor: "#3D967C"
        });
        setShowModal(false);
        setFormData({ title: "", fileUrl: "", description: "", section: "", teacherId: "" });
        await fetchData(); // Refresh list after upload
      }
    } catch (err) {
      console.error("Upload error:", err);
      Swal.fire("Error", "Could not upload module", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = modules.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#F8FAF7] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-[#3D967C]" />
            Learning Modules
          </h1>
          <p className="text-sm text-gray-500">Upload and organize academic resources</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[#3D967C] hover:bg-[#2d7362] text-white px-6 py-3 rounded-2xl transition-all shadow-lg shadow-[#3D967C]/20 active:scale-95 font-semibold"
        >
          <Plus size={20} />
          Add New Module
        </button>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-[#F1F5F0] rounded-2xl text-[#3D967C]"><Layers size={24}/></div>
            <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Total Modules</p>
                <p className="text-xl font-bold text-gray-800">{modules.length}</p>
            </div>
        </div>
        <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input 
                type="text" 
                placeholder="Search by title or section..."
                className="w-full h-full bg-white border-none rounded-3xl pl-12 pr-4 shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C] text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F1F5F0] text-gray-500 text-[10px] uppercase tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4">Resource Info</th>
                <th className="px-6 py-4">Assigned Section</th>
                <th className="px-6 py-4">Uploaded By</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredModules.map((mod) => (
                <tr key={mod.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 text-orange-500 rounded-xl"><FileText size={18}/></div>
                        <div>
                            <div className="font-bold text-gray-800">{mod.title}</div>
                            <a href={mod.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 flex items-center gap-1 hover:underline">
                                <ExternalLink size={10}/> View Resource
                            </a>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-[#F1F5F0] text-[#3D967C] rounded-lg text-[10px] font-bold uppercase tracking-tight">
                        {mod.section}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {mod.teacher?.fullname || "Admin"}
                  </td>
                  <td className="px-6 py-4 text-[11px] text-gray-400">
                    {new Date(mod.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#F1F5F0] w-full max-w-xl rounded-[2.5rem] shadow-2xl p-6 md:p-10 border border-white my-auto animate-in zoom-in duration-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Add New Resource</h2>
              <p className="text-sm text-gray-500">Provide the material details for the students</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Module Title</label>
                <input
                  required
                  placeholder="e.g. Introduction to React"
                  className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">File URL / Link</label>
                <div className="relative">
                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input
                    required
                    placeholder="https://google-drive.com/your-file"
                    className="w-full bg-white border-none rounded-2xl pl-12 pr-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <Hash size={12}/> Target Section
                    </label>
                    <input
                    required
                    placeholder="e.g. BSIT-3A"
                    className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <User size={12}/> Instructor
                    </label>
                    <select
                    required
                    className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]"
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                    >
                        <option value="">Select Teacher...</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.fullname}</option>)}
                    </select>
                  </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Additional instructions for students..."
                  className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C] resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200/50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#3D967C] hover:bg-[#2d7362] text-white px-10 py-3 rounded-2xl font-bold shadow-xl shadow-[#3D967C]/20 active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Uploading..." : "Save Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}