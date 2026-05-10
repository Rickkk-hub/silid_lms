import LoginForm from "../../Components/Layout/LoginLayout/LoginForm";
import LoginHeader from "../../Components/Layout/LoginLayout/LoginHeader";

export default function Login() {
  return (
    // Changed h-screen to min-h-screen and removed overflow-hidden
    <div className="min-h-screen flex flex-col bg-[#F8F9F5]">
      
      {/* Header */}
      <header className="flex-shrink-0">
        <LoginHeader />
      </header>

      {/* Content - Main area that pushes footer to bottom */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <LoginForm />
      </main>

    </div>
  );
}