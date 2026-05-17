
import React, { useState } from "react";
import TeacherSidebar from "../../Components/Dashboard/Teacher/TeacherSidebar";
import AttendanceHeader from "../../Components/Dashboard/Teacher/AttendanceHeader";
import TeacherAttendance from "../../Components/Dashboard/Teacher/TeacherAttendance";

export default function TAttendance() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F1F5F0] flex overflow-hidden w-full fixed inset-0"> 
      <TeacherSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative">
        <AttendanceHeader setSidebarOpen={setSidebarOpen} />
        <main className="w-full h-[calc(100vh-80px)] overflow-y-auto px-4 md:px-10 pb-12 block clear-both content-start">
          <TeacherAttendance />
        </main>
      </div>
    </div>
  );
}