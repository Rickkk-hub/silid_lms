import { useState } from "react";
import EnrollmentHeader from "../../Components/Dashboard/Student/EnrollmentHeader";
import StudentSidebar from "../../Components/Dashboard/Student/StudentSidebar";
import StudentEnrollment from "../../Components/Dashboard/Student/StudentEnrollment";

export default function SEnrollment() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#F1F5F0]">
      <StudentSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col">
        <EnrollmentHeader setSidebarOpen={setSidebarOpen} />
        <main> 
          <StudentEnrollment />
        </main>
      </div>
    </div>
  );
}