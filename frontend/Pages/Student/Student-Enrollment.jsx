/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import StudentSidebar from "../../Components/Dashboard/Student/StudentSidebar";
import StudentEnrollment from "../../Components/Dashboard/Student/StudentEnrollment";
import StudentHeader from "../../Components/Dashboard/Student/StudentHeader";

export default function SEnrollment() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F1F5F0] flex overflow-hidden w-full fixed inset-0">
      <StudentSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative">
        <StudentHeader setSidebarOpen={setSidebarOpen} />

        <main className="w-full h-[calc(100vh-80px)] overflow-y-auto px-4 md:px-10 pb-12 block clear-both content-start">
          <StudentEnrollment />
        </main>
      </div>
    </div>
  );
}