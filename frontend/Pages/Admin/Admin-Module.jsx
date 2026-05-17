import React, { useState } from "react";
import AdminSidebar from "../../Components/Dashboard/Admin/AdminSidebar";
import AdminModule from "../../Components/Dashboard/Admin/AdminModule";
import ModuleHeader from "../../Components/Dashboard/Admin/ModuleHeader";

export default function AdminM(){
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return(
    <div className="min-h-screen bg-[#F1F5F0] flex overflow-hidden w-full fixed inset-0">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>

      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative">
        <ModuleHeader setSidebarOpen={setSidebarOpen}/>

        <main className="w-full h-[calc(100vh-80px)] overflow-y-auto px-4 md:px-10 pb-12 block clear-both content-start">
          <AdminModule/>
        </main>
      </div>
    </div>
  )
}