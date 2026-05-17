import { useState } from "react";
import StudentSidebar from "../../Components/Dashboard/Student/StudentSidebar";
import StudentLearningHub from "../../Components/Dashboard/Student/StudentLearningHub";
import StudentHeader from "../../Components/Dashboard/Student/StudentHeader";


export default function SLearningHub(){
    const[sidebarOpen, setSidebarOpen] = useState(false);
    return(
        <div className="min-h-screen bg-gray-50 flex">
            <StudentSidebar open={sidebarOpen} setOpen={setSidebarOpen}/>
            <div className="flex-1 flex flex-col min-h-screen">
                <StudentHeader setSidebarOpen={setSidebarOpen}/>
                <main>
                  <StudentLearningHub/>                    
                </main>
            </div>
        </div>
    )
}