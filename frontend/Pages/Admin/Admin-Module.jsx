import ModuleHeader from "../../Components/Dashboard/Admin/ModuleHeader";
import AdminSidebar from "../../Components/Dashboard/Admin/AdminSidebar";
import AdminModule from "../../Components/Dashboard/Admin/AdminModule";
import { useState } from "react";

export default function AdminM(){
    const [sidebarOpen, setSidebarOpen] = useState (false);
    return(
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>

            <div className="flex-1 flex flex-col min-h-screen">
                <ModuleHeader setSidebarOpen={setSidebarOpen}/>

                <main>
                <AdminModule/>
                </main>
            </div>
        </div>
    )
}