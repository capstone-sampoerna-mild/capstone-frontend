import { useState, useEffect, useRef } from "react"
import { Loader2, Search, Star } from "lucide-react"

import { getJobRecommendation, uploadCV } from "../services/jobRole"
import api from "../services/api"

// IMPORT COMPONENTS
import InputSkill from "../components/InputSkill"
import SkillBadge from "../components/SkillBadge"
import Toast from "../components/Toast"
import DetectedSkills from "../components/DetectedSkills"
import CareerPathCard from "../components/CareerPathCard"
import JobRecommendations from "../components/JobRecommendations"

function Dashboard() {
  const storedUser = JSON.parse(localStorage.getItem("user"))
  const user = storedUser?.data?.user

  // ================= STATE =================
  const [toast, setToast] = useState({ show: false, message: "", type: "success" })
  const [fileName, setFileName] = useState(() => sessionStorage.getItem("dashboard_fileName") || "")
  const [skills, setSkills] = useState(() => JSON.parse(sessionStorage.getItem("dashboard_skills")) || [])
  const [newSkill, setNewSkill] = useState("")
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(() => JSON.parse(sessionStorage.getItem("dashboard_recommendations")) || [])
  const [selectedFile, setSelectedFile] = useState(null)
  const [extractedSkills, setExtractedSkills] = useState(() => JSON.parse(sessionStorage.getItem("dashboard_extractedSkills")) || [])
  const [narrativeText, setNarrativeText] = useState(() => sessionStorage.getItem("dashboard_narrativeText") || "")
  const [hasAnimated, setHasAnimated] = useState(() => JSON.parse(sessionStorage.getItem("dashboard_hasAnimated")) || false)
  const [activeTab, setActiveTab] = useState("general")
  const [roadmap, setRoadmap] = useState(() => JSON.parse(sessionStorage.getItem("dashboard_roadmap")) || [])
  const [roadmapLoading, setRoadmapLoading] = useState(false)
  const [jobRecommendations, setJobRecommendations] = useState(() => JSON.parse(sessionStorage.getItem("dashboard_jobs")) || [])
  const [jobLoading, setJobLoading] = useState(false)
  const [pathwayCompletedSkills, setPathwayCompletedSkills] = useState([]);

  const resultRef = useRef(null)
  const jobRef = useRef(null)

  const topRole = recommendations[0]
  const otherRoles = recommendations.slice(1)

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" })
    }, 3000)
  }

  // ================= EFFECTS FOR PERSISTENCE =================
  useEffect(() => { sessionStorage.setItem("dashboard_skills", JSON.stringify(skills)) }, [skills])
  useEffect(() => { sessionStorage.setItem("dashboard_fileName", fileName) }, [fileName])
  useEffect(() => {
    sessionStorage.setItem("dashboard_recommendations", JSON.stringify(recommendations))
    sessionStorage.setItem("dashboard_extractedSkills", JSON.stringify(extractedSkills))
  }, [recommendations, extractedSkills])
  useEffect(() => { sessionStorage.setItem("dashboard_narrativeText", narrativeText) }, [narrativeText])
  useEffect(() => { sessionStorage.setItem("dashboard_hasAnimated", JSON.stringify(hasAnimated)) }, [hasAnimated])
  useEffect(() => { sessionStorage.setItem("dashboard_roadmap", JSON.stringify(roadmap)) }, [roadmap])
  useEffect(() => { sessionStorage.setItem("dashboard_jobs", JSON.stringify(jobRecommendations)) }, [jobRecommendations])

  useEffect(() => {
    if (recommendations.length > 0) {
      if (resultRef.current && !narrativeText) {
        resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      if (!narrativeText) {
        const ownedSkillNames = recommendations[0].user_skill?.map((s) => s.skill).join(", ")
        setNarrativeText(
          `Career path yang paling direkomendasikan untukmu saat ini adalah ${recommendations[0].role}. Kamu sudah memiliki modal dasar yang bagus dengan menguasai skill seperti ${ownedSkillNames || "beberapa core skill"}. Untuk memperkecil gap dan mempercepat langkahmu menjadi seorang ${recommendations[0].role}, berikut adalah beberapa skill prioritas yang disarankan untuk kamu pelajari berikutnya:`
        )
      }
    } else {
      setNarrativeText("")
      setHasAnimated(false)
      sessionStorage.removeItem("dashboard_hasAnimated")
    }
  }, [recommendations, narrativeText])

  useEffect(() => {
    if (narrativeText && !hasAnimated) {
      const timer = setTimeout(() => { setHasAnimated(true) }, narrativeText.length * 12 + 500)
      return () => clearTimeout(timer)
    }
  }, [narrativeText, hasAnimated])

  useEffect(() => {
    const fetchLastAnalyzedSkills = async () => {
      const actualUserId = user?.uid || (typeof storedUser === "string" ? JSON.parse(storedUser)?.uid : storedUser?.uid);

      if (actualUserId && !selectedFile) {
        try {
          // Ambil dataset skill yang terakhir kali sukses diekstrak dari resume user
          const response = await api.get(`/profile/skillset?userId=${actualUserId}`);
          if (response.data && response.data.status === "ok") {
            const lastSkills = response.data.data?.skills || response.data.skills || [];
            // Set ke state dashboard agar visual resume lama tetap muncul sebelum re-analyze
            setExtractedSkills(lastSkills);
          }
        } catch (err) {
          console.error("Gagal mengambil data histori skill resume:", err);
        }
      }
    };

    fetchLastAnalyzedSkills();
  }, [selectedFile, user]); // Berjalan ulang jika user login berubah atau file baru di-upload

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
    const parsedSkills = newSkill.split(",").map((s) => s.trim()).filter(Boolean)
    setSkills([...new Set([...skills, ...parsedSkills])])
    setNewSkill("")
  }

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleFetchRoadmap = async (skillGapsArray) => {
    try {
      setRoadmapLoading(true)
      const response = await api.post("/career/roadmap", { skillGaps: skillGapsArray })
      if (response.data && response.data.success) {
        setRoadmap(response.data.roadmap || [])
      }
    } catch (err) {
      console.error("Gagal mengambil data roadmap industri:", err)
    } finally {
      setRoadmapLoading(false)
    }
  }

  const handleSaveSkillToPathway = async (skillName) => {
    const actualUserId = user?.uid || (typeof storedUser === "string" ? JSON.parse(storedUser)?.uid : storedUser?.uid)
    if (!actualUserId) {
      showNotification("Sesi user tidak valid. ID tidak ditemukan.", "error")
      return
    }
    try {
      const response = await api.post("/pathway", {
        user_id: actualUserId,
        skill_name: skillName,
        target_role: topRole?.role || "General Path",
      })
      if (response.status === 201 || response.data?.success) {
        showNotification(`Skill "${skillName}" berhasil disimpan ke target pembelajaran profile!`, "success")
        try {
          const currentSkillGaps = roadmap && roadmap.length > 0 ? roadmap.map((item) => item.skill) : [skillName]
          await api.post("/career/roadmap", { skillGaps: currentSkillGaps })
        } catch (roadmapErr) {
          console.log("Abaikan jika optional:", roadmapErr)
        }
      }
    } catch (err) {
      console.error("Gagal menambahkan ke target pembelajaran:", err)
      showNotification(err.response?.data?.message || "Gagal menambahkan skill.", "error")
    }
  }

  const handleAnalyze = async () => {
    try {
      // JANGAN bersihkan extractedSkills jika user tidak mengupload file baru,
      // supaya kita bisa menggunakan data history resume sebelumnya.
      if (selectedFile) {
        setExtractedSkills([]);
      }
      setLoading(true);

      const actualUserId = user?.uid || (typeof storedUser === "string" ? JSON.parse(storedUser)?.uid : storedUser?.uid);
      let completedStarredSkills = [];

      // 1. Ambil target pembelajaran skill berstatus completed dari profile
      if (actualUserId) {
        try {
          const pathwayResponse = await api.get(`/pathway/${actualUserId}`);
          const dataArray = Array.isArray(pathwayResponse.data)
            ? pathwayResponse.data
            : (pathwayResponse.data?.data || []);

          completedStarredSkills = dataArray
            .filter(item => item?.status === "completed")
            .map(item => item?.skill_name);

          setPathwayCompletedSkills(completedStarredSkills);
        } catch (pathwayErr) {
          console.error("Gagal mengambil completed starred skills:", pathwayErr);
        }
      }

      // 2. TENTUKAN PAYLOAD SKILL GABUNGAN
      // Jika ada file baru, gabungkan array input skills dasar + completed pathway.
      // Jika TIDAK ada file baru (pindah page), gabungkan data resume lama (extractedSkills) + completed pathway.
      const baseSkills = selectedFile ? skills : extractedSkills;
      const finalSkillsPayload = [...new Set([...baseSkills, ...completedStarredSkills])];

      let responseData;
      if (selectedFile) {
        // Jika ada file fisik baru di-upload, lakukan hit upload CV murni
        responseData = await uploadCV({ file: selectedFile, skills: finalSkillsPayload, name: user?.name });
      } else {
        // Jika tidak ada file (kasus balik dari page profile), gunakan rekomendasi berbasis total skillset gabungan
        responseData = await getJobRecommendation({ name: user?.name || "Anonymous", skillset: finalSkillsPayload });
      }

      // Jika response tidak mengembalikan extracted_skills (karena hit endpoint non-file), 
      // kita tetap amankan visualnya menggunakan resume skill lama kita.
      const detectedSkills = responseData?.extracted_skills && responseData.extracted_skills.length > 0
        ? responseData.extracted_skills
        : baseSkills;

      const recommendedRoles = responseData?.top_roles || [];
      setExtractedSkills(detectedSkills);
      setRecommendations(recommendedRoles);

      // Alur penanganan Roadmap Gap analysis tetap sama di bawah ini...
      if (recommendedRoles.length > 0) {
        const primaryRole = recommendedRoles[0];
        const totalSkillsToLearn = primaryRole.recommended_skill_to_learn || [];
        const currentActiveSkills = [...new Set([...detectedSkills, ...finalSkillsPayload])];

        const computedGaps = totalSkillsToLearn
          .filter((recSkill) => !currentActiveSkills.some((ownSkill) => ownSkill.toLowerCase() === (typeof recSkill === "object" ? recSkill.skill.toLowerCase() : recSkill.toLowerCase())))
          .map((s) => (typeof s === "object" ? s.skill : s));

        if (computedGaps.length > 0) {
          await handleFetchRoadmap(computedGaps);
        }
      }
    } catch (error) {
      console.error("ANALYZE ERROR:", error);
      showNotification("Failed to generate AI recommendation", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchJobs = async () => {
    const activeSkills = extractedSkills.length > 0 ? extractedSkills : skills
    if (activeSkills.length === 0) {
      showNotification("Silakan masukkan skill atau lakukan analisis CV terlebih dahulu.", "error")
      return
    }
    try {
      setJobLoading(true)
      setJobRecommendations([])
      const response = await api.post("/jobs/recommendations", { skillset: activeSkills })
      const result = response.data
      if (result && (result.status === "success" || result.status === "ok")) {
        setJobRecommendations(result.data.jobs || [])
        setTimeout(() => { jobRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }) }, 100)
      } else {
        showNotification(`Gagal memuat lowongan: ${result?.message || "Error internal server"}`, "error")
      }
    } catch (jobError) {
      showNotification(jobError.response?.data?.message || "Terjadi kesalahan koneksi ke server loker.", "error")
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
          <p className="text-slate-500 mt-3">Discover your ideal career path powered by AI analysis.</p>
        </div>
      </header>

      {/* CONTENT PANEL INPUT */}
      <div className="grid grid-cols-12 gap-6">
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

        {/* HASIL ANALISIS ENGINE */}
        {recommendations.length > 0 && (
          <div ref={resultRef} className="col-span-12 mt-6 scroll-mt-24 space-y-12">
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold">Recommended Career Paths</h3>
                <p className="text-sm text-slate-500">Matches found based on your AI analysis</p>
              </div>

              {/* MANGGIL SUB COMPONENT 1: DETECTED SKILLS */}
              <DetectedSkills
                extractedSkills={[...new Set([...extractedSkills, ...pathwayCompletedSkills])]}
                roadmap={roadmap}
              />

              {/* MANGGIL SUB COMPONENT 2: CAREER PATH CARD */}
              <CareerPathCard
                topRole={topRole}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                narrativeText={narrativeText}
                hasAnimated={hasAnimated}
                roadmapLoading={roadmapLoading}
                roadmap={roadmap}
                handleSaveSkillToPathway={handleSaveSkillToPathway}
              />

              {/* PATH ALTERNATIF */}
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

            {/* TRIGGER TOMBOL JOBS */}
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

        {/* MANGGIL SUB COMPONENT 3: JOB OPENINGS GRID */}
        <JobRecommendations jobRecommendations={jobRecommendations} jobLoading={jobLoading} jobRef={jobRef} />
      </div>

      {/* FOOTER */}
      <footer className="text-xs text-slate-500 pt-6 border-t">© 2026 SkillsGap AI Platform</footer>

      {/* MANGGIL SUB COMPONENT 4: TOAST NOTIFICATION */}
      <Toast toast={toast} setToast={setToast} />
    </div>
  )
}

export default Dashboard