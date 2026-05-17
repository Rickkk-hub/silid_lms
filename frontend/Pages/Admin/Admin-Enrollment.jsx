import React, { useState } from "react";
import EnrollmentHeader from "../../Components/Dashboard/Admin/EnrollmentHeader";
import AdminSidebar from "../../Components/Dashboard/Admin/AdminSidebar";
import AdminEnrollment from "../../Components/Dashboard/Admin/AdminEnrollment";

export default function AdminE(){
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return(
    <div className="min-h-screen bg-[#F1F5F0] flex overflow-hidden w-full fixed inset-0">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>

      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative">
        <EnrollmentHeader setSidebarOpen={setSidebarOpen}/>

        <main className="w-full h-[calc(100vh-80px)] overflow-y-auto px-4 md:px-10 pb-12 block clear-both content-start">
          <AdminEnrollment/>
        </main>
      </div>
    </div>
  )
}