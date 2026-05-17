import { useState } from "react";
import AdminHeader from "../../Components/Dashboard/Admin/AdminHeader";
import AdminOverview from "../../Components/Dashboard/Admin/AdminOverview";
import AdminSidebar from "../../Components/Dashboard/Admin/AdminSidebar";

export default function ADashboardLayout(){
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return(
    <div className="min-h-screen bg-[#F9FBFA] flex overflow-hidden w-full fixed inset-0">
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>

      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative">
        <AdminHeader setSidebarOpen={setSidebarOpen}/>

        <main className="w-full h-[calc(100vh-80px)] overflow-y-auto px-4 md:px-10 pb-12 block clear-both content-start">
          <AdminOverview/>
        </main>
      </div>
    </div>
  )
}