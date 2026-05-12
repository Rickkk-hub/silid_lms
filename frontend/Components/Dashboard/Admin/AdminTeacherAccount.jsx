import React, { useState, useEffect } from "react";
import { UserPlus, Trash2, Lock, ShieldCheck, Mail, Building, MapPin, Phone } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AdminTeacherAccount() {
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    department: "",
    phone_number: "",
    address: "",
  });

  // ALIGNMENT: Now fetching from the dedicated teacher endpoint
  const fetchTeachers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/teachers");
      setTeachers(res.data);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
      Swal.fire({
        icon: 'error',
        title: 'Fetch Error',
        text: 'Could not load teacher list. Please check if the backend is running.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchTeachers();
    };
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== confirmPassword) {
      return Swal.fire("Error", "Passwords do not match!", "error");
    }

    setLoading(true);
    try {
      // ALIGNMENT: Pointing to the new TeacherController registration path
      const payload = {
        ...formData,
        confirmPassword: confirmPassword 
      };

      const response = await axios.post("http://localhost:8080/api/teachers/register", payload);

      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Account Created',
          text: response.data.message,
          background: "#F1F5F0",
          confirmButtonColor: "#3D967C"
        });
        
        // Reset and refresh
        setShowModal(false);
        setFormData({ fullname: "", email: "", password: "", department: "", phone_number: "", address: "" });
        setConfirmPassword("");
        fetchTeachers(); 
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Registration failed. Check server connection.";
      Swal.fire("Error", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Teacher Management</h1>
          <p className="text-sm text-gray-500">Manage faculty credentials and department assignments</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[#3D967C] hover:bg-[#2d7362] text-white px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-[#3D967C]/20 active:scale-95"
        >
          <UserPlus size={18} />
          Add New Teacher
        </button>
      </div>

      {/* Table Display */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-[0.15em]">
              <tr>
                <th className="px-6 py-4 font-bold">Faculty Member</th>
                <th className="px-6 py-4 font-bold">Department</th>
                <th className="px-6 py-4 font-bold">Contact Number</th>
                <th className="px-6 py-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-[#F1F5F0]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-800">{t.fullname}</div>
                    <div className="text-xs text-gray-400">{t.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Building size={14} className="text-[#3D967C]" />
                      {t.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.phone_number}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#F1F5F0] w-full max-w-2xl rounded-[2rem] shadow-2xl p-8 border border-white animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">Faculty Registration</h2>
              <p className="text-sm text-gray-500 mt-1">Setup account and department info for new faculty.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input required className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]" 
                  value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                <input required type="email" className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Department</label>
                <input required className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]" 
                  value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input required type="text" className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]" 
                  value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Home Address</label>
                <input required className="w-full bg-white border-none rounded-2xl px-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]" 
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input required type="password" placeholder="••••••••" className="w-full bg-white border-none rounded-2xl pl-11 pr-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]" 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input required type="password" placeholder="••••••••" className="w-full bg-white border-none rounded-2xl pl-11 pr-4 py-3 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]" 
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200/50">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-gray-400 font-semibold hover:text-gray-600">Cancel</button>
                <button type="submit" disabled={loading} className="bg-[#3D967C] hover:bg-[#2d7362] text-white px-10 py-3 rounded-2xl font-bold shadow-xl active:scale-95 disabled:opacity-50">
                  {loading ? "Registering..." : "Create Teacher Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}