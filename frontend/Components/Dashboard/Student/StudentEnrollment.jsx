/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Clock, Plus, Loader2, FileText, MapPin, RefreshCw } from 'lucide-react';

const api = axios.create({ baseURL: "http://localhost:8080/api", withCredentials: true });

export default function StudentEnrollment() {
  const [user] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState([]);
  const [available, setAvailable] = useState([]);
  const [isReady, setIsReady] = useState(false);

  const refreshData = useCallback(async (isMounted) => {
    const currentId = user?.id || user?.userId;
    if (!currentId) return;

    try {
      const [enRes, avRes] = await Promise.all([
        api.get(`/enrollments/student/${currentId}`),
        api.get(`/enrollments/open`) 
      ]);

      if (isMounted) {
        setEnrolled(enRes.data || []);
        setAvailable(avRes.data || []);
        setTimeout(() => setIsReady(true), 50);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    
    setTimeout(() => {
      if (isMounted) {
        refreshData(isMounted);
      }
    }, 0);

    return () => { isMounted = false; };
  }, [refreshData]);

  const studentCourseStatusMap = useMemo(() => {
    const statusMap = new Map();
    enrolled.forEach(en => {
      if (en.course?.id) {
        statusMap.set(en.course.id, en.status);
      }
    });
    return statusMap;
  }, [enrolled]);

  const handleRequest = async (enrollmentId) => {
    const result = await Swal.fire({
      title: 'Enrollment Request',
      text: "Submit application for this subject?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#062D24',
      confirmButtonText: 'Confirm'
    });

    if (result.isConfirmed) {
      try {
        const payload = { 
          enrollmentId, 
          studentId: user?.id || user?.userId 
        };
        const response = await api.post('/enrollments/enroll', payload);
        if (response.data.success) {
          await Swal.fire('Success', response.data.message || 'Application submitted!', 'success');
          setIsReady(false);
          setLoading(true);
          refreshData(true);
        } else {
          Swal.fire('Warning', response.data.message || 'Request denied.', 'warning');
        }
      } catch (err) { 
        const errorMessage = err.response?.data?.message || 'Server connection failed.';
        Swal.fire('Error', errorMessage, 'error'); 
      }
    }
  };

  const totalUnits = useMemo(() => enrolled.reduce((a, b) => a + (b.course?.units || 0), 0), [enrolled]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F0]">
      <Loader2 className="animate-spin text-[#3D967C]" size={42} />
    </div>
  );

  return (
    <div className={`w-full pt-4 md:pt-6 space-y-6 md:space-y-8 text-left transition-all duration-700 ease-out transform-gpu ${
      isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}>
      <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-slate-800">Enrollment Portal</h1>
          <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase mt-1 tracking-widest">
            ID: {user?.id || user?.userId} • {user?.fullname || 'Student'}
          </p>
        </div>
        <button 
          onClick={() => {
            setIsReady(false);
            setLoading(true);
            refreshData(true);
          }} 
          className="w-fit p-3 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-[#3D967C] transition-all active:scale-95"
        >
          <RefreshCw size={18} />
        </button>
      </header>

      <div className="bg-[#062D24] rounded-[2rem] p-6 md:p-8 text-white flex justify-between items-center shadow-xl border-b-8 border-[#3D967C]">
        <div>
          <p className="text-[10px] font-black uppercase text-[#3D967C] tracking-widest mb-1.5">Total Academic Units</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold italic">{totalUnits} of 21 Units</h2>
        </div>
        <FileText size={32} className="text-[#3D967C] shrink-0" />
      </div>

      <section>
        <h3 className="text-lg md:text-xl font-serif italic font-bold text-slate-800 mb-6">Registered Subjects</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {enrolled.map(en => (
            <div key={en.id} className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col justify-between min-w-0">
               <div>
                 <div className="flex justify-between items-center mb-6 gap-2">
                   <span className="text-[10px] font-black text-[#3D967C] bg-emerald-50 px-3.5 py-1.5 rounded-xl uppercase border border-emerald-100 truncate">{en.course?.code}</span>
                   <span className={`text-[8px] md:text-[9px] font-black px-2.5 py-1 rounded-lg uppercase border shrink-0 ${en.status === 'ACTIVE' ? 'bg-emerald-50 text-[#3D967C] border-emerald-100' : 'bg-orange-50 text-orange-500 border-orange-100'}`}>
                      {en.status}
                   </span>
                 </div>
                 <h4 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 font-serif break-words leading-tight">{en.course?.title}</h4>
               </div>
               <div className="space-y-2 text-slate-500 text-[10px] md:text-[11px] font-bold uppercase pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-3"><Clock size={14} className="text-[#3D967C] shrink-0" /> <span className="truncate">{en.schedule}</span></div>
                  <div className="flex items-center gap-3"><MapPin size={14} className="text-[#3D967C] shrink-0" /> <span className="truncate">Room {en.room || "TBA"}</span></div>
               </div>
            </div>
          ))}
          {enrolled.length === 0 && <p className="text-slate-300 italic text-sm py-4 pl-2">No subjects found in registry.</p>}
        </div>
      </section>

      <section>
        <h3 className="text-lg md:text-xl font-serif italic font-bold text-slate-800 mb-6">Available Course Catalog</h3>
        
        <div className="hidden lg:block overflow-hidden bg-white rounded-[2.5rem] border border-slate-100 shadow-sm min-w-0">
          <table className="w-full text-left">
            <thead className="bg-[#062D24] text-[10px] font-black text-[#3D967C] uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5">Code</th>
                <th className="px-4 py-5">Subject Details</th>
                <th className="px-4 py-5">Schedule</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {available.length > 0 ? available.map(item => {
                const currentStatusOfCourse = studentCourseStatusMap.get(item.course?.id);
                return (
                  <tr key={item.id} className="hover:bg-emerald-50/10 group transition-colors">
                    <td className="px-8 py-6">
                      <span className="bg-[#062D24] text-[#3D967C] px-3 py-1.5 rounded-xl text-[10px] font-black group-hover:bg-[#3D967C] group-hover:text-white transition-colors">
                        {item.course?.code}
                      </span>
                    </td>
                    <td className="px-4 py-6">
                      <div className="font-bold text-slate-800 font-serif text-lg">{item.course?.title}</div>
                      <div className="text-[9px] text-[#3D967C] font-black uppercase mt-0.5">Section {item.section}</div>
                    </td>
                    <td className="px-4 py-6 text-sm text-slate-500 font-bold uppercase">{item.schedule}</td>
                    <td className="px-8 py-6 text-right">
                      {currentStatusOfCourse === 'ACTIVE' ? (
                        <span className="text-[10px] font-black bg-emerald-50 text-[#3D967C] border border-emerald-100 px-4 py-2.5 rounded-xl uppercase tracking-wider cursor-not-allowed">
                          Enrolled
                        </span>
                      ) : currentStatusOfCourse === 'PENDING' ? (
                        <span className="text-[10px] font-black bg-orange-50 text-orange-500 border border-orange-100 px-4 py-2.5 rounded-xl uppercase tracking-wider cursor-not-allowed">
                          Requested
                        </span>
                      ) : (
                        <button onClick={() => handleRequest(item.id)} className="bg-[#062D24] text-[#3D967C] p-4 rounded-2xl active:scale-90 transition-all hover:bg-[#3D967C] hover:text-white shadow-sm">
                          <Plus size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="4" className="py-20 text-center opacity-20 uppercase font-black text-[10px] tracking-[0.3em]">
                    No subject offers available at this time.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden space-y-4">
          {available.length > 0 ? available.map(item => {
            const currentStatusOfCourse = studentCourseStatusMap.get(item.course?.id);
            return (
              <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-2.5">
                    <span className="bg-[#062D24] text-[#3D967C] px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0">{item.course?.code}</span>
                    <span className="text-[9px] text-[#3D967C] font-bold uppercase bg-emerald-50/50 px-2 py-0.5 rounded-md truncate">Section {item.section}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 font-serif text-base break-words leading-tight">{item.course?.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-2 flex items-center gap-1.5">
                    <Clock size={12} className="text-[#3D967C]" /> {item.schedule}
                  </p>
                </div>
                <div className="flex sm:justify-end shrink-0 pt-3 sm:pt-0 border-t sm:border-none border-slate-50">
                  {currentStatusOfCourse === 'ACTIVE' ? (
                    <span className="text-[9px] font-black bg-emerald-50 text-[#3D967C] border border-emerald-100 px-4 py-2 rounded-xl uppercase tracking-wider w-full sm:w-auto text-center">Enrolled</span>
                  ) : currentStatusOfCourse === 'PENDING' ? (
                    <span className="text-[9px] font-black bg-orange-50 text-orange-500 border border-orange-100 px-4 py-2 rounded-xl uppercase tracking-wider w-full sm:w-auto text-center">Requested</span>
                  ) : (
                    <button onClick={() => handleRequest(item.id)} className="w-full sm:w-auto bg-[#062D24] text-[#3D967C] py-2.5 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
                      <Plus size={14} /> Request Subject
                    </button>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="p-12 text-center bg-white rounded-3xl text-slate-300 italic text-xs uppercase font-black tracking-widest">No Offers Available</div>
          )}
        </div>
      </section>
    </div>
  );
}