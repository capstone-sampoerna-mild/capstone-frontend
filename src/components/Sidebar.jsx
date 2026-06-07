import { User, LayoutDashboard, LogOut, X, Clock } from "lucide-react"
import { NavLink, useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../services/firebase"

function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Clock, label: "History", path: "/history" },
  { icon: User, label: "Profile", path: "/profile" },
]

const AppLogo = ({ className = "w-9 h-9" }) => (
  <div className={`flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 rounded-xl shrink-0 ${className}`}>
    <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      sessionStorage.clear()
      navigate("/login")
    } catch (error) {
      console.error("Logout Error:", error)
    }
  }

  return (
    <>
      {/* OVERLAY MOBILE: Hanya aktif di layar kecil (<768px) jika sedang terbuka */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* SIDEBAR PANEL */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 bg-slate-950 flex flex-col py-8 border-r border-slate-900 transition-transform duration-300 ease-in-out",
          // 💡 SOLUSI KUNCI: Di HP mengikuti isOpen, di desktop juga menyembunyikan diri jika isOpen = false
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* TOMBOL CLOSE KHUSUS HP */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white md:hidden p-2 rounded-lg hover:bg-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        {/* BRAND LOGO */}
        <div className="px-6 mb-10 mt-4 flex items-start gap-3">
          <AppLogo />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white tracking-wide leading-tight">
              AI Skill & <br /> Career Pathway
            </h1>
            <p className="text-[10px] tracking-widest uppercase text-indigo-400 font-semibold mt-0.5">
              Analyzer
            </p>
          </div>
        </div>

        {/* MENU NAVIGASI */}
        <nav className="flex-1 space-y-1.5 pr-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setIsOpen(false)
                }
              }}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3.5 px-6 py-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-900/60 transition-all duration-200 rounded-r-xl",
                  isActive && "bg-slate-900 text-indigo-400 font-bold border-l-4 border-indigo-500"
                )
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="tracking-wider text-xs uppercase font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* UTILITY LOGOUT */}
        <div className="mt-auto border-t border-slate-900 pt-4 pr-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3.5 px-6 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-900/40 transition-all duration-200 rounded-r-xl"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="tracking-wider text-xs uppercase font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar