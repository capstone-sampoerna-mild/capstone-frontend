import React, { useState, useEffect } from "react";
import { Mail, Code2, Loader2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import api from "../services/api";

function Profile() {
  const location = useLocation(); // Untuk memicu render ulang saat pindah halaman
  const [profileData, setProfileData] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Ambil data lokal dari localStorage tiap kali masuk halaman
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userData = storedUser?.data?.user || storedUser?.user || storedUser;
    setUser(userData);

    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        // 2. Ambil data dinamis (skills) dari Backend
        const response = await api.get("/auth/profile"); 
        setProfileData(response.data.data || response.data);
      } catch (error) {
        console.error("Gagal memuat data CV/Profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [location]); // 🚀 Berjalan otomatis setiap kali pindah ke halaman profile

  // Menampung array skills hasil ekstraksi dari database nantinya
  const extractedSkills = profileData?.skills || ["React", "UI/UX", "AI Tools", "Tailwind", "Node.js", "Express", "PostgreSQL"];

  // Loading Screen (Skeleton/Spinner)
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-500 font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* HEADER PROFILE (MINIMALIS & SEGERA MUNCUL) */}
      <section className="bg-white rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm border border-slate-100">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={user?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-50"
            alt="Profile Avatar"
          />
        </div>

        {/* Info Nama & Email */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {user?.name || "User Name"}
          </h2>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500">
            <Mail className="w-4 h-4 text-indigo-500" /> 
            <span>{user?.email || "loading email..."}</span>
          </div>
        </div>
      </section>

      {/* SKILLS CONTAINER */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-indigo-500" />
            <span>Extracted Core Skills</span>
          </h3>
          <span className="text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
            Total {extractedSkills.length} Skills
          </span>
        </div>

        {/* Grid System */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {extractedSkills.length > 0 ? (
            extractedSkills.map((skill, i) => {
              const skillName = typeof skill === "object" ? skill.name : skill;
              return (
                <div 
                  key={i} 
                  className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-200">
                      {skillName.substring(0, 2).toUpperCase()}
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm pt-2 truncate">
                      {skillName}
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-wider font-medium">
                    Verified Skill
                  </p>
                </div>
              );
            })
          ) : (
            <div className="col-span-full bg-slate-50 border border-dashed border-slate-200 p-8 rounded-2xl text-center">
              <p className="text-sm text-slate-400 italic">
                No skills extracted yet. Please upload your CV on the dashboard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-[11px] text-slate-400 pt-8 border-t border-slate-100">
        © 2026 SkillsGap AI Platform
      </footer>

    </div>
  );
}

export default Profile;