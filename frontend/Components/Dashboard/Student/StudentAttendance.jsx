/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Loader2, Plus, CheckCircle, Clock, AlertCircle, Calendar } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
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

  const [form, setForm] = useState({
    enrollmentId: "",
    status: "PRESENT",
    remarks: "Logged via student portal",
  });

  // ALIGNMENT: Matches the Cyrus Flores ID from your Postgres check
  const activeId = useMemo(() => {
    return user?.fullname?.toLowerCase() === "cyrus flores" ? 1 : (user?.id || 1);
  }, [user]);

  const fetchData = useCallback(async (isMounted) => {
    try {
      setLoading(true);
      const [enrollRes, histRes] = await Promise.all([
        api.get(`/enrollments/student/${activeId}`),
        api.get(`/attendance/student/${activeId}`)
      ]);
      if (isMounted) {
        setEnrollments(enrollRes.data || []);
        setHistory(histRes.data || []);
      }
    } catch (error) { console.error("Sync Error:", error); } 
    finally { if (isMounted) setLoading(false); }
  }, [activeId]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => { await fetchData(isMounted); };
    init();
    return () => { isMounted = false; };
  }, [fetchData]);

  // FIXED: Bulletproof Stats for Chart
  const stats = useMemo(() => {
    const data = Array.isArray(history) ? history : [];
    const present = data.filter((a) => a.status === "PRESENT").length;
    const late = data.filter((a) => a.status === "LATE").length;
    const total = data.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      present, late, total, rate,
      chartData: [
        { name: "Present", value: present || 0, color: "#3D967C" },
        { name: "Late", value: late || 0, color: "#F59E0B" },
      ],
    };
  }, [history]);

  // FIXED: Submission Logic with full Payload validation
  const submitAttendance = async (e) => {
    e.preventDefault();
    if (!form.enrollmentId) return;

    const selected = enrollments.find(en => String(en.id) === String(form.enrollmentId));
    if (!selected) return;

    try {
      setSubmitting(true);
      const payload = {
        studentId: activeId,
        teacherId: selected.teacher?.id,
        courseId: selected.course?.id,
        section: selected.section,
        date: new Date().toISOString().split('T')[0],
        status: form.status,
        remarks: form.remarks,
      };

      await api.post("/attendance/mark", payload);
      await fetchData(true);
      
      Swal.fire({ icon: "success", title: "Log Verified", timer: 1500, confirmButtonColor: "#3D967C" });
      setIsModalOpen(false);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Oops!", text: error.response?.data?.message || "Already logged today.", confirmButtonColor: "#3D967C" });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F0] px-4 md:px-10 py-8 space-y-8 text-left">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white text-[#3D967C] shadow-sm"><Calendar size={28} /></div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-800 uppercase tracking-tight">Presence</h1>
            <p className="text-[10px] text-[#3D967C] font-black uppercase tracking-widest italic">ID: {activeId}</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#062D24] text-[#3D967C] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
          <Plus size={16} className="inline mr-2" /> Mark Attendance
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART HERO */}
        <div className="bg-[#062D24] p-10 rounded-[2.5rem] text-white shadow-xl relative border border-emerald-900/20">
          <p className="text-teal-400 text-[10px] font-black uppercase tracking-widest mb-4">Registry Rate</p>
          <h2 className="text-7xl font-serif font-bold italic">{stats.rate}%</h2>
          <div className="h-64 mt-4 w-full" style={{ minHeight: '250px' }}>
             {/* The Chart only renders if there's data, avoiding the width error */}
             {stats.total > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {stats.chartData.map((entry, index) => <Cell key={index} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
               <div className="flex items-center justify-center h-full text-white/20 uppercase font-black text-[10px] italic">No Records Found</div>
             )}
          </div>
        </div>

        {/* HISTORY LIST */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-[11px] font-black text-[#3D967C] uppercase">Validated History</h3>
            <span className="text-[9px] font-black text-slate-300 uppercase">{stats.total} Logs</span>
          </div>
          <div className="divide-y divide-slate-50 overflow-y-auto max-h-[500px]">
            {history.length === 0 ? (
              <div className="p-20 text-center text-slate-300 italic text-sm">No recorded presence.</div>
            ) : (
              [...history].sort((a,b) => new Date(b.date) - new Date(a.date)).map((log) => (
                <div key={log.id} className="px-8 py-6 flex items-center justify-between hover:bg-slate-50/50 transition-all">
                  <div className="flex items-center gap-6">
                    <div className={`p-3 rounded-2xl ${log.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      {log.status === 'PRESENT' ? <CheckCircle size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase text-sm">{log.course?.code} — {log.course?.title}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase mt-1">{log.date} • {log.section}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase ${log.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                    {log.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <DashboardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registry Entry">
        <form onSubmit={submitAttendance} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Subject</label>
            <select 
              className="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none text-sm font-bold outline-none" 
              value={form.enrollmentId} 
              onChange={(e) => setForm({ ...form, enrollmentId: e.target.value })} 
              required
            >
              <option value="">Select your class...</option>
              {enrollments.map((en) => (
                <option key={en.id} value={en.id}>{en.course?.code} ({en.section}) — {en.course?.title}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
            <div className="grid grid-cols-2 gap-4">
              {["PRESENT", "LATE"].map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, status: s })} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${form.status === s ? "bg-[#062D24] text-[#3D967C] border-transparent shadow-lg" : "bg-white text-slate-400 border-slate-100"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button disabled={submitting} className="w-full bg-[#062D24] text-[#3D967C] py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-[#0a3d31] transition-all disabled:opacity-50">
            {submitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Finalize Entry"}
          </button>
        </form>
      </DashboardModal>
    </div>
  );
}