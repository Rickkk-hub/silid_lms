import AssignHeader from "../../Components/Dashboard/Admin/AssignHeader";
import AdminSidebar from "../../Components/Dashboard/Admin/AdminSidebar";
import AdminAssign from "../../Components/Dashboard/Admin/AdminAssign";
import { useState } from "react";


export default function AdminA(){
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return(
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>
            
            <div className="flex-1 flex flex-col">
             <AssignHeader setSidebarOpen={setSidebarOpen}/>

              <main>
               <AdminAssign/>
              </main>
            </div>
        </div>
    )
}