import TeacherSidebar from "../../Components/Dashboard/Teacher/TeacherSidebar";
import TeacherHeader from "../../Components/Dashboard/Teacher/TeacherHeader";
import TeacherOverview from "../../Components/Dashboard/Teacher/TeacherOverview";
import { useState } from "react";


export default function TDashboardLayout(){
    const[sidebarOpen, setSideBarOpen] = useState(false);

    return(
        <div className="min-h-screen bg-gray-50 flex">
           <TeacherSidebar open={sidebarOpen} setOpen={setSideBarOpen} />

           <div className="flex-1 flex flex-col min-h-screen">
              <TeacherHeader setSidebarOpen={setSideBarOpen}/>

              <main>
             <TeacherOverview/>
              </main>
           </div>
        </div>
    )
}