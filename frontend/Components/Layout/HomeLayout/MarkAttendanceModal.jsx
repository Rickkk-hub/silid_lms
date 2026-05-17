/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Check, X, Save, Loader2, AlertCircle } from 'lucide-react';
import DashboardModal from './DashboardModal';

const api = axios.create({ baseURL: "http://localhost:8080/api", withCredentials: true });

export default function MarkAttendanceModal({ isOpen, onClose, onRefresh }) {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const teacherUserId = user.userId || user.id;

  useEffect(() => {
    if (isOpen && teacherUserId) {
      api.get(`/enrollments/teacher/${teacherUserId}`)
        .then(res => {
          const rawData = res.data || [];
          const validEnrollments = rawData.filter(e => e.section && e.student && e.student.id);
          const unique = [...new Set(validEnrollments.map(e => e.section))];
          setSections(unique);
        })
        .catch(err => console.error("Error loading sections:", err.message));
    }
  }, [isOpen, teacherUserId]);

  useEffect(() => {
    let isMounted = true;

    const fetchStudents = async () => {
      if (!selectedSection) {
        setStudents([]);
        return;
      }

      setLoadingStudents(true);
      try {
        const res = await api.get(`/enrollments/teacher/${teacherUserId}`);
        if (isMounted) {
          const rawData = res.data || [];
          const filtered = rawData.filter(
            e => e.section === selectedSection && e.student && e.student.id
          );
          
          setStudents(filtered);
          
          const initial = {};
          filtered.forEach(e => { 
            initial[e.student.id] = "PRESENT"; 
          });
          setAttendanceData(initial);
        }
      } catch (err) {
        console.error("Error loading students:", err.message);
      } finally {
        if (isMounted) setLoadingStudents(false);
      }
    };

    fetchStudents();
    return () => { isMounted = false; };
  }, [selectedSection, teacherUserId]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    const result = await Swal.fire({
      title: 'Confirm Attendance?',
      text: `Syncing daily logs for ${selectedSection}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3a947e',
      confirmButtonText: 'Yes, Submit All'
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const targetSubmissions = students.filter(s => s.student && s.student.id);

      const promises = targetSubmissions.map(s => {
        return api.post("/attendance/mark", {
          studentId: s.student.id,
          teacherId: teacherUserId,
          courseId: s.course?.id || 1,
          section: selectedSection,
          date: today,
          status: attendanceData[s.student.id] || "PRESENT",
          remarks: "Daily Class Record"
        });
      });

      await Promise.all(promises);
      
      await Swal.fire({ icon: 'success', title: 'Synced!', text: 'Records updated successfully.', timer: 1500, showConfirmButton: false });
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Save failed:", err.message);
      Swal.fire('Sync Error', err.response?.data?.message || 'Internal Server Error', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardModal isOpen={isOpen} onClose={onClose} title="Daily Attendance Check">
      <div className="space-y-5 text-left w-full min-w-0">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Section</label>
          <select 
            className="w-full p-4 bg-[#F1F5F0] rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-emerald-500/20 cursor-pointer appearance-none text-slate-700"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="">-- Choose Class Section --</option>
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="max-h-[300px] sm:max-h-[350px] overflow-y-auto space-y-2 pr-1 min-w-0 w-full">
          {!selectedSection ? (
            <div className="py-16 md:py-20 text-center flex flex-col items-center opacity-20 uppercase tracking-widest select-none">
               <AlertCircle size={36} className="mb-2" />
               <p className="text-[9px] font-black">Choose a section</p>
            </div>
          ) : loadingStudents ? (
            <div className="py-16 flex justify-center w-full"><Loader2 className="animate-spin text-[#3a947e]" size={24} /></div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-slate-300 italic text-xs px-4">No active students verified in this section template.</div>
          ) : (
            students.map(s => (
              <div key={s.student.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-100 transition-all min-w-0 w-full text-left">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-tight break-words leading-tight">{s.student.fullname || "Unknown Student"}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1 truncate">ID: {s.student.id}</p>
                </div>
                <div className="flex gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-none border-slate-50/60 justify-end">
                  <button 
                    type="button" 
                    onClick={() => handleStatusChange(s.student.id, "PRESENT")} 
                    className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${attendanceData[s.student.id] === 'PRESENT' ? 'bg-[#062D24] text-[#3a947e] shadow-md' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                  >
                    <Check size={16} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleStatusChange(s.student.id, "ABSENT")} 
                    className={`p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 ${attendanceData[s.student.id] === 'ABSENT' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button 
          type="button" 
          onClick={handleSave} 
          disabled={submitting || students.length === 0} 
          className="w-full py-3.5 bg-[#062D24] text-[#3a947e] rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-all shrink-0 mt-2"
        >
          {submitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Submit Daily Attendance
        </button>
      </div>
    </DashboardModal>
  );
}