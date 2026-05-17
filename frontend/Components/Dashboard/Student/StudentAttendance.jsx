/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Loader2, Plus, CheckCircle, Calendar, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import DashboardModal from "../../Layout/HomeLayout/DashboardModal";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true 
});

export default function StudentAttendance() {
  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) { return null; }
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrollments, setEnrollments] = useState([]);
  const [history, setHistory] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const [form, setForm] = useState({
    enrollmentId: "",
    status: "PRESENT",
    remarks: "Logged via student portal",
  });

  const currentUserId = useMemo(() => {
    return user?.userId || user?.userid || user?.id;
  }, [user]);

  const studentProfileId = useMemo(() => {
    if (enrollments.length > 0) {
      return enrollments[0].student?.id || enrollments[0].student_id || currentUserId;
    }
    return currentUserId;
  }, [enrollments, currentUserId]);

  const isAlreadyLoggedToday = useMemo(() => {
    if (!form.enrollmentId) return false;
    const selectedEnrollment = enrollments.find(en => String(en.id) === String(form.enrollmentId));
    if (!selectedEnrollment) return false;
    const todayStr = new Date().toISOString().split('T')[0]; 
    const targetCourseId = selectedEnrollment.course?.id || selectedEnrollment.course_id;
    return history.some(log => {
      const logCourseId = log.course?.id || log.courseId;
      return String(logCourseId) === String(targetCourseId) && log.date === todayStr;
    });
  }, [form.enrollmentId, enrollments, history]);

  const fetchData = useCallback(async (isMounted) => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const [enrollRes, histRes] = await Promise.all([
        api.get(`/enrollments/student/${currentUserId}`),
        api.get(`/attendance/student/${currentUserId}`)
      ]);
      if (isMounted) {
        setEnrollments(enrollRes.data || []);
        setHistory(histRes.data || []);
        setTimeout(() => setIsReady(true), 50);
      }
    } catch (error) { 
      console.error("Dynamic API Request Sync Error:", error); 
    } 
    finally { if (isMounted) setLoading(false); }
  }, [currentUserId]);

  useEffect(() => {
    let isMounted = true;
    if (currentUserId) {
      setTimeout(() => {
        if (isMounted) {
          fetchData(isMounted);
        }
      }, 0);
    }
    return () => { isMounted = false; };
  }, [currentUserId, fetchData]);

  const stats = useMemo(() => {
    const data = Array.isArray(history) ? history : [];
    const present = data.filter((a) => a.status === "PRESENT" || a.status === "ACTIVE" || a.status === "OPEN").length;
    const late = data.filter((a) => a.status === "LATE").length;
    const total = data.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
      present, late, total, rate,
      chartData: [
        { name: "Present", value: present, color: "#3D967C" }, 
        { name: "Late", value: late, color: "#F59E0B" },
      ],
    };
  }, [history]);

  const submitAttendance = async (e) => {
    e.preventDefault();
    if (!form.enrollmentId || !currentUserId || isAlreadyLoggedToday) return;
    const selected = enrollments.find(en => String(en.id) === String(form.enrollmentId));
    if (!selected) return;
    try {
      setSubmitting(true);
      const payload = {
        studentId: studentProfileId, 
        teacherId: selected.teacher?.userId || selected.teacher?.id || selected.teacher_id, 
        courseId: selected.course?.id || selected.course_id, 
        section: selected.section || "Section",
        date: new Date().toISOString().split('T')[0], 
        status: form.status,
        remarks: `${form.remarks} | Sched: ${selected.schedule || "N/A"} (${selected.room || "Room"})`,
      };
      const response = await api.post("/attendance/mark", payload);
      if (response.data && response.data.success === false) {
        Swal.fire({ icon: "error", title: "Oops!", text: response.data.message, confirmButtonColor: "#3D967C" });
        return;
      }
      await fetchData(true);
      Swal.fire({ 
        icon: "success", 
        title: "Log Verified", 
        text: "Attendance updated in real-time!",
        timer: 1500, 
        confirmButtonColor: "#3D967C" 
      });
      setIsModalOpen(false);
      setForm(prev => ({ ...prev, enrollmentId: "" })); 
    } catch (error) {
      Swal.fire({ 
        icon: "error", 
        title: "Oops!", 
        text: error.response?.data?.message || "Server transaction rejected.", 
        confirmButtonColor: "#3D967C" 
      });
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <div className={`w-full space-y-6 md:space-y-8 pt-4 md:pt-6 text-left transition-all duration-500 ease-out ${
        isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}>
        <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center border-b border-slate-200/50 pb-4 sm:pb-0 sm:border-none">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 rounded-2xl bg-white text-[#3D967C] shadow-sm shrink-0">
              <Calendar size={24} className="md:w-7 md:h-7" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 uppercase tracking-tight truncate">Presence</h1>
              <p className="text-[9px] md:text-[10px] text-[#3D967C] font-black uppercase tracking-widest italic truncate mt-0.5">
                Active Account: {user?.fullname || "Authenticated Student"}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full sm:w-auto bg-[#062D24] text-[#3D967C] px-6 md:px-8 py-3.5 md:py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={14} /> Mark Attendance
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          <div className="bg-[#062D24] p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-xl relative border border-emerald-900/20 flex flex-col items-center justify-center">
            <div className="w-full text-left">
              <p className="text-teal-400 text-[10px] font-black uppercase tracking-widest mb-2 md:mb-4">Registry Rate</p>
              <h2 className="text-5xl md:text-7xl font-serif font-bold italic mb-4 md:mb-6">{stats.rate}%</h2>
            </div>
            <div className="flex items-center justify-center h-48 md:h-56 w-full">
              {stats.total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={stats.chartData} 
                      innerRadius="60%"
                      outerRadius="80%" 
                      paddingAngle={4} 
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                    >
                      {stats.chartData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-white/20 uppercase font-black text-[10px] italic tracking-wider">No Records Registered</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 md:px-8 py-5 md:py-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-[10px] md:text-[11px] font-black text-[#3D967C] uppercase tracking-wider">Validated History</h3>
              <span className="text-[9px] font-black text-slate-300 uppercase bg-slate-50 px-2.5 py-1 rounded-md">{history.length} Logs Verified</span>
            </div>
            <div className="divide-y divide-slate-50 overflow-y-auto max-h-[400px] md:max-h-[500px]">
              {history.length === 0 ? (
                <div className="py-16 md:py-20 text-center text-slate-300 italic text-xs md:text-sm px-4">No attendance records found for this course.</div>
              ) : (
                [...history].sort((a,b) => new Date(b.date) - new Date(a.date)).map((log) => (
                  <div 
                    key={log.id} 
                    className="px-6 md:px-8 py-5 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-all text-left"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${log.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                        <CheckCircle size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 uppercase text-xs md:text-sm break-words md:truncate">
                          {log.course?.code || "COURSE"} — {log.course?.title || "CLASS OBJECT"}
                        </h4>
                        <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase mt-1 break-words">
                          {log.date} <span className="mx-1 text-slate-300">•</span> Section {log.section || "A"} <span className="mx-1 text-slate-300">•</span> <span className="text-slate-500 italic lowercase first-letter:uppercase">{log.remarks}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex sm:justify-end shrink-0 pl-12 sm:pl-0">
                      <span className={`text-[8px] md:text-[9px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider ${log.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <DashboardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registry Entry">
        <form onSubmit={submitAttendance} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Subject</label>
            <select 
              className="w-full p-4 rounded-xl bg-[#F1F5F0] border-none text-xs md:text-sm font-bold outline-none text-slate-800 appearance-none focus:ring-2 ring-[#3D967C]/20" 
              value={form.enrollmentId} 
              onChange={(e) => setForm({ ...form, enrollmentId: e.target.value })} 
              required
            >
              <option value="">Select your class...</option>
              {enrollments.map((en) => (
                <option key={en.id} value={en.id} className="text-slate-800">
                  {en.course?.code || "SUBJ"} — {en.course?.title || "Course"} | [{en.schedule || "No Sched"}] • Room {en.room || "TBA"}
                </option>
              ))}
            </select>
          </div>

          {isAlreadyLoggedToday && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider animate-pulse leading-normal">
              <AlertCircle size={16} className="shrink-0" />
              <span>You have already logged your attendance for this class today.</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {["PRESENT", "LATE"].map((s) => (
                <button 
                  key={s} 
                  type="button" 
                  disabled={isAlreadyLoggedToday}
                  onClick={() => setForm({ ...form, status: s })} 
                  className={`py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isAlreadyLoggedToday ? "opacity-30 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200" : form.status === s ? "bg-[#062D24] text-[#3D967C] border-transparent shadow-lg" : "bg-white text-slate-400 border-slate-100"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            disabled={submitting || isAlreadyLoggedToday} 
            className="w-full bg-[#062D24] text-[#3D967C] py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-[#0a3d31] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {submitting ? <Loader2 className="animate-spin" size={16} /> : "Finalize Entry"}
          </button>
        </form>
      </DashboardModal>
    </>
  );
}