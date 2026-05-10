import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Loader2,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import DashboardModal from "../../Layout/HomeLayout/DashboardModal";

export default function StudentAttendance() {
  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Session parse error:", error);
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sections, setSections] = useState([]);
  const [history, setHistory] = useState([]);

  const [form, setForm] = useState({
    sectionId: "",
    status: "PRESENT",
    remarks: "Logged via student portal",
  });

  // Compiler-friendly memoization
  const hasValidId = useMemo(() => !!user?.id && user.id.length > 10, [user]);

  const fetchData = useCallback(
    async (isMounted) => {
      if (!hasValidId) return;
      try {
        setLoading(true);
        const [secRes, histRes] = await Promise.all([
          axios.get("http://localhost:8080/api/sections"),
          axios.get(
            `http://localhost:8080/api/attendance/student/${user.id}/history`,
          ),
        ]);

        if (isMounted) {
          setSections(secRes.data || []);
          setHistory(histRes.data || []);
        }
      } catch (error) {
        console.error("Attendance Fetch Error:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    },
    [user, hasValidId],
  ); // Matched dependencies for React Compiler

  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  // Analytics
  const stats = useMemo(() => {
    const present = history.filter((a) => a.status === "PRESENT").length;
    const late = history.filter((a) => a.status === "LATE").length;
    const total = history.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      present,
      late,
      total,
      rate,
      chartData: [
        { name: "Present", value: present, color: "#3a947e" },
        { name: "Late", value: late, color: "#f59e0b" },
      ],
    };
  }, [history]);

  const sortedHistory = useMemo(() => {
    if (!Array.isArray(history)) return [];
    return [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [history]);

  const submitAttendance = async (e) => {
    e.preventDefault();
    if (!form.sectionId) return;

    try {
      setSubmitting(true);
      await axios.post("http://localhost:8080/api/attendance/submit", {
        studentId: user.id,
        sectionId: form.sectionId,
        status: form.status,
        remarks: form.remarks,
      });

      // Refresh data after successful post
      await fetchData(true);

      Swal.fire({
        icon: "success",
        title: "Attendance Marked",
        timer: 1500,
        background: "#F1F5F0",
        confirmButtonColor: "#3a947e",
      });
      setIsModalOpen(false);
      setForm((prev) => ({ ...prev, sectionId: "" }));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.message || "Already recorded for today",
        confirmButtonColor: "#3a947e",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!hasValidId)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F0] text-slate-400">
        <AlertCircle size={40} className="mb-4" />
        <p className="font-black uppercase text-[10px] tracking-widest">
          Session Expired. Please re-login.
        </p>
      </div>
    );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F0]">
        <Loader2 className="animate-spin text-[#3a947e]" size={42} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F1F5F0] px-4 md:px-10 py-8 space-y-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl shadow-lg shadow-emerald-900/20 bg-white border border-slate-50 text-[#3a947e]">
            <Calendar size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-800 tracking-tight">
              Attendance
            </h1>
            <p className="text-[10px] text-[#3a947e] font-black uppercase mt-1 italic tracking-widest">
              Student Portal • {user.studentNumber}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#062D24] text-[#3a947e] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#0a3d31] transition-all shadow-xl active:scale-95"
        >
          <Plus size={16} /> Log Presence
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ANALYTICS CARD */}
        <div className="bg-[#062D24] p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden flex flex-col justify-between border border-emerald-900/20">
          <div className="relative z-10">
            <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              Overall Presence
            </p>
            <h2 className="text-6xl font-serif font-bold italic tracking-tighter">
              {stats.rate}%
            </h2>
          </div>

          <div className="h-48 w-full relative z-10 mt-4 min-h-[192px]">
            {" "}
            {/* Added min-h */}
            <ResponsiveContainer width="100%" height="100%" debounce={100}>
              {" "}
              {/* Added debounce */}
              <PieChart>
                <Pie
                  data={stats.chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={true} // Ensure animation is on
                >
                  {stats.chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "none",
                    backgroundColor: "#fff",
                    color: "#000",
                  }}
                  itemStyle={{ color: "#000" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl" />
        </div>

        {/* LOGS TIMELINE */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-[11px] font-black text-[#3a947e] uppercase tracking-[0.2em]">
              Presence History
            </h3>
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
              {stats.total} Records
            </span>
          </div>

          <div className="divide-y divide-slate-50 overflow-y-auto max-h-[500px]">
            {sortedHistory.length === 0 ? (
              <div className="p-20 text-center text-slate-300 italic text-sm">
                No attendance logged yet.
              </div>
            ) : (
              sortedHistory.map((log) => (
                <div
                  key={log.id}
                  className="px-8 py-6 flex items-center justify-between group hover:bg-slate-50/50 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div
                      className={`p-3 rounded-2xl ${log.status === "PRESENT" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}
                    >
                      {log.status === "PRESENT" ? (
                        <CheckCircle size={20} />
                      ) : (
                        <Clock size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base group-hover:text-[#3a947e] transition-colors uppercase tracking-tight">
                        {log.courseCode}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                        {log.date} • {log.sectionName || "Regular Session"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter ${log.status === "PRESENT" ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}
                  >
                    {log.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* SUBMISSION MODAL */}
      <DashboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Presence"
      >
        <form onSubmit={submitAttendance} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Select Section
            </label>
            <select
              className="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none text-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-[#3a947e]/20"
              value={form.sectionId}
              onChange={(e) => setForm({ ...form, sectionId: e.target.value })}
              required
            >
              <option value="">Choose your class...</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {/* Use optional chaining and fallbacks for every property 
         to ensure the details appear even if the join is lazy.
      */}
                  {s.course?.code || s.courseCode || "SUBJ"} —{" "}
                  {s.course?.title || s.name || "General Session"}{" "}
                  {s.schedule ? `(${s.schedule})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Arrival Status
            </label>
            <div className="grid grid-cols-2 gap-4">
              {["PRESENT", "LATE"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    form.status === s
                      ? "bg-[#062D24] text-[#3a947e] border-transparent shadow-lg"
                      : "bg-white text-slate-400 border-slate-100 hover:border-teal-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={submitting}
            className="w-full bg-[#062D24] text-[#3a947e] py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-[#0a3d31] transition-all disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="animate-spin mx-auto" size={18} />
            ) : (
              "Confirm Presence"
            )}
          </button>
        </form>
      </DashboardModal>
    </div>
  );
}
