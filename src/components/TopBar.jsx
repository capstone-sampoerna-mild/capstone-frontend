import { Search, Bell, Sparkles, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

function TopBar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Logout Firebase
      await signOut(auth);

      // Hapus session
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect login
      navigate("/login");

    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl flex justify-between items-center px-12 py-6">

      {/* Search */}
      <div className="flex items-center space-x-8">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />

          <input
            type="text"
            placeholder="Search insights..."
            className="bg-white border border-slate-200 rounded-full pl-10 pr-6 py-2 text-sm w-64 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">

        {/* AI Feature */}
        <Link
          to="/chat"
          className="p-2 hover:bg-slate-200/50 rounded-full transition-all"
        >
          <Sparkles className="w-5 h-5 text-indigo-500" />
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-red-100 rounded-full transition-all group"
        >
          <LogOut className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
        </button>

        {/* Profile */}
        <div className="h-10 w-10 rounded-full overflow-hidden ring-2 ring-indigo-200 cursor-pointer">
          <img
            src="https://picsum.photos/seed/user/100/100"
            alt="User profile"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

      </div>
    </header>
  );
}

export default TopBar;