import React, { useState } from "react";
import TeacherSidebar from "../../Components/Dashboard/Teacher/TeacherSidebar";
import GradesHeader from "../../Components/Dashboard/Teacher/GradesHeader";
import TeacherGrades from "../../Components/Dashboard/Teacher/TeacherGrades";

export default function TGrade() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F1F5F0] flex overflow-hidden w-full fixed inset-0">
      <TeacherSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative">
        <GradesHeader setSidebarOpen={setSidebarOpen} />
        <main className="w-full h-[calc(100vh-80px)] overflow-y-auto px-4 md:px-10 pb-12 block clear-both content-start">
          <TeacherGrades />
        </main>
      </div> 
    </div>
  );
}