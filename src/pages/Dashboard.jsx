import { useState, useEffect, useRef } from "react" // 1. Tambahkan useEffect dan useRef
import {
  Sparkles,
  ArrowRight,
} from "lucide-react"

import { Link } from "react-router-dom"

import {
  getJobRecommendation,
  uploadCV,
} from "../services/jobRole"

import SkillBadge from "../components/SkillBadge"
import InputSkill from "../components/InputSkill"

// helper cn
function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

function Dashboard() {

  const storedUser = JSON.parse(
    localStorage.getItem("user")
  )

  const user = storedUser?.data?.user

  // ================= STATE =================
  const [fileName, setFileName] = useState("")
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState("")
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)

  // 2. Buat reference untuk menandai elemen hasil rekomendasi
  const resultRef = useRef(null)

  // 3. Efek untuk mendeteksi ketika rekomendasi berhasil dimuat
  useEffect(() => {
    if (recommendations.length > 0 && resultRef.current) {
      resultRef.current.scrollIntoView({
        behavior: "smooth", // Efek bergeser secara halus/smooth
        block: "start",     // Posisi elemen di bagian atas layar setelah scroll
      })
    }
  }, [recommendations]) // Berjalan setiap kali isi state 'recommendations' berubah

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFileName("")
  }    

  // ================= FILE =================
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFileName(file.name)
      setSelectedFile(file)
    }
  }

  // ================= ADD SKILL =================
  const handleAddSkill = (e) => {
    e.preventDefault()
    if (!newSkill.trim()) return

    const parsedSkills = newSkill
      .split(",")
      .map((skill) => skill.trim().toLowerCase())
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

  // ================= REMOVE SKILL =================
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  // ================= AI ANALYSIS =================
  const handleAnalyze = async () => {
    try {
      setLoading(true)

      // ================= PDF MODE =================
      if (selectedFile) {
        const uploadResponse = await uploadCV({
          file: selectedFile,
          skills,
          name: user?.name,
        })

        setRecommendations(uploadResponse?.top_roles || [])
        return
      }

      // ================= MANUAL SKILL MODE =================
      const payload = {
        name: user?.name || "Anonymous",
        skillset: skills,
      }

      const response = await getJobRecommendation(payload)
      setRecommendations(response?.top_roles || [])

    } catch (error) {
      console.error("ANALYZE ERROR:", error)
      alert("Failed to generate AI recommendation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-none space-y-12">

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

        <Link
          to="/chat"
          className="bg-white border px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:bg-indigo-50 transition-all w-fit"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-sm">AI Assistant</span>
        </Link>
      </header>

      {/* CONTENT */}
      <div className="grid grid-cols-12 gap-6">

        {/* INPUT */}
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

        {/* RESULT */}
        {recommendations.length > 0 && (
          // 4. Pasang ref={resultRef} di pembungkus hasil komponen, ditambah padding-top (scroll-mt-24) agar tidak mentok ke bar atas saat scroll berhenti
          <div ref={resultRef} className="col-span-12 mt-6 scroll-mt-24">

            <div className="mb-4">
              <h3 className="text-xl font-bold">
                Recommended Career Paths
              </h3>
              <p className="text-sm text-slate-500">
                Matches found based on your AI analysis
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {recommendations.map((item, i) => (
                <div
                  key={i}
                  className="
                    bg-white border border-slate-100
                    rounded-2xl p-5
                    shadow-sm hover:shadow-md
                    hover:border-indigo-100
                    transition-all
                    flex flex-col
                    min-w-0
                  "
                >
                  {/* HEADER */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-lg break-words">
                        {item.role}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        AI career recommendation
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* SKILLS */}
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
                      Recommended Skills
                    </p>
                    <SkillBadge
                      skills={item.skill_gap?.slice(0, 8) || []}
                      ai={true}
                    />
                  </div>

                  {/* FOOTER */}
                  <button className="mt-5 text-indigo-500 text-sm font-medium flex items-center gap-1 hover:text-indigo-600 transition-colors">
                    Explore Career
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="text-xs text-slate-500 pt-6 border-t">
        © 2026 SkillsGap AI Platform
      </footer>

    </div>
  )
}

export default Dashboard