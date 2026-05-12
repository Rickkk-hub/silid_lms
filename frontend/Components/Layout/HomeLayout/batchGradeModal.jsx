import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Save, X, Loader2, BookOpen } from 'lucide-react';
import DashboardModal from './DashboardModal'; 

export default function BatchGradeModal({ sectionId, isOpen, onClose, onRefresh }) {
  // sectionId here is actually the section name string (e.g., "BSIT-3A")
  const [studentEntries, setStudentEntries] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [gradingPeriod, setGradingPeriod] = useState("prelims"); // Default period

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
  if (isOpen && sectionId) {
    const loadData = async () => {
      try {
        setStudentEntries([]); 

        // 1. Fetch Students enrolled in this section
        const enrollRes = await axios.get(`http://localhost:8080/api/enrollments/teacher/${user.id}`);
        const enrolledInThisSection = enrollRes.data.filter(en => en.section === sectionId);

        // 2. Fetch existing Grades for this section to pre-fill the inputs
        const gradesRes = await axios.get(`http://localhost:8080/api/grades/teacher/${user.id}/section/${sectionId}`);

        // 3. Merge: If a grade exists, use it; otherwise, use 0
        const entries = enrolledInThisSection.map(en => {
          const existing = gradesRes.data.find(g => g.student.id === en.student.id);
          return {
            studentId: en.student?.id,
            studentName: en.student?.fullname || "Unknown Student", 
            prelims: existing ? existing.prelims : 0,
            midterms: existing ? existing.midterms : 0,
            finals: existing ? existing.finals : 0
          };
        });
        
        setStudentEntries(entries);
      } catch (err) {
        console.error("Batch Initialization error:", err);
      }
    };
    loadData();
  }
}, [isOpen, sectionId, user.id]);

  const handleScoreChange = (idx, value) => {
    const updated = [...studentEntries];
    const score = value === "" ? 0 : parseFloat(value);
    
    // Update the specific period being graded
    updated[idx][gradingPeriod] = score;
    setStudentEntries(updated);
  };

  const handleSaveAll = async () => {
    setSubmitting(true);
    try {
      // Map entries to match your backend GradeDTO.java
      // Since your Grade entity takes all 3 scores, we submit them as a set
      const promises = studentEntries.map(entry => {
        const payload = {
          studentId: entry.studentId,
          teacherId: user.id,
          section: sectionId,
          prelims: entry.prelims,
          midterms: entry.midterms,
          finals: entry.finals
        };
        return axios.post("http://localhost:8080/api/grades/submit", payload);
      });

      await Promise.all(promises);
      
      onRefresh(); 
      onClose();   
    } catch (err) {
      console.error("Failed to save batch grades:", err);
      alert("Error: " + (err.response?.data?.message || "Check connection"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardModal isOpen={isOpen} onClose={onClose} title="Batch Grade Entry">
      <div className="space-y-6">
        
        {/* Period Selector - Matches your Grade Entity fields */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Grading Period
          </label>
          <div className="flex gap-2">
            {['prelims', 'midterms', 'finals'].map((period) => (
              <button
                key={period}
                onClick={() => setGradingPeriod(period)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  gradingPeriod === period 
                  ? 'bg-[#3a947e] text-white shadow-lg shadow-emerald-900/20' 
                  : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Student List */}
        <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 scrollbar-hide">
          {studentEntries.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#3a947e]/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-[#3a947e]">
                  <User size={16} />
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-700">{entry.studentName}</span>
                   <span className="text-[9px] text-slate-400 font-bold uppercase uppercase">Student ID: {entry.studentId}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-300 uppercase">{gradingPeriod.charAt(0)}</span>
                <input 
                  type="number"
                  placeholder="0"
                  className="w-16 p-2.5 bg-[#F1F5F0] rounded-xl text-center font-black text-[#3a947e] text-sm outline-none border-none focus:ring-2 focus:ring-[#3a947e]/10"
                  value={entry[gradingPeriod]}
                  onChange={(e) => handleScoreChange(idx, e.target.value)}
                />
              </div>
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
            disabled={submitting || studentEntries.length === 0}
            className="flex-[2] py-4 bg-[#062D24] text-[#3a947e] rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#0a3d31] transition-all disabled:opacity-30 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Sync All Grades
          </button>
        </div>
      </div>
    </DashboardModal>
  );
}