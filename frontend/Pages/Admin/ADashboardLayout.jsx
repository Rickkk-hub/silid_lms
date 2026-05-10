import { useState } from "react";
import AdminHeader from "../../Components/Dashboard/Admin/AdminHeader";
import AdminOverview from "../../Components/Dashboard/Admin/AdminOverview";
import AdminSidebar from "../../Components/Dashboard/Admin/AdminSidebar";


export default function ADashboardLayout(){
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return(
        <div className="min-h-screen bg-gray-50 flex">
           <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>

           <div className="flex-1 flex flex-col min-h-screen">
            <AdminHeader setSidebarOpen={setSidebarOpen}/>

            <main>
                <AdminOverview/>
            </main>
           </div>
        </div>
    )
}