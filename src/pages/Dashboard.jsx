import { useState, useEffect, useRef } from "react"
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Building2,
  Loader2,
  Search,
  Star
} from "lucide-react"

import { Link } from "react-router-dom"

import {
  getJobRecommendation,
  uploadCV,
} from "../services/jobRole"

import api from "../services/api"
import SkillBadge from "../components/SkillBadge"
import InputSkill from "../components/InputSkill"

// SUB-KOMPONEN: Efek animasi ketik yang dikontrol state penanda (hasAnimated)
function TypingEffect({ text, speed = 15, shouldAnimate = true }) {
  const [displayedText, setDisplayedText] = useState(shouldAnimate ? "" : text)
  const indexRef = useRef(0)

  useEffect(() => {
    if (!shouldAnimate) {
      setDisplayedText(text)
      return
    }

    setDisplayedText("")
    indexRef.current = 0

    if (!text) return

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.substring(0, indexRef.current + 1))
        indexRef.current += 1
      } else {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed, shouldAnimate])

  return <span>{displayedText}</span>
}

function Dashboard() {
  // Ambil data user & token dari localStorage sesuai instruksi BE
  const storedUser = JSON.parse(localStorage.getItem("user"))
  const user = storedUser?.data?.user

  // Ambil token JWT
  const token = storedUser?.token || storedUser?.data?.token || localStorage.getItem("token")

  // ================= STATE =================
  // TOAST FIX: Sekarang diletakkan dengan benar di dalam komponen utama! 🎯
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [fileName, setFileName] = useState(() => sessionStorage.getItem("dashboard_fileName") || "")
  const [skills, setSkills] = useState(() => JSON.parse(sessionStorage.getItem("dashboard_skills")) || [])
  const [newSkill, setNewSkill] = useState("")
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(() => JSON.parse(sessionStorage.getItem("dashboard_recommendations")) || [])
  const [selectedFile, setSelectedFile] = useState(null)
  const [extractedSkills, setExtractedSkills] = useState(() => JSON.parse(sessionStorage.getItem("dashboard_extractedSkills")) || [])
  const [narrativeText, setNarrativeText] = useState(() => sessionStorage.getItem("dashboard_narrativeText") || "")

  // State Kontrol Animasi Ketik (Biar tidak ngetik ulang saat pindah-pindah halaman)
  const [hasAnimated, setHasAnimated] = useState(() => JSON.parse(sessionStorage.getItem("dashboard_hasAnimated")) || false)

  // State untuk Tab navigasi pada Card Top Role ('general' atau 'detail')
  const [activeTab, setActiveTab] = useState("general")

  // State untuk Roadmap (menangani endpoints /career/roadmap)
  const [roadmap, setRoadmap] = useState(() => JSON.parse(sessionStorage.getItem("dashboard_roadmap")) || [])
  const [roadmapLoading, setRoadmapLoading] = useState(false)

  // State untuk lowongan kerja dari BE baru
  const [jobRecommendations, setJobRecommendations] = useState(() => JSON.parse(sessionStorage.getItem("dashboard_jobs")) || [])
  const [jobLoading, setJobLoading] = useState(false)

  const resultRef = useRef(null)
  const jobRef = useRef(null)

  const topRole = recommendations[0]
  const otherRoles = recommendations.slice(1)

  // TOAST FIX: Fungsi dipindahkan ke dalam agar bisa mengakses setToast
  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // ================= EFFECTS FOR SESSION PERSISTENCE =================
  useEffect(() => {
    sessionStorage.setItem("dashboard_skills", JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    sessionStorage.setItem("dashboard_fileName", fileName);
  }, [fileName]);

  useEffect(() => {
    sessionStorage.setItem("dashboard_recommendations", JSON.stringify(recommendations));
    sessionStorage.setItem("dashboard_extractedSkills", JSON.stringify(extractedSkills));
  }, [recommendations, extractedSkills]);

  useEffect(() => {
    sessionStorage.setItem("dashboard_narrativeText", narrativeText);
  }, [narrativeText]);

  useEffect(() => {
    sessionStorage.setItem("dashboard_hasAnimated", JSON.stringify(hasAnimated));
  }, [hasAnimated]);

  useEffect(() => {
    sessionStorage.setItem("dashboard_roadmap", JSON.stringify(roadmap));
  }, [roadmap]);

  useEffect(() => {
    sessionStorage.setItem("dashboard_jobs", JSON.stringify(jobRecommendations));
  }, [jobRecommendations]);

  // Efek penata narasi otomatis
  useEffect(() => {
    if (recommendations.length > 0) {
      if (resultRef.current && !narrativeText) {
        resultRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }

      if (!narrativeText) {
        const ownedSkillNames = recommendations[0].user_skill
          ?.map((s) => s.skill)
          .join(", ")

        setNarrativeText(
          `Career path yang paling direkomendasikan untukmu saat ini adalah ${recommendations[0].role}. Kamu sudah memiliki modal dasar yang bagus dengan menguasai skill seperti ${ownedSkillNames || 'beberapa core skill'}. Untuk memperkecil gap dan mempercepat langkahmu menjadi seorang ${recommendations[0].role}, berikut adalah beberapa skill prioritas yang disarankan untuk kamu pelajari berikutnya:`
        )
      }
    } else {
      setNarrativeText("")
      setHasAnimated(false)
      sessionStorage.removeItem("dashboard_hasAnimated")
    }
  }, [recommendations, narrativeText])

  // Triger pemutus animasi ketik setelah durasi render awal terpenuhi
  useEffect(() => {
    if (narrativeText && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, narrativeText.length * 12 + 500);
      return () => clearTimeout(timer);
    }
  }, [narrativeText, hasAnimated]);

  const clearPreviousResults = () => {
    setRecommendations([])
    setExtractedSkills([])
    setNarrativeText("")
    setHasAnimated(false)
    setRoadmap([])
    setJobRecommendations([])
    setActiveTab("general")

    sessionStorage.removeItem("dashboard_recommendations")
    sessionStorage.removeItem("dashboard_extractedSkills")
    sessionStorage.removeItem("dashboard_narrativeText")
    sessionStorage.removeItem("dashboard_hasAnimated")
    sessionStorage.removeItem("dashboard_roadmap")
    sessionStorage.removeItem("dashboard_jobs")
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFileName("")
    sessionStorage.removeItem("dashboard_fileName")
    clearPreviousResults()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFileName(file.name)
      setSelectedFile(file)
      clearPreviousResults()
    }
  }

  const handleAddSkill = (e) => {
    e.preventDefault()
    if (!newSkill.trim()) return

    const parsedSkills = newSkill
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)

    const updatedSkills = [
      ...new Set([
        ...skills,
        ...parsedSkills,
      ]),
    ]

    setSkills(updatedSkills)
    setNewSkill("")
  }

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  // FUNGSI ROADMAP: Mengambil Data Roadmap dari Swagger POST /api/v1/career/roadmap
  const handleFetchRoadmap = async (skillGapsArray) => {
    try {
      setRoadmapLoading(true)
      const response = await api.post("/career/roadmap", {
        skillGaps: skillGapsArray
      })
      if (response.data && response.data.success) {
        setRoadmap(response.data.roadmap || [])
      }
    } catch (err) {
      console.error("Gagal mengambil data roadmap industri:", err)
    } finally {
      setRoadmapLoading(false)
    }
  }

  // ================= FUNGSI HANDLESAVE TO PATHWAY =================
  const handleSaveSkillToPathway = async (skillName) => {
    const actualUserId = user?.uid || (typeof storedUser === 'string' ? JSON.parse(storedUser)?.uid : storedUser?.uid);

    if (!actualUserId) {
      showNotification("Sesi user tidak valid. ID tidak ditemukan.", "error");
      return;
    }

    try {
      const response = await api.post("/pathway", {
        user_id: actualUserId,
        skill_name: skillName,
        target_role: topRole?.role || "General Path"
      });

      if (response.status === 201 || response.data?.success) {
        showNotification(`Skill "${skillName}" berhasil disimpan ke target pembelajaran profile!`, "success");

        try {
          const currentSkillGaps = roadmap && roadmap.length > 0 ? roadmap.map(item => item.skill) : [skillName];
          await api.post("/career/roadmap", { skillGaps: currentSkillGaps });
        } catch (roadmapErr) {
          console.log("Abaikan jika optional:", roadmapErr);
        }
      }
    } catch (err) {
      console.error("Gagal menambahkan ke target pembelajaran:", err);
      showNotification(err.response?.data?.message || "Gagal menambahkan skill.", "error");
    }
  };

  // ================= FUNGSI ANALISIS CV (TOMBOL UTAMA) =================
  const handleAnalyze = async () => {
    try {
      clearPreviousResults()
      setLoading(true)

      let responseData;
      if (selectedFile) {
        responseData = await uploadCV({
          file: selectedFile,
          skills,
          name: user?.name,
        })
      } else {
        const payload = {
          name: user?.name || "Anonymous",
          skillset: skills,
        }
        responseData = await getJobRecommendation(payload)
      }

      const detectedSkills = responseData?.extracted_skills || []
      const recommendedRoles = responseData?.top_roles || []

      setExtractedSkills(detectedSkills)
      setRecommendations(recommendedRoles)

      // AUTOMATION ROADMAP INTEGRATION
      if (recommendedRoles.length > 0) {
        const primaryRole = recommendedRoles[0]
        const totalSkillsToLearn = primaryRole.recommended_skill_to_learn || []
        const currentActiveSkills = detectedSkills.length > 0 ? detectedSkills : skills

        const computedGaps = totalSkillsToLearn.filter(
          (recSkill) => !currentActiveSkills.some(
            (ownSkill) => ownSkill.toLowerCase() === (typeof recSkill === 'object' ? recSkill.skill.toLowerCase() : recSkill.toLowerCase())
          )
        ).map(s => typeof s === 'object' ? s.skill : s)

        if (computedGaps.length > 0) {
          await handleFetchRoadmap(computedGaps)
        }
      }

    } catch (error) {
      console.error("ANALYZE ERROR:", error)
      showNotification("Failed to generate AI recommendation", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleFetchJobs = async () => {
    const activeSkills = extractedSkills.length > 0 ? extractedSkills : skills;

    if (activeSkills.length === 0) {
      showNotification("Silakan masukkan skill atau lakukan analisis CV terlebih dahulu.", "error");
      return;
    }

    try {
      setJobLoading(true)
      setJobRecommendations([])

      const response = await api.post("/jobs/recommendations", {
        skillset: activeSkills
      });

      const result = response.data;

      if (result && (result.status === 'success' || result.status === 'ok')) {
        setJobRecommendations(result.data.jobs || []);

        setTimeout(() => {
          jobRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } else {
        console.error('Gagal mengambil data:', result?.message);
        showNotification(`Gagal memuat lowongan: ${result?.message || 'Error internal server'}`, "error");
      }
    } catch (jobError) {
      console.error("Terjadi kesalahan koneksi/request:", jobError);
      const errorMsg = jobError.response?.data?.message || "Terjadi kesalahan koneksi ke server loker.";
      showNotification(errorMsg, "error");
    } finally {
      setJobLoading(false)
    }
  }

  return (
    <div className="w-full max-w-none space-y-12 relative">

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div className="w-full">
          <h3 className="text-indigo-500 font-semibold text-sm tracking-widest uppercase mb-2 block">
            Insights Engine
          </h3>
          <p className="text-slate-500 mt-3">
            Discover your ideal career path powered by AI analysis.
          </p>
        </div>
      </header>

      {/* CONTENT */}
      <div className="grid grid-cols-12 gap-6">

        {/* INPUT PANEL SKILL & CV */}
        <div className="col-span-12 space-y-4">
          <InputSkill
            handleAnalyze={handleAnalyze}
            skills={skills}
            loading={loading}
            handleFileChange={handleFileChange}
            handleAddSkill={handleAddSkill}
            fileName={fileName}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            handleRemoveSkill={handleRemoveSkill}
            handleRemoveFile={handleRemoveFile}
          />
        </div>

        {/* AREA HASIL REKOMENDASI KARIER */}
        {recommendations.length > 0 && (
          <div ref={resultRef} className="col-span-12 mt-6 scroll-mt-24 space-y-12">
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold">Recommended Career Paths</h3>
                <p className="text-sm text-slate-500">Matches found based on your AI analysis</p>
              </div>

              {/* Detected Core Skill Menggunakan Persentase */}
              {extractedSkills.length > 0 && (
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Detected Core Skills & Market Demand ({extractedSkills.length})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {extractedSkills.map((sk, idx) => {
                      const matchedItem = roadmap.find(r => r.skill.toLowerCase() === sk.toLowerCase());
                      const rawUrgensi = matchedItem ? parseInt(matchedItem.skor_urgensi) : null;
                      const demandPercentage = (!isNaN(rawUrgensi) && rawUrgensi !== null) ? `${rawUrgensi}%` : `${85 + (idx % 3) * 5}%`;

                      return (
                        <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex flex-col justify-between">
                          <span className="text-sm font-semibold text-slate-800 truncate" title={sk}>{sk}</span>
                          <div className="mt-2 flex items-center justify-between text-xs border-t border-slate-50 pt-1.5">
                            <span className="text-slate-400">Demand Rate:</span>
                            <span className="font-bold text-indigo-600 bg-indigo-50/60 px-1.5 py-0.5 rounded">
                              {demandPercentage}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* CARD TOP ROLE DENGAN SISTEM TWO-TABS */}
              {topRole && (
                <div className="w-full bg-white border border-slate-100 rounded-2xl p-0 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col min-w-0 overflow-hidden">

                  <div className="p-6 pb-4 border-b border-slate-50 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xl break-words">{topRole.role}</h4>
                      <p className="text-xs text-slate-400 mt-1">Highest matching career path</p>
                    </div>
                    <span className="shrink-0 text-sm font-bold px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                      {(topRole.confidence * 100).toFixed(0)}% Match
                    </span>
                  </div>

                  {/* NAVIGASI TAB UTAMA */}
                  <div className="flex bg-slate-50/70 px-6 border-b border-slate-100">
                    <button
                      onClick={() => setActiveTab("general")}
                      className={`py-3 px-4 text-sm font-bold border-b-2 transition-all ${activeTab === "general"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                        }`}
                    >
                      General Info
                    </button>
                    <button
                      onClick={() => setActiveTab("detail")}
                      className={`py-3 px-4 text-sm font-bold border-b-2 transition-all ${activeTab === "detail"
                        ? "border-indigo-600 text-indigo-600"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                        }`}
                    >
                      Market Demand (Details)
                    </button>
                  </div>

                  {/* KONTEN BERDASARKAN TAB AKTIF */}
                  <div className="p-6 flex-1">
                    {activeTab === "general" ? (
                      <div className="space-y-6 animate-in fade-in duration-200">
                        <p className="text-sm text-slate-600 leading-relaxed min-h-[40px]">
                          <TypingEffect text={narrativeText} speed={12} shouldAnimate={!hasAnimated} />
                          {!hasAnimated && <span className="inline-block w-1 h-4 bg-indigo-500 ml-1 animate-pulse" />}
                        </p>
                        <div className="space-y-2">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Recommended skills to learn:
                          </p>
                          <SkillBadge skills={topRole.recommended_skill_to_learn?.slice(0, 10) || []} ai={true} />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Prioritas Skill Gaps Berdasarkan Kebutuhan Bursa Loker Aktif:</span>
                        </p>

                        {roadmapLoading ? (
                          <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                            <span>Mengkalkulasi tingkat urgensi bursa kerja...</span>
                          </div>
                        ) : roadmap.length > 0 ? (
                          <div className="space-y-2.5">
                            {roadmap.map((step, index) => {
                              const percentVal = step.skor_urgensi?.includes('%') ? step.skor_urgensi : `${step.skor_urgensi}%`;
                              return (
                                <div
                                  key={index}
                                  className="bg-amber-50/40 border border-amber-100 rounded-xl p-3.5 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-amber-50 transition-colors"
                                >
                                  <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                                        {step.langkah ?? (index + 1)}
                                      </span>
                                      <div>
                                        <span className="font-bold text-slate-800">Pelajari "{step.skill}"</span>
                                        <span className="text-[10px] bg-indigo-50 text-indigo-600 ml-2 px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider">
                                          {step.kategori || "Technical"}
                                        </span>
                                      </div>
                                    </div>

                                    {/* TOMBOL STAR UNTUK TRIGGER KE DATABASE 🚀 */}
                                    <button
                                      onClick={() => handleSaveSkillToPathway(step.skill)}
                                      // FIX: Mengubah text-slate-400 (abu-abu) sebagai default, dan hover:text-amber-400 hover:border-amber-300 untuk efek kuning
                                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-300 transition-colors shadow-sm ml-2 group/star"
                                      title="Tambahkan ke wishlist pembelajaran profile"
                                    >
                                      <Star className="w-4 h-4 fill-none group-hover/star:fill-amber-400 transition-colors" />
                                    </button>
                                  </div>
                                  <p className="text-xs text-slate-500 sm:text-right">
                                    karena dicari sebanyak <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-sm">{percentVal}</span> di industri saat ini.
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 italic pl-1">
                            Skillset utamamu sudah lengkap memenuhi kebutuhan pasar industri utama role ini.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Alternative Paths */}
              {activeTab === "general" && otherRoles.length > 0 && (
                <div className="space-y-4 pt-4 animate-in fade-in duration-500">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Alternative Career Paths</h4>
                    <p className="text-xs text-slate-400">Pilihan karier lain yang juga cocok dengan kualifikasimu</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {otherRoles.map((item, i) => (
                      <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 text-base break-words">{item.role}</h4>
                            <p className="text-xs text-slate-400 mt-1">Alternative path</p>
                          </div>
                          <span className="shrink-0 text-xs font-semibold px-2.5 py-1 bg-slate-50 text-slate-600 rounded-full">
                            {(item.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex-1">
                          <SkillBadge skills={item.recommended_skill_to_learn?.slice(0, 8) || []} ai={true} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* UTILITY BUTTON */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={handleFetchJobs}
                disabled={jobLoading || loading}
                className="w-full sm:w-auto bg-white border-2 border-indigo-600 text-indigo-600 font-bold px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm"
              >
                {jobLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mencari Lowongan...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Cari Rekomendasi Lowongan Pekerjaan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* SEKSI TAMPILAN REKOMENDASI PEKERJAAN */}
        {(jobRecommendations.length > 0 || jobLoading) && (
          <div ref={jobRef} className="col-span-12 pt-6 border-t border-slate-100 space-y-6 scroll-mt-24 animate-in fade-in duration-300">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-500" />
                <span>Real-world Job Openings for You</span>
              </h3>
              <p className="text-sm text-slate-500">
                Pekerjaan aktif di database yang paling relevan dengan skillset terdeteksimu
              </p>
            </div>

            {jobLoading ? (
              <div className="min-h-[150px] bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
                <p className="text-xs text-slate-400 font-medium">Matching vacancies from companies...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobRecommendations.map((job, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-indigo-100 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-200">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors" title={job.title}>
                          {job.title || "Untitled Role"}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {job.company || "Unknown Company"}
                        </p>
                        {job.location && (
                          <p className="text-xs text-slate-400 mt-1">
                            📍 {job.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Actively Hiring
                      </span>
                      {job.job_url ? (
                        <a
                          href={job.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
                        >
                          Apply Job →
                        </a>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 cursor-not-allowed">
                          No Link Available
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="text-xs text-slate-500 pt-6 border-t">
        © 2026 SkillsGap AI Platform
      </footer>

      {/* ================= UI TOAST NOTIFICATION MODERN ================= */}
      <div
        className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border backdrop-blur-md transition-all duration-300 transform ${toast.show
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-95 pointer-events-none"
          } ${toast.type === "success"
            ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
            : "bg-rose-50/90 border-rose-200 text-rose-800"
          }`}
      >
        {toast.type === "success" ? (
          <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm animate-bounce">
            ✓
          </div>
        ) : (
          <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
            ✕
          </div>
        )}

        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-wide uppercase opacity-60">
            {toast.type === "success" ? "System Success" : "System Error"}
          </span>
          <p className="text-sm font-semibold mt-0.5">{toast.message}</p>
        </div>

        <button
          onClick={() => setToast({ ...toast, show: false })}
          className="ml-3 text-slate-400 hover:text-slate-600 font-medium text-sm p-1 rounded-md transition-colors"
        >
          ✕
        </button>
      </div>

    </div>
  );
}

export default Dashboard;