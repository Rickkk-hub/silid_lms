import { useState } from "react";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clear old session
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      const response = await axios.post(
        "http://localhost:8080/api/users/login",
        { email, password }
      );

      // 1. Check if the backend returned a successful response
      if (response.data?.success) {
        const data = response.data;

        // 2. SAFE ROLE PARSING: Use optional chaining and nullish coalescing
        // This prevents the "toUpperCase of null" error
        const finalRole = (data.role || "GUEST").toUpperCase();

        // 3. MAP DATA TO STORAGE: Aligning with 'userid' from ResultDTO
        const storageData = {
          id: data.userid, 
          fullname: data.fullname || "User",
          email: data.email,
          role: finalRole,
        };

        // 4. SAVE TO LOCAL STORAGE
        localStorage.setItem("user", JSON.stringify(storageData));
        localStorage.setItem("role", finalRole);

        Swal.fire({
          icon: "success",
          title: "Welcome Back!",
          text: `Logged in as ${storageData.fullname}`,
          timer: 1500,
          showConfirmButton: false,
          background: "#F1F5F0",
        });

        // 5. REDIRECT BASED ON ROLE
        setTimeout(() => {
          if (finalRole === "ADMIN") navigate("/AdminDashboard");
          else if (finalRole === "TEACHER") navigate("/TeacherDashboard");
          else if (finalRole === "STUDENT") navigate("/StudentDashboard");
          else navigate("/");
        }, 1600);
      } else {
        // Handle cases where success is false but didn't throw an error
        // eslint-disable-next-line no-undef
        throw new Error(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login Error:", error);

      // Handle both 401 (Unauthorized) and 500 (Server Error)
      const errorMessage =
        error.response?.data?.message ||
        "Connection failed. Please check if the backend is running.";

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: errorMessage,
        background: "#F1F5F0",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#F1F5F0] backdrop-blur-md border border-gray-200 rounded-3xl shadow-lg p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">Sign in</h2>
          <p className="text-sm text-gray-500">
            Use your school account to continue.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </label>
            <div className="flex items-center mt-1 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus-within:ring-2 focus-within:ring-[#3a947e]/20 focus-within:border-[#3a947e] transition-all">
              <Mail size={16} className="text-gray-400 mr-2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="silid.lms@school.edu"
                className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-gray-500">
              <label>Password</label>
              <span className="text-[#3a947e] cursor-pointer hover:underline normal-case">
                Forgot?
              </span>
            </div>
            <div className="flex items-center mt-1 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus-within:ring-2 focus-within:ring-[#3a947e]/20 focus-within:border-[#3a947e] transition-all">
              <Lock size={16} className="text-gray-400 mr-2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 
            bg-gradient-to-r from-[#3a947e] to-[#4fb79f] 
            hover:from-[#2d7362] hover:to-[#3fa58f] 
            text-white py-3.5 rounded-xl text-sm font-semibold 
            shadow-sm hover:shadow-md disabled:opacity-70
            transition-all duration-300 active:scale-[0.98] mt-2"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Sign in to portal
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}