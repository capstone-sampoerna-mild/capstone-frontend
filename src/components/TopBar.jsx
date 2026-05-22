import { Search, Bell, Sparkles, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

const storedUser = JSON.parse(localStorage.getItem("user"));
const user = storedUser?.data?.user;

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
    <header className="w-full sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl flex justify-between items-center px-6 py-4">

      {/* Search */}
      <div className="flex items-center space-x-8">
        <h2 className="text-2xl font-bold leading-tight">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {user?.name?.split(" ")[0]}
            </span>
          </h2>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">

        {/* AI Feature */}
        <Link
          to="/chat"
          className="p-2 hover:bg-slate-200/50 rounded-full transition-all"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-red-100 rounded-full transition-all group"
        >
          <LogOut className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
        </button>

        {/* Profile */}
        <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-indigo-200 cursor-pointer">
          <img
            src={user?.picture}
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