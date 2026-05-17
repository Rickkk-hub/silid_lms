/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import StudentSidebar from "../../Components/Dashboard/Student/StudentSidebar";
import StudentAttendance from "../../Components/Dashboard/Student/StudentAttendance";
import StudentHeader from "../../Components/Dashboard/Student/StudentHeader";

export default function SAttendance() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F1F5F0] flex overflow-hidden">
      <StudentSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-hidden relative">
        <StudentHeader setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 w-full overflow-y-auto px-4 md:px-10 pb-12">
          <StudentAttendance />
        </main>
      </div>
    </div>
  );
}