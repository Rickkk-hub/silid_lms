import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, Search, Filter, Trash2, GraduationCap, Users, Calendar, BookOpen, Building2, Loader2 } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AdminEnrollment() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);

  const [formData, setFormData] = useState({
    studentId: "",
    teacherId: "",
    semester: "2nd Semester",
    schoolYear: "2025-2026",
    section: "",
    department: "CCS",
    status: "Enrolled"
  });

  // FETCH DATA
  const fetchData = useCallback(async () => {
    setTableLoading(true);
    try {
      const [enRes, stRes, teRes] = await Promise.all([
        axios.get("http://localhost:8080/api/enrollments"),
        axios.get("http://localhost:8080/api/students"),
        axios.get("http://localhost:8080/api/teachers")
      ]);

      // ALIGNMENT FIX: Filter out sections that don't have a student assigned
      // This keeps the Admin view focused on actual enrollments
      const activeEnrollments = enRes.data.filter(item => item.student !== null);
      
      setEnrollments(activeEnrollments);
      setStudents(stRes.data);
      setTeachers(teRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setTableLoading(false);
    }
  }, []);

 useEffect(() => {
    let isMounted = true;

    const executeFetch = async () => {
      // Only run the fetch if the component is still in the DOM
      if (isMounted) {
        await fetchData();
      }
    };

    executeFetch();

    // Cleanup: Prevents memory leaks if user leaves the page before fetch finishes
    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:8080/api/enrollments/enroll", formData);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Enrollment Successful",
          text: response.data.message,
          confirmButtonColor: "#3D967C",
          background: "#F1F5F0"
        });
        setShowModal(false);
        fetchData(); // Refresh aligned data
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Enrollment failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 bg-[#F1F5F0] min-h-screen text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="text-left">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-800 flex items-center gap-3">
            <GraduationCap className="text-[#3D967C]" size={32} />
            Student Enrollment
          </h1>
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mt-1 italic">Registry & Section Assignment</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[#062D24] text-[#3D967C] px-8 py-4 rounded-2xl transition-all shadow-xl active:scale-95 font-black uppercase text-[10px] tracking-widest"
        >
          <UserPlus size={18} />
          New Enrollment
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F1F5F0] text-gray-400 text-[10px] uppercase tracking-widest font-black">
              <tr>
                <th className="px-8 py-5">Student</th>
                <th className="px-8 py-5">Teacher / Dept</th>
                <th className="px-8 py-5">Section & Year</th>
                <th className="px-8 py-5">Course / Subject</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tableLoading ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center">
                    <Loader2 className="animate-spin inline-block text-[#3D967C] mb-2" size={32} />
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Syncing Enrollment Registry...</p>
                  </td>
                </tr>
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-slate-300 italic text-sm">No active student enrollments found.</td>
                </tr>
              ) : (
                enrollments.map((en) => (
                  <tr key={en.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-800 text-base uppercase">{en.student?.fullname}</div>
                      <div className="text-[10px] text-[#3D967C] font-black uppercase tracking-tighter">{en.student?.course || "Regular"}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-gray-700 uppercase">{en.teacher?.fullname}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{en.department}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-bold text-gray-600">{en.section}</div>
                      <div className="text-[10px] text-gray-400 font-medium">{en.schoolYear} | {en.semester}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-serif font-bold text-slate-700 uppercase">{en.course?.title || "Academic Instruction"}</div>
                      <div className="text-[9px] text-slate-300 font-black uppercase tracking-tighter">{en.course?.code}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-1.5 rounded-xl text-[10px] font-black bg-emerald-50 text-[#3D967C] uppercase border border-emerald-100">
                        {en.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button className="p-3 text-gray-200 hover:text-red-500 transition-colors hover:bg-red-50 rounded-xl">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#062D24]/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 border border-white animate-in zoom-in duration-300 text-left">
            <div className="text-left mb-10 border-b border-slate-50 pb-6">
              <h2 className="text-3xl font-serif font-bold text-gray-800 tracking-tight">Process Enrollment</h2>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Map students to instructional blocks</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Form inputs remain largely the same, but styled for high-fidelity */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Users size={12} className="text-[#3D967C]" /> Select Student
                </label>
                <select
                  required
                  className="w-full bg-[#F1F5F0] border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]/20 appearance-none"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                >
                  <option value="">Choose Student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.fullname}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <BookOpen size={12} className="text-[#3D967C]" /> Assign Teacher
                </label>
                <select
                  required
                  className="w-full bg-[#F1F5F0] border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-[#3D967C]/20 appearance-none"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                >
                  <option value="">Choose Instructor...</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.fullname}</option>)}
                </select>
              </div>

              {/* ... Other inputs following the same theme ... */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Section Identifier</label>
                <input required placeholder="BSIS-3A" className="w-full bg-[#F1F5F0] border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm outline-none" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                  <Building2 size={12} className="text-[#3D967C]" /> Department
                </label>
                <input required placeholder="CCS" className="w-full bg-[#F1F5F0] border-none rounded-2xl px-5 py-4 text-sm font-bold shadow-sm outline-none" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              </div>

              <div className="md:col-span-2 flex flex-col md:flex-row justify-end gap-4 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-10 py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="bg-[#062D24] text-[#3D967C] px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-95 disabled:opacity-50">
                  {loading ? "Processing..." : "Finalize Enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}