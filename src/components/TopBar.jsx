import React, { useState, useEffect } from "react";
import { LogOut, Menu } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

function TopBar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation(); // Mendeteksi perpindahan halaman
  const [user, setUser] = useState(null);

  // Fungsi untuk mengambil data user terbaru dari localStorage
  const loadUserData = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    // Menyesuaikan fleksibilitas struktur data dari backend kamu
    const userData = storedUser?.data?.user || storedUser?.user || storedUser;
    setUser(userData);
  };

  // Efek berjalan setiap kali komponen muncul ATAU setiap kali user pindah halaman
  useEffect(() => {
    loadUserData();
  }, [location]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl flex justify-between items-center px-4 md:px-6 py-4">

      {/* Bagian Kiri: Tombol Menu + Welcome Message */}
      <div className="flex items-center space-x-4">
        {/* TOMBOL TOGGLE SIDEBAR */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-100 transition-all text-slate-700"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="text-xl md:text-2xl font-bold leading-tight hidden sm:block">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            {user?.name?.split(" ")[0] || "User"}
          </span>
        </h2>
      </div>

      {/* Bagian Kiri Sekunder untuk HP */}
      <h2 className="text-lg font-bold sm:hidden block absolute left-16">
        Hi, <span className="text-indigo-500">{user?.name?.split(" ")[0] || "User"}</span>
      </h2>

      {/* Right section */}
      <div className="flex items-center space-x-3 md:space-x-4">

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-red-100 rounded-full transition-all group"
        >
          <LogOut className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
        </button>

        {/* Profile Image */}
        <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-indigo-200 cursor-pointer shrink-0 bg-indigo-50 flex items-center justify-center">
          {user?.picture ? (
            <img
              src={user.picture}
              alt="User profile"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            // Fallback inisial huruf jika gambar google telat dimuat
            <span className="text-xs font-bold text-indigo-600">
              {user?.name?.substring(0, 1).toUpperCase() || "U"}
            </span>
          )}
        </div>

      </div>
    </header>
  );
}

export default TopBar;