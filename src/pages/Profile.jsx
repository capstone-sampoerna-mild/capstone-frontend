import React, { useState, useEffect } from "react";
import { Mail, Star, Loader2, Code2, CheckCircle, Circle, Trash2, RotateCcw } from "lucide-react"; 
import { useLocation } from "react-router-dom";
import api from "../services/api";
import ConfirmModal from "../components/ConfirmModal"; // 1. IMPORT MODAL BARU DI SINI 👈

function Profile() {
  const location = useLocation(); 
  const [user, setUser] = useState(null);
  const [extractedSkills, setExtractedSkills] = useState([]); 
  const [starredSkills, setStarredSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // 2. STATE UNTUK CONFIG MODAL TAILWIND UI
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "", // "delete_single" atau "reset_all"
    title: "",
    message: "",
    targetId: null
  });

  const fetchProfileData = async (userData) => {
    if (!userData?.uid) return;
    try {
      const [skillsetResponse, pathwayResponse] = await Promise.all([
        api.get(`/profile/skillset?userId=${userData.uid}`),          
        api.get(`/pathway/${userData.uid}`)    
      ]);
      if (skillsetResponse.data && skillsetResponse.data.status === "ok") {
        const fetchedSkills = skillsetResponse.data.data?.skills || skillsetResponse.data.skills || [];
        setExtractedSkills(fetchedSkills);
      }
      if (pathwayResponse.data) {
        const dataArray = Array.isArray(pathwayResponse.data) ? pathwayResponse.data : (pathwayResponse.data.data || []);
        setStarredSkills(dataArray);
      }
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const userData = storedUser?.data?.user || storedUser?.user || storedUser;
    setUser(userData);
    if (userData) { setIsLoading(true); fetchProfileData(userData); }
  }, [location]); 

  const handleToggleStatus = async (pathwayId, currentStatus) => {
    const nextStatus = currentStatus === "completed" ? "learning" : "completed";
    try {
      await api.patch(`/pathway/${pathwayId}/status`, { status: nextStatus });
      setStarredSkills(prev => prev.map(item => item.id === pathwayId ? { ...item, status: nextStatus } : item));
    } catch (err) { console.error(err); }
  };

  // 3. FUNGSI UNTUK MEMBUKA MODAL
  const triggerDeleteModal = (pathwayId, skillName) => {
    setModalConfig({
      isOpen: true,
      type: "delete_single",
      title: "Hapus Target Pembelajaran",
      message: `Apakah kamu yakin ingin menghapus skill "${skillName.toUpperCase()}" dari target pembelajaran kamu? Tindakan ini akan menghapus data permanen.`,
      targetId: pathwayId
    });
  };

  const triggerResetModal = () => {
    setModalConfig({
      isOpen: true,
      type: "reset_all",
      title: "Reset Semua Target",
      message: "PERINGATAN! Apakah kamu yakin ingin MENGHAPUS SEMUA skill dari target pembelajaran kamu? Tindakan ini tidak bisa dibatalkan.",
      targetId: null
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // 4. EKSEKUSI PENGHAPUSAN DI BACKEND
  const handleConfirmAction = async () => {
    setIsActionLoading(true);
    try {
      if (modalConfig.type === "delete_single") {
        const response = await api.delete(`/pathway/${modalConfig.targetId}`);
        if (response.status === 200 || response.data?.success) {
          setStarredSkills(prev => prev.filter(item => item.id !== modalConfig.targetId));
        }
      } else if (modalConfig.type === "reset_all") {
        if (!user?.uid) return;
        const response = await api.delete(`/pathway/user/${user.uid}/reset`);
        if (response.status === 200 || response.data?.success) {
          setStarredSkills([]);
        }
      }
      closeModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* --- UI PROFILE HEADER & EXTRACTED SKILLS TETAP SAMA --- */}
      <section className="bg-white rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm border border-slate-100">
        <div className="relative shrink-0">
          <img src={user?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-50" alt="Avatar"/>
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{user?.name || "User Name"}</h2>
          <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-500">
            <Mail className="w-4 h-4 text-indigo-500" /> <span>{user?.email}</span>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center gap-2 bg-slate-50/50 rounded-2xl border border-slate-100">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          {/* SKILLSET FROM RESUME */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Code2 className="w-5 h-5 text-indigo-500" /><span>Extracted Skillset</span></h3>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {extractedSkills.map((skill, index) => <span key={index} className="px-4 py-2 bg-white border border-slate-100 text-slate-700 rounded-xl text-sm font-medium shadow-sm">{skill}</span>)}
            </div>
          </section>

          {/* STARRED LEARNING PATHWAY */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-current" />
                <h3 className="text-lg font-bold text-slate-800">Target Pembelajaran</h3>
              </div>

              {/* TRIGGER MODAL RESET ALL */}
              {starredSkills.length > 0 && (
                <button onClick={triggerResetModal} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold rounded-xl border border-rose-200/60">
                  <RotateCcw className="w-3.5 h-3.5" /><span>Reset All Checklist</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {starredSkills.map((item, i) => {
                const skillName = typeof item === "object" ? item.skill_name : item;
                const isCompleted = item?.status === "completed";
                return (
                  <div key={i} className={`bg-white border p-5 rounded-2xl shadow-sm flex flex-col justify-between ${isCompleted ? "border-emerald-200 bg-emerald-50/20" : "border-slate-100"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={() => handleToggleStatus(item.id, item.status)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${isCompleted ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-400"}`}>
                        {isCompleted ? "✓ Done" : "Mark Done"}
                      </button>

                      {/* TRIGGER MODAL HAPUS SATUAN */}
                      <button onClick={() => triggerDeleteModal(item.id, skillName)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-600 border border-slate-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className={`font-bold text-base ${isCompleted ? "text-slate-400 line-through" : "text-slate-800"}`}>{skillName}</h4>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {/* ======================================================================= */}
      {/* 5. PEMANGGILAN KOMPONENT MODAL CUSTOM YANG SUDAH DIPISAH FILENYA       */}
      {/* ======================================================================= */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirmAction}
        title={modalConfig.title}
        message={modalConfig.message}
        isLoading={isActionLoading}
      />
    </div>
  );
}

export default Profile;