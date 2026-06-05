import React, { useState, useEffect } from "react";
import { Mail, Star, Loader2, Code2, CheckCircle, Circle } from "lucide-react"; 
import { useLocation } from "react-router-dom";
import api from "../services/api";

function Profile() {
  const location = useLocation(); 
  const [user, setUser] = useState(null);
  const [extractedSkills, setExtractedSkills] = useState([]); 
  const [starredSkills, setStarredSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfileData = async (userData) => {
    if (!userData?.uid) return;

    try {
      const [skillsetResponse, pathwayResponse] = await Promise.all([
        api.get("/profile/skillset"),          
        api.get(`/pathway/${userData.uid}`)    
      ]);

      // Handle Extracted Skills
      if (skillsetResponse.data) {
        const fetchedSkills = skillsetResponse.data.skills || skillsetResponse.data.data?.skills || [];
        setExtractedSkills(fetchedSkills);
      }

      // FIX DI SINI: Menggunakan nama variabel pathwayResponse yang benar 🎯
      if (pathwayResponse.data) {
        const dataArray = Array.isArray(pathwayResponse.data) 
          ? pathwayResponse.data 
          : (pathwayResponse.data.data || []);
        setStarredSkills(dataArray);
      } else {
        setStarredSkills([]);
      }

    } catch (error) {
      console.error("Gagal memuat data profile dari backend:", error);
      setStarredSkills([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userData = storedUser?.data?.user || storedUser?.user || storedUser;
    setUser(userData);

    if (userData) {
      setIsLoading(true);
      fetchProfileData(userData);
    }
  }, [location]); 

  // Fungsi mengubah status skill (learning <-> completed)
  const handleToggleStatus = async (pathwayId, currentStatus) => {
    const nextStatus = currentStatus === "completed" ? "learning" : "completed";

    try {
      const response = await api.patch(`/pathway/${pathwayId}/status`, {
        status: nextStatus 
      });

      if (response.status === 200 || response.data?.success) {
        setStarredSkills((prevSkills) =>
          prevSkills.map((item) =>
            item.id === pathwayId ? { ...item, status: nextStatus } : item
          )
        );
      }
    } catch (err) {
      console.error("Gagal memperbarui status skill:", err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* HEADER PROFILE */}
      <section className="bg-white rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm border border-slate-100">
        <div className="relative shrink-0">
          <img
            src={user?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-50"
            alt="Profile Avatar"
          />
        </div>

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

      {/* LOADING / UI CONTAINER */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-2 bg-slate-50/50 rounded-2xl border border-slate-100">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500 font-medium">Memuat data profil kamu dari server...</p>
        </div>
      ) : (
        <>
          {/* BAGIAN 1: EXTRACTED SKILLSET */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-500" />
                <span>Extracted Skillset (Dari Resume Kamu)</span>
              </h3>
              <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-100">
                Total {extractedSkills.length} Skill Terdeteksi
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {extractedSkills.length > 0 ? (
                extractedSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-white border border-slate-100 hover:border-indigo-200 text-slate-700 rounded-xl text-sm font-medium shadow-sm transition-all duration-150"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <div className="w-full py-6 text-center text-sm text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Belum ada data skill ter-extract dari resume Anda. Silakan unggah resume terlebih dahulu.
                </div>
              )}
            </div>
          </section>

          {/* BAGIAN 2: STARRED SKILLS LEARNING PATHWAY */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-current" />
                <span>Target Pembelajaran Skillset (Starred)</span>
              </h3>
              <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-100">
                Total {starredSkills.length} Target
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {starredSkills.length > 0 ? (
                starredSkills.map((item, i) => {
                  const skillName = typeof item === "object" ? item.skill_name : item;
                  const targetRole = item?.target_role || "General Path";
                  const isCompleted = item?.status === "completed";

                  return (
                    <div 
                      key={i} 
                      className={`bg-white border p-5 rounded-2xl shadow-sm transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ${
                        isCompleted ? "border-emerald-200 bg-emerald-50/20" : "border-slate-100 hover:shadow-md hover:border-amber-200"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-colors duration-200 ${
                            isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white"
                          }`}>
                            <Star className={`w-4 h-4 ${isCompleted ? "fill-emerald-600" : "fill-current"}`} />
                          </div>
                          
                          <button
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                              isCompleted 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                                : "bg-white text-slate-400 border-slate-200 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50"
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 fill-emerald-200 text-emerald-600" />
                                <span>Done</span>
                              </>
                            ) : (
                              <>
                                <Circle className="w-3.5 h-3.5" />
                                <span>Mark Done</span>
                              </>
                            )}
                          </button>
                        </div>
                        
                        <div>
                          <h4 className={`font-bold text-base transition-all duration-200 ${
                            isCompleted ? "text-slate-400 line-through decoration-emerald-500/50" : "text-slate-800"
                          }`}>
                            {skillName}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-medium italic truncate max-w-[200px] mt-1">
                            Target: {targetRole}
                          </p>
                          <p className={`text-xs font-semibold mt-2 ${isCompleted ? "text-emerald-600" : "text-amber-600"}`}>
                            Status: {isCompleted ? "Selesai Dipelajari 🎉" : "Sedang Dipelajari"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full py-12 text-center text-sm text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Belum ada skill rekomendasi yang kamu bintangi. Buka dashboard hasil analisa untuk menambahkan!
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Profile;