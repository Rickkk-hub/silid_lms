/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Loader2, AlertCircle, TrendingUp } from 'lucide-react';

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true 
});

export default function StudentGrades() {
  const [user] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) { return null; }
  });

  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const currentUserId = useMemo(() => {
    return user?.userId || user?.userid || user?.id;
  }, [user]);

  const fetchGrades = useCallback(async (isMounted) => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const res = await api.get(`/grades/student/${currentUserId}`);
      if (isMounted) {
        setGrades(res.data || []);
        setTimeout(() => setIsReady(true), 50);
      }
    } catch (err) {
      console.error("Dynamic Grade Fetch Operational Failure:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    let isMounted = true;
    if (currentUserId) {
      setTimeout(() => {
        if (isMounted) {
          fetchGrades(isMounted);
        }
      }, 0);
    }
    return () => { isMounted = false; };
  }, [currentUserId, fetchGrades]);

  const analytics = useMemo(() => {
    const validGrades = grades.filter(g => g.average && !isNaN(g.average));
    const sum = validGrades.reduce((acc, curr) => acc + parseFloat(curr.average), 0);
    const rawAverage = validGrades.length > 0 ? (sum / validGrades.length).toFixed(2) : "0.00";

    const averageNum = parseFloat(rawAverage);
    let honorTrack = "Regular Academic Standing";
    
    if (averageNum >= 95.0) honorTrack = "Highest Honors (Summa Cum Laude Track)";
    else if (averageNum >= 90.0 && averageNum < 95.0) honorTrack = "High Honors (Magna Cum Laude Track)";
    else if (averageNum >= 85.0 && averageNum < 90.0) honorTrack = "With Honors (Cum Laude Track)";

    return {
      average: rawAverage,
      count: grades.length,
      honorTrack
    };
  }, [grades]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F0]">
      <Loader2 className="animate-spin text-[#3D967C]" size={42} />
    </div>
  );

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-[#F1F5F0] flex items-center justify-center font-serif text-slate-500 italic">
        Session expired. Please login to verify academic standings.
      </div>
    );
  }

  return (
    <main className={`p-4 md:p-10 pt-4 min-h-screen mx-auto bg-[#F1F5F0] text-left transition-all duration-700 ease-out ${
      isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}>
      <header className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-slate-800 tracking-tight uppercase">Academic Record</h1>
        <p className="text-[10px] font-black uppercase text-[#3D967C] tracking-[0.2em] mt-1">
          Authenticated Student Portal: {user?.fullname || "Verified Learner"} • 1st Semester • A.Y. 2025–2026
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-[#062D24] rounded-[2.5rem] p-8 text-white shadow-xl flex flex-col justify-center border border-emerald-900/30">
          <p className="text-[10px] font-black uppercase opacity-60 mb-2 tracking-widest">Weighted Average (GWA)</p>
          <h2 className="text-6xl font-bold mb-4 italic font-serif text-[#3D967C]">{analytics.average}%</h2>
          <div className="pt-4 border-t border-white/10">
            <p className="text-[9px] font-black uppercase tracking-wider text-teal-400 animate-pulse">
               {analytics.honorTrack}
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden">
          <h3 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={14} /> Historical Context Timeline
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4">
            <TrendCard period="Previous Sem GWA" gpa="89.50%" units="18 Academic Units" />
            <TrendCard period="Current Sem GWA" gpa={`${analytics.average}%`} units={`${analytics.count} Registered Classes`} active />
          </div>
        </div>
      </div>

      <section>
        <h3 className="text-xl font-bold text-slate-800 mb-6 uppercase tracking-tight font-serif">Subject Standings Ledger</h3>
        
        <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[40%]">Course Details</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Prelim</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Midterm</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Finals</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Final Standing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {grades.length > 0 ? grades.map((g) => (
                <GradeRow 
                  key={g.id} 
                  code={g.course?.code || g.courseCode || "CS"} 
                  title={g.course?.title || g.courseTitle || "Data Structure"} 
                  description={g.course?.description || g.courseDescription || "information system"}
                  prelim={g.prelims !== undefined ? Number(g.prelims).toFixed(2) : g.prelim !== undefined ? Number(g.prelim).toFixed(2) : "0.00"} 
                  midterm={g.midterms !== undefined ? Number(g.midterms).toFixed(2) : g.midterm !== undefined ? Number(g.midterm).toFixed(2) : "0.00"} 
                  finals={g.finals !== undefined ? Number(g.finals).toFixed(2) : "0.00"} 
                  standing={g.average !== undefined ? Number(g.average).toFixed(2) : "0.00"} 
                  remarks={g.remarks || "PASSED"}
                />
              )) : (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-slate-300 italic font-black text-[10px] uppercase tracking-widest">
                    No verified grades encoded or released for this account matrix yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-4">
          {grades.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl text-slate-300 italic text-xs uppercase font-black">No Grades Encoded</div>
          ) : (
            grades.map((g) => (
              <GradeMobileCard 
                key={g.id} 
                code={g.course?.code || g.courseCode || "CS"} 
                title={g.course?.title || g.courseTitle || "Data Structure"} 
                description={g.course?.description || g.courseDescription || "information system"}
                prelims={g.prelims !== undefined ? g.prelims : g.prelim} 
                midterms={g.midterms !== undefined ? g.midterms : g.midterm} 
                finals={g.finals} 
                average={g.average} 
                remarks={g.remarks} 
              />
            ))
          )}
        </div>

        <div className="mt-10 p-6 bg-white rounded-2xl border border-slate-100 flex items-start gap-4">
          <AlertCircle size={18} className="text-[#3D967C] shrink-0" />
          <p className="text-[11px] text-slate-500 italic leading-relaxed">
            Note Checkpoint: Passing grade is 75.00%. Official permanent academic standings are subject to direct Office of the Registrar validation at the end of the term ledger.
          </p>
        </div>
      </section>
    </main>
  );
}

const TrendCard = ({ period, gpa, units, active }) => (
  <div className={`flex-shrink-0 min-w-[180px] p-6 rounded-2xl border transition-all ${
    active ? 'border-[#3D967C] bg-emerald-50/30' : 'border-slate-50 bg-slate-50/30'
  }`}>
    <p className="text-[9px] font-black text-slate-400 mb-3 uppercase tracking-tighter">{period}</p>
    <h4 className="text-3xl font-serif font-bold text-slate-800 mb-1">{gpa}</h4>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{units}</p>
  </div>
);

const GradeRow = ({ code, title, description, prelim, midterm, finals, standing, remarks }) => (
  <tr className="hover:bg-slate-50/50 transition-colors group">
    <td className="p-6">
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-black text-[#3D967C] uppercase tracking-widest">{code}</p>
        <h4 className="text-base font-bold text-slate-800 font-serif uppercase">{title}</h4>
        <p className="text-xs text-slate-400 font-medium capitalize italic">{description}</p>
      </div>
    </td>
    <td className="p-6 text-sm font-bold text-slate-700 text-center">{prelim}</td>
    <td className="p-6 text-sm font-bold text-slate-700 text-center">{midterm}</td>
    <td className="p-6 text-sm font-bold text-slate-700 text-center">{finals}</td>
    <td className="p-6 text-right">
      <span className={`inline-block px-4 py-2 text-[11px] font-black rounded-xl min-w-[60px] text-center uppercase shadow-sm ${
        remarks === 'PASSED' ? 'bg-emerald-50 text-[#3D967C]' : 'bg-red-50 text-red-600'
      }`}>
        {standing}% ({remarks})
      </span>
    </td>
  </tr>
);

const GradeMobileCard = ({ code, title, description, prelims, midterms, finals, average, remarks }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm text-left">
    <div className="flex justify-between items-start mb-4 gap-4">
      <div className="flex flex-col gap-0.5">
        <p className="text-[10px] font-black text-[#3D967C] uppercase">{code}</p>
        <h4 className="text-lg font-bold text-slate-800 font-serif leading-tight uppercase">{title}</h4>
        <p className="text-xs text-slate-400 font-medium capitalize italic mt-0.5">{description}</p>
      </div>
      <div className="bg-[#062D24] text-[#3D967C] px-4 py-2 rounded-xl text-center shadow-sm shrink-0">
        <p className="text-[8px] font-black uppercase opacity-60">GWA</p>
        <p className="text-sm font-bold">{average ? Number(average).toFixed(2) : "0.00"}%</p>
      </div>
    </div>
    
    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
      <div className="text-center">
        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Prelim</p>
        <p className="text-sm font-bold text-slate-800">{prelims ? Number(prelims).toFixed(2) : '0.00'}</p>
      </div>
      <div className="text-center border-x border-slate-100">
        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Midterm</p>
        <p className="text-sm font-bold text-slate-800">{midterms ? Number(midterms).toFixed(2) : '0.00'}</p>
      </div>
      <div className="text-center">
        <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Finals</p>
        <p className="text-sm font-bold text-slate-800">{finals ? Number(finals).toFixed(2) : '0.00'}</p>
      </div>
    </div>
  </div>
);