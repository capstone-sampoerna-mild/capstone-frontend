import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import TopBar from "../components/TopBar"

function MainLayout() {
  // Biarkan state awal true agar default-nya terbuka saat pertama dimuat
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      {/* Sidebar menerima status dan fungsi toggle */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Konten Utama: Lebar padding kiri bergeser mulus mengikuti state di layar desktop */}
      <div
        className={`
          flex-1
          w-full
          transition-all
          duration-300
          ease-in-out
          ${isOpen ? "md:pl-64" : "md:pl-0"}
        `}
      >
        {/* TopBar menerima fungsi toggle untuk tombol hamburger-nya */}
        <TopBar isOpen={isOpen} setIsOpen={setIsOpen} />

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout