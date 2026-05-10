import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Save, X, Loader2 } from 'lucide-react';
import DashboardModal from './DashboardModal'; 

export default function BatchGradeModal({ sectionId, isOpen, onClose, onRefresh }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [studentEntries, setStudentEntries] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Only run if the modal is actually open and we have a valid sectionId
    if (isOpen && sectionId) {
      const loadData = async () => {
        try {
          // Add a clear to previous state so user doesn't see old data
          setStudentEntries([]); 
          setTasks([]);

          // 1. Fetch Tasks - Ensure backend has @GetMapping("/section/{sectionId}")
          const tasksRes = await axios.get(`http://localhost:8080/api/tasks/section/${sectionId}`);
          setTasks(tasksRes.data || []);

          // 2. Fetch Enrollments
          const enrollRes = await axios.get(`http://localhost:8080/api/enrollments/section/${sectionId}`);
          
          // CRITICAL: Verify your EnrollmentDTO property names here
          const entries = enrollRes.data.map(en => ({
            enrollmentId: en.id,
            // Fallback chain to ensure name appears
            studentName: en.studentName || en.fullname || "Unknown Student", 
            score: "" 
          }));
          
          setStudentEntries(entries);
        } catch (err) {
          console.error("Batch Initialization error:", err);
          // Optional: Add a state for 'error' and display it in the UI
        }
      };
      loadData();
    }
  }, [isOpen, sectionId]);

  const handleScoreChange = (idx, value) => {
    const updated = [...studentEntries];
    // Allow empty string so user can delete, otherwise parse to number
    updated[idx].score = value === "" ? "" : parseFloat(value);
    setStudentEntries(updated);
  };

  const handleSaveAll = async () => {
    if (!selectedTask) return;
    setSubmitting(true);
    try {
      // FIX: Removed 'remarks' because it is not in your Java GradeDTO
      const payload = studentEntries.map(entry => ({
        enrollmentId: entry.enrollmentId,
        taskId: selectedTask,
        score: entry.score === "" ? 0 : entry.score // Default to 0 if empty
      }));

      console.log("Submitting payload:", payload); // Debugging line

      await axios.post("http://localhost:8080/api/grades/batch", payload);
      
      onRefresh(); 
      onClose();   
    } catch (err) {
      console.error("Failed to save batch grades:", err);
      alert("Failed to save: " + (err.response?.data?.message || "Check backend console"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardModal isOpen={isOpen} onClose={onClose} title="Batch Grade Entry">
      <div className="space-y-6">
        
        {/* Task Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Assignment</label>
          <select 
            className="w-full p-4 bg-[#F1F5F0] rounded-2xl font-bold text-sm text-slate-700 outline-none border-none focus:ring-2 focus:ring-[#3a947e]/20 cursor-pointer"
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
          >
            <option value="">— Select Task —</option>
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.title} ({t.gradingPeriod})</option>
            ))}
          </select>
        </div>

        {/* Scrollable Student List */}
        <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 scrollbar-hide">
          {studentEntries.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#3a947e]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-[#3a947e]">
                  <User size={16} />
                </div>
                <span className="text-xs font-bold text-slate-700">{entry.studentName}</span>
              </div>
              <input 
                type="number"
                placeholder="0.00"
                className="w-20 p-2.5 bg-[#F1F5F0] rounded-xl text-center font-black text-[#3a947e] text-sm outline-none border-none focus:ring-2 focus:ring-[#3a947e]/10"
                value={entry.score}
                onChange={(e) => handleScoreChange(idx, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="pt-4 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSaveAll}
            disabled={!selectedTask || submitting}
            className="flex-[2] py-4 bg-[#062D24] text-[#3a947e] rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#0a3d31] transition-all disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Commit Grades
          </button>
        </div>
      </div>
    </DashboardModal>
  );
}