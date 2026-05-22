import { MessageSquare, User, LayoutDashboard, Route, Settings, HelpCircle, Zap, Users, LogOut } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"

import { signOut } from "firebase/auth"
import { auth } from "../services/firebase"

// simple className helper (pengganti cn dari TS project)
function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  // { icon: MessageSquare, label: "Home", path: "/" },
  { icon: User, label: "Profile", path: "/profile" },
  // { icon: Route, label: "Learning Path", path: "/learning-path" },
  // { icon: Users, label: "Mentors", path: "/mentors" },
]

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Logout Firebase
      await signOut(auth);

      // Hapus local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect login
      navigate("/login");

    } catch (error) {
      console.error("Logout Error:", error);
    }
  };
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-100 dark:bg-slate-950 flex flex-col py-8 z-50">

      {/* Logo */}
      <div className="px-8 mb-12">
        <h1 className="text-xl font-black text-indigo-600 dark:text-indigo-400">
          SkillsGap
        </h1>
        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-500 mt-1">
          AI Career Navigator
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-4 px-6 py-3 text-slate-500 dark:text-slate-400 hover:translate-x-1 hover:text-indigo-500 transition-all duration-200",
                isActive && "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-300 rounded-r-full shadow-sm font-bold"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="tracking-wide text-xs uppercase">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Menu */}
      <div className="mt-auto border-t border-slate-200/50 pt-6">

        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-4 px-6 py-3 text-slate-500 dark:text-slate-400 hover:translate-x-1 hover:text-red-500 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />

          <span className="tracking-wide text-xs uppercase">
            Logout
          </span>
        </button>

      </div>

    </aside>
  )
}

export default Sidebar