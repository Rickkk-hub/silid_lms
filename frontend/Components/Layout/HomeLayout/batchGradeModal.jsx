/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { User, Save, X, Loader2, AlertTriangle } from 'lucide-react';
import DashboardModal from './DashboardModal'; 

export default function BatchGradeModal({ sectionId, isOpen, onClose, onRefresh }) {
  const [studentEntries, setStudentEntries] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [gradingPeriod, setGradingPeriod] = useState("prelims");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const teacherUserId = user.userId || user.id;

  const apiBaseUrl = "http://localhost:8080/api";

  useEffect(() => {
    if (isOpen && sectionId && teacherUserId) {
      const loadData = async () => {
        try {
          setStudentEntries([]); 
          const [enrollRes, gradesRes] = await Promise.all([
            axios.get(`${apiBaseUrl}/enrollments/teacher/${teacherUserId}`),
            axios.get(`${apiBaseUrl}/grades/teacher/${teacherUserId}/section/${sectionId}`)
          ]);

          // CRITICAL SAFETY FILTER: Siguraduhing may valid at active student associations 
          // ang mga kukuning records para sa partikular na section na ito
          const enrolledInThisSection = (enrollRes.data || []).filter(
            en => en.section === sectionId && en.student && en.student.id
          );

          const entries = enrolledInThisSection.map(en => {
            // SAFE LOOKUP CHECK: Defensive structure para sa existing records data lookup
            const existing = (gradesRes.data || []).find(
              g => g.student && g.student.id && String(g.student.id) === String(en.student.id)
            );

            return {
              studentId: en.student.id,
              studentName: en.student.fullname || "Unknown Student", 
              prelims: existing ? (existing.prelims || 0) : 0,
              midterms: existing ? (existing.midterms || 0) : 0,
              finals: existing ? (existing.finals || 0) : 0
            };
          });
          
          setStudentEntries(entries);
        } catch (err) {
          console.error("Batch Initialization error:", err);
        }
      };
      loadData();
    }
  }, [isOpen, sectionId, teacherUserId]);

  const handleScoreChange = (idx, value) => {
    const updated = [...studentEntries];
    let score = value === "" ? 0 : parseFloat(value);
    
    if (isNaN(score)) score = 0;
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    updated[idx][gradingPeriod] = score;
    setStudentEntries(updated);
  };

  const handleSaveAll = async () => {
    const hasInvalidGrade = studentEntries.some(en => 
      en.prelims > 100 || en.midterms > 100 || en.finals > 100 ||
      en.prelims < 0 || en.midterms < 0 || en.finals < 0
    );

    if (hasInvalidGrade) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'One or more grades are outside the valid range (0-100). Please review your entries.',
        confirmButtonColor: '#3a947e'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Submission?',
      text: `This will sync all grades for section ${sectionId}. Are you sure?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3a947e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Sync All'
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    try {
      // BULK GUARD FILTER: Siguraduhing walang makakalusot na records na may null o undefined studentId
      const targetPayloads = studentEntries
        .filter(entry => entry.studentId != null)
        .map(entry => ({
          studentId: entry.studentId,
          teacherId: teacherUserId,
          section: sectionId,
          prelims: entry.prelims,
          midterms: entry.midterms,
          finals: entry.finals
        }));

      if (targetPayloads.length === 0) {
        Swal.fire('Info', 'No active student records available to sync.', 'info');
        setSubmitting(false);
        return;
      }

      // Isang parallel request array composition na may valid structured objects
      const promises = targetPayloads.map(payload => 
        axios.post(`${apiBaseUrl}/grades/submit`, payload)
      );

      await Promise.all(promises);
      
      await Swal.fire({
        icon: 'success',
        title: 'Grades Synced!',
        text: `Successfully updated academic records for ${sectionId}`,
        timer: 2000,
        showConfirmButton: false
      });

      onRefresh(); 
      onClose();   
    } catch (err) {
      console.error("Failed to save batch grades:", err);
      Swal.fire({
        icon: 'error',
        title: 'Sync Error',
        text: err.response?.data?.message || "Internal Server Error. Please check your network payload mappings.",
        confirmButtonColor: '#062D24'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardModal isOpen={isOpen} onClose={onClose} title="Batch Grade Entry">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Grading Period
          </label>
          <div className="flex gap-2">
            {['prelims', 'midterms', 'finals'].map((period) => (
              <button
                key={period}
                type="button"
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

        <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 scrollbar-hide">
          {studentEntries.length === 0 ? (
             <div className="py-10 text-center text-slate-300 text-xs italic">No officially enrolled active students found in this section template.</div>
          ) : (
            studentEntries.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#3a947e]/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-[#3a947e]">
                    <User size={16} />
                  </div>
                  <div className="flex flex-col text-left">
                     <span className="text-xs font-bold text-slate-700">{entry.studentName}</span>
                     <span className="text-[9px] text-slate-400 font-bold uppercase">ID: {entry.studentId}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-300 uppercase">{gradingPeriod.charAt(0)}</span>
                  <input 
                    type="number"
                    placeholder="0"
                    className="w-16 p-2.5 bg-[#F1F5F0] rounded-xl text-center font-black text-[#3a947e] text-sm outline-none border-none focus:ring-2 focus:ring-[#3a947e]/10"
                    value={entry[gradingPeriod] === 0 ? "" : entry[gradingPeriod]}
                    onChange={(e) => handleScoreChange(idx, e.target.value)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSaveAll}
            disabled={submitting || studentEntries.length === 0}
            className="flex-[2] py-4 bg-[#062D24] text-[#3a947e] rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#0a3d31] transition-all disabled:opacity-30 flex items-center justify-center gap-2 shadow-xl"
          >
            {submitting ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Sync All Grades
          </button>
        </div>
      </div>
    </DashboardModal>
  );
}