import TeacherSidebar from "../../Components/Dashboard/Teacher/TeacherSidebar";
import TeacherRecord from "../../Components/Dashboard/Teacher/TeacherRecord";
import RecordHeader from "../../Components/Dashboard/Teacher/RecordHeader";
import { useState } from "react";

export default function TRecord(){
  const [sidebarOpen, setSidebarOpen] = useState(false);

    return(
        <div className="flex min-h-screen bg-gray-50">
          <TeacherSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>
          <div className="flex-1 flex flex-col min-w-0">
            <RecordHeader setSidebarOpen={setSidebarOpen}/>
            <main className="w-full">
                <TeacherRecord/>
            </main>
          </div>
        </div>
    )
}