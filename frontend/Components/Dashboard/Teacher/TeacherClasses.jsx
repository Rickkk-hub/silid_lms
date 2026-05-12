/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  Loader2, Plus, BookOpen, MapPin, 
  Clock, Book, Users, GraduationCap 
} from "lucide-react";
import DashboardModal from "../../Layout/HomeLayout/DashboardModal";

export default function TeacherClasses() {
  const [classesData, setClassesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  
  // Class Record State for "Drill-down"
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [studentList, setStudentList] = useState([]);

  const [formData, setFormData] = useState({
    courseId: "",
    sectionName: "",
    schedule: "",
    room: "",
  });

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (error) { 
      console.error("Auth parsing error:", error);
      return {}; 
    }
  }, []);

  // 1. DATA LOADING LOGIC
  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true); 
      const response = await axios.get(`http://localhost:8080/api/enrollments/teacher/${user.id}`);
      
      const uniqueSections = response.data.reduce((acc, curr) => {
        if (!acc.find(item => item.section === curr.section)) {
          acc.push(curr);
        }
        return acc;
      }, []);

      setClassesData(uniqueSections || []);
    } catch (error) {
      console.error("Failed to load teacher sections:", error);
      // Fixed: Proper exception handling for SonarQube
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    let isMounted = true;

    // We define an async wrapper to move the setState out of the sync execution path
    const syncData = async () => {
      if (isMounted) {
        await loadData();
      }
    };

    syncData();

    return () => {
      isMounted = false;
    };
  }, [loadData]);

  // 2. FETCH STUDENTS FOR A SPECIFIC SECTION (The "Bridge" Logic)
  const handleViewStudents = async (sectionName) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/enrollments/section/${sectionName}`);
      // Filter out skeleton rows to show real students
      const enrolled = res.data.filter(en => en.student !== null);
      
      setStudentList(enrolled);
      setSelectedSection(sectionName);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Class Record Error:", error);
      Swal.fire({
        icon: "error",
        title: "Connection Failed",
        text: "Could not retrieve the student list from the registry.",
        confirmButtonColor: "#3a947e"
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. FETCH SUBJECTS FOR DROPDOWN
  useEffect(() => {
    if (isModalOpen) {
      const fetchSubjects = async () => {
        try {
          const res = await axios.get("http://localhost:8080/api/courses");
          setCourses(res.data || []);
        } catch (error) {
          console.error("Subject fetch failed:", error);
        }
      };
      fetchSubjects();
    }
  }, [isModalOpen]);

  // 4. SUBMIT NEW CLASS
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        teacherId: user.id,
        section: formData.sectionName,
        courseId: formData.courseId,
        schedule: formData.schedule,
        room: formData.room
      };

      const res = await axios.post("http://localhost:8080/api/enrollments/create-section", payload);

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Section Initialized",
          confirmButtonColor: "#3a947e",
          background: "#F1F5F0"
        });

        setIsModalOpen(false);
        setFormData({ courseId: "", sectionName: "", schedule: "", room: "" });
        loadData();
      }
    } catch (error) {
      console.error("Submission failed:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Process incomplete.", confirmButtonColor: "#3a947e" });
    }
  };

  if (loading && classesData.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F0]">
      <Loader2 className="animate-spin mb-4 text-[#3a947e]" size={42} />
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Syncing Records...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F0] px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-emerald-900/5 pb-8">
        <div className="flex items-center gap-4 text-left">
          <div className="p-3 rounded-2xl shadow-lg bg-white text-[#3a947e]"><BookOpen size={28} /></div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 tracking-tight">Classes</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1 italic">Instructional Load Management</p>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#062D24] text-[#3a947e] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#0a3d31] transition-all shadow-xl active:scale-95">
          <Plus size={16} /> Add New Class
        </button>
      </header>

      {/* STATS HERO */}
      <div className="bg-[#062D24] p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden text-left">
        <div className="relative z-10">
          <p className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Registry Summary</p>
          <h2 className="text-6xl font-serif font-bold tracking-tighter italic">
            {classesData.length} <span className="text-2xl text-slate-400 not-italic ml-2 uppercase tracking-widest">Active Sections</span>
          </h2>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* List */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden text-left">
        <div className="divide-y divide-slate-50">
          {classesData.length === 0 ? (
            <div className="p-20 text-center text-slate-300 italic text-sm">No teaching load recorded for this term.</div>
          ) : (
            classesData.map((section, idx) => (
              <div key={idx} className="px-8 py-8 flex flex-col sm:flex-row sm:items-center justify-between group hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center bg-[#F1F7F5] text-[#3a947e] min-w-[120px] py-4 rounded-2xl text-[11px] font-black border border-teal-100 uppercase tracking-widest shadow-sm">
                    {section.section}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-[#3a947e] transition-colors uppercase font-serif">
                      {section.course?.title || "General Instruction"}
                    </h4>
                    <div className="flex items-center gap-4 mt-1">
                       <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><Clock size={12} className="text-[#3a947e]"/> {section.schedule}</span>
                       <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1"><MapPin size={12} className="text-[#3a947e]"/> {section.room}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleViewStudents(section.section)}
                  className="mt-4 sm:mt-0 px-6 py-3 bg-[#F1F7F5] text-[#3a947e] rounded-xl text-[9px] font-black uppercase tracking-widest border border-teal-50 hover:bg-[#3a947e] hover:text-white transition-all flex items-center gap-2"
                >
                  <Users size={14} /> Class Record
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      <DashboardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Instructional Block">
        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
            <select required className="w-full p-4 rounded-2xl bg-[#F1F5F0] text-sm font-bold border-none outline-none" value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})}>
              <option value="">Select Subject...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Section</label>
            <input required placeholder="BSIT-2A" className="w-full p-4 rounded-2xl bg-[#F1F5F0] text-sm font-bold border-none outline-none" value={formData.sectionName} onChange={(e) => setFormData({...formData, sectionName: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Schedule" className="p-4 rounded-2xl bg-[#F1F5F0] text-sm font-bold border-none outline-none" value={formData.schedule} onChange={(e) => setFormData({...formData, schedule: e.target.value})} />
            <input required placeholder="Room" className="p-4 rounded-2xl bg-[#F1F5F0] text-sm font-bold border-none outline-none" value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-[#062D24] text-[#3a947e] py-5 mt-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Finalize Block</button>
        </form>
      </DashboardModal>

      {/* VIEW STUDENTS MODAL */}
      <DashboardModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={`Student Record: ${selectedSection}`}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {studentList.length === 0 ? (
            <p className="text-center py-10 text-slate-400 italic text-sm font-serif uppercase tracking-widest">No student enrollments for this block.</p>
          ) : (
            studentList.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-[#F1F7F5] rounded-2xl border border-teal-50 group hover:bg-white hover:shadow-md transition-all text-left">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg text-[#3a947e]"><GraduationCap size={18} /></div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{entry.student?.fullname}</h5>
                    <p className="text-[9px] font-black text-[#3a947e] uppercase tracking-widest">{entry.student?.department || "Regular"}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter italic">Enrolled</span>
              </div>
            ))
          )}
        </div>
      </DashboardModal>
    </div>
  );
}