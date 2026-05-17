import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-600">
        
        {/* LEFT: Branding */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-[#3a947e] p-2 rounded-lg text-white">
              <GraduationCap size={18} />
            </div>
            <span className="font-bold text-[#2D362F]">SILID</span>
          </div>
          <p>
            A calm and modern student portal designed to simplify academic life.
          </p>
        </div>

        {/* CENTER: Links */}
        <div className="md:text-center">
          <h3 className="font-semibold text-[#2D362F] mb-3">Quick Links</h3>
          <div className="flex flex-col gap-2">
            <a href="#" className="hover:text-[#3a947e]">Github</a>
            <a href="#" className="hover:text-[#3a947e]">Facebook</a>
            <a href="#" className="hover:text-[#3a947e]">Instagram</a>
          </div>
        </div>

        {/* RIGHT: Contact */}
        <div id="contact" className="scroll-mt-24 md:text-right">
          <h3 className="font-semibold text-[#2D362F] mb-3">Contact</h3>
          <div className="flex flex-col gap-2 md:items-end">
            <div className="flex items-center gap-2">
              <Mail size={14} />
              <span>support@verdantlms.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} />
              <span>+63 912 345 6789</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>Philippines</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p>© 2026 SILID Student Portal. Calm by design.</p>
          <p>Built for school project · React · Spring Boot ready</p>
        </div>
      </div>
    </footer>
  );
}