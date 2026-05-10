import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Loader2, Plus, BookOpen } from "lucide-react";
import DashboardModal from "../../Layout/HomeLayout/DashboardModal";

export default function TeacherClasses() {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [formData, setFormData] = useState({
    courseId: "",
    academicYearId: "",
    schedule: "",
    room: "",
    maxSlots: 40,
  });

  // 1. Memoize user to get the current teacher's UUID
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  // 2. Fetch Assigned Sections
  const loadData = useCallback(
    async (isMounted) => {
      if (!user?.id) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        // Corrected endpoint to fetch sections for this teacher's UUID
        const response = await axios.get(
          `http://localhost:8080/api/sections/teacher/${user.id}`,
        );
        if (isMounted) {
          setClassesData(response.data || []);
        }
      } catch (error) {
        console.error("API Error fetching teacher sections:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    },
    [user.id],
  );

  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData(isMounted);
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  // 3. Fetch Lookups (Courses & Academic Years) when Modal opens
  useEffect(() => {
    if (isModalOpen) {
      const fetchLookups = async () => {
        try {
          const [courseRes, yearRes] = await Promise.all([
            // ALIGNED: Now matches your general @RequestMapping("/api/courses")
            axios.get("http://localhost:8080/api/courses"),
            axios.get("http://localhost:8080/api/academic-years"),
          ]);
          setCourses(courseRes.data || []);
          setAcademicYears(yearRes.data || []);
        } catch (error) {
          console.error("Lookup error (404 check):", error);
          Swal.fire(
            "Error",
            "Could not load courses. Check backend URL mapping.",
            "error",
          );
        }
      };
      fetchLookups();
    }
  }, [isModalOpen]);

  // 4. Create Section
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Payload includes the Course UUID and Teacher UUID
      const payload = {
        ...formData,
        teacherId: user.id,
      };

      await axios.post("http://localhost:8080/api/sections", payload);

      Swal.fire({
        icon: "success",
        title: "Section Created",
        text: "Class successfully added to your load.",
        background: "#F1F5F0",
        confirmButtonColor: "#3a947e",
      });

      setIsModalOpen(false);
      setFormData({
        courseId: "",
        academicYearId: "",
        schedule: "",
        room: "",
        maxSlots: 40,
      });
      loadData(true);
    } catch (error) {
      console.error("Submission error:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.response?.data?.message || "Could not create section.",
        confirmButtonColor: "#3a947e",
      });
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F0]">
        <Loader2 className="animate-spin mb-4 text-[#3a947e]" size={42} />
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
          Syncing Classes...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F1F5F0] px-4 sm:px-6 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl shadow-lg shadow-emerald-900/20 bg-white border border-slate-50 text-[#3a947e]">
            <BookOpen size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 tracking-tight">
                Classes
              </h1>
              <span className="bg-emerald-50 text-[#3a947e] text-[9px] font-black px-2 py-1 rounded-lg uppercase border border-emerald-100/50">
                {classesData.length} Sections
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 italic">
              Active Instructor Load
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#062D24] text-[#3a947e] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#0a3d31] transition-all shadow-xl active:scale-95"
        >
          <Plus size={16} /> Add New Class
        </button>
      </header>

      {/* STATS HERO */}
      <div className="group bg-[#062D24] p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden border border-[#3a947e]/10">
        <div className="relative z-10">
          <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Instructor Load
          </p>
          <h2 className="text-6xl font-serif font-bold tracking-tighter italic">
            {classesData.length}{" "}
            <span className="text-2xl text-slate-400 not-italic ml-2 tracking-widest uppercase">
              Active Sections
            </span>
          </h2>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl group-hover:bg-teal-500/10 transition-all" />
      </div>

      {/* SECTION LIST */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 pt-8 pb-4 border-b border-slate-50">
          <h3 className="text-[11px] font-black text-[#3a947e] uppercase tracking-[0.2em]">
            Section Registry
          </h3>
        </div>
        <div className="divide-y divide-slate-50">
          {classesData.length === 0 ? (
            <div className="p-20 text-center text-slate-300 italic text-sm">
              No classes assigned.
            </div>
          ) : (
            classesData.map((section) => (
              <div
                key={section.id}
                className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between group hover:bg-slate-50 transition-all"
              >
                {/* Inside TeacherClasses.jsx mapping */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center bg-[#F1F7F5] text-[#3a947e] min-w-[100px] py-4 rounded-2xl text-[11px] font-black border border-teal-100 shadow-sm uppercase">
                    {/* FIX: Use the field name from your DTO */}
                    {section.courseCode || "SUBJ"}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-[#3a947e] transition-colors">
                      {/* FIX: Use the field name from your DTO */}
                      {section.courseName || "Untitled Section"}
                    </h4>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest italic">
                      {section.schedule} • {section.room}
                    </p>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase bg-slate-50 px-3 py-1 rounded-lg">
                    {section.academicYear?.yearLabel || "Current Semester"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL */}
      <DashboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Section"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
              Course / Subject
            </label>
            <select
              required
              className="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none text-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-[#3a947e]/20"
              onChange={(e) =>
                setFormData({ ...formData, courseId: e.target.value })
              }
              value={formData.courseId}
            >
              <option value="" disabled>
                Choose a curriculum subject...
              </option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
              Academic Period
            </label>
            <select
              required
              className="w-full p-4 rounded-2xl bg-[#F1F5F0] border-none text-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-[#3a947e]/20"
              onChange={(e) =>
                setFormData({ ...formData, academicYearId: e.target.value })
              }
              value={formData.academicYearId}
            >
              <option value="" disabled>
                Select Year & Semester...
              </option>
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.yearLabel} | {y.semester}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                Schedule
              </label>
              <input
                required
                type="text"
                placeholder="TTH 1:00-2:30"
                className="w-full p-4 rounded-2xl bg-[#F1F5F0] text-sm font-bold border-none outline-none focus:ring-2 focus:ring-[#3a947e]/20"
                value={formData.schedule}
                onChange={(e) =>
                  setFormData({ ...formData, schedule: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">
                Room / Lab
              </label>
              <input
                required
                type="text"
                placeholder="CL 102"
                className="w-full p-4 rounded-2xl bg-[#F1F5F0] text-sm font-bold border-none outline-none focus:ring-2 focus:ring-[#3a947e]/20"
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#062D24] text-[#3a947e] py-4 mt-2 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:bg-[#0a3d31] transition-all"
          >
            Confirm Assignment
          </button>
        </form>
      </DashboardModal>
    </div>
  );
}
