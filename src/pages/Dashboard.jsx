import { useState } from "react"
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  UploadCloud,
  Plus,
  X,
} from "lucide-react"

import { Link } from "react-router-dom"

import { getJobRecommendation } from "../services/jobRole"
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

  const [skills, setSkills] = useState([
    "React",
    "Tailwind CSS",
    "UI Design",
  ])

  const [newSkill, setNewSkill] = useState("")

  const [loading, setLoading] = useState(false)

  const [recommendations, setRecommendations] = useState([])

  console.log("Recommendations:", recommendations)
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFileName(e.target.files[0].name)
    }
  }

  const handleAddSkill = (e) => {
    e.preventDefault()

    if (
      newSkill.trim() &&
      !skills.includes(newSkill.trim())
    ) {
      setSkills([...skills, newSkill.trim()])

      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(
      skills.filter((skill) => skill !== skillToRemove)
    )
  }

  // ================= AI ANALYSIS =================
  const handleAnalyze = async () => {

    try {

      setLoading(true)

      const payload = {
        name: user?.name || "Anonymous",
        skillset: skills,
      }

      console.log("Payload:", payload)

      const response = await getJobRecommendation(payload)

      console.log("AI Response:", response)

      setRecommendations(response?.top_roles)

    } catch (error) {

      console.error(error)

      alert("Failed to generate AI recommendation")

    } finally {

      setLoading(false)
    }
  }

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">

        <div className="max-w-2xl">

          <h3 className="text-indigo-500 font-semibold text-sm tracking-widest uppercase mb-2 block">
            Insights Engine
          </h3>

          <p className="text-slate-500 mt-3">
            Discover your ideal career path powered by AI analysis.
          </p>

        </div>

        <Link
          to="/chat"
          className="bg-white border px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:bg-indigo-50 transition-all"
        >
          <Sparkles className="w-4 h-4 text-indigo-500" />

          <span className="text-sm">
            AI Assistant
          </span>
        </Link>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <InputSkill handleAnalyze={handleAnalyze} skills={skills} loading={loading} handleFileChange={handleFileChange} handleAddSkill={handleAddSkill} fileName={fileName} newSkill={newSkill} setNewSkill={setNewSkill} />

        {/* CAREER CARDS */}
        {recommendations.length > 0 && (
          <div className="col-span-12 mt-6">

            <div className="flex justify-between items-center mb-4">

              <div>
                <h3 className="text-xl font-bold">
                  Recommended Career Paths
                </h3>

                <p className="text-sm text-slate-500">
                  Matches found based on your AI analysis
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {recommendations.map((item, i) => (
                <div
                  key={i}
                  className="
        bg-white border border-slate-100 rounded-xl
        p-5 shadow-sm hover:shadow-md
        hover:border-indigo-100 transition-all
        flex flex-col
        min-w-0
      "
                >

                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">

                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors break-words">
                      {item.role}
                    </h4>

                    <span className="shrink-0 text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                      {(item.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2 flex-1">
                    {item.skill_gap?.slice(0, 5).map((skillItem, idx) => (
                      <div
                        key={idx}
                        className="
              bg-slate-50 border border-slate-100
              rounded-lg p-3
            "
                      >

                        {/* Skill Top */}
                        <div className="flex justify-between items-center gap-2 mb-2">

                          <span className="text-sm font-medium text-slate-700 capitalize break-all">
                            {skillItem.skill}
                          </span>

                          <span className="text-xs font-semibold text-indigo-600 shrink-0">
                            {(skillItem.confidence * 100).toFixed(0)}%
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${skillItem.confidence * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <button className="mt-5 text-indigo-500 text-sm font-medium flex items-center gap-1 hover:text-indigo-600 transition-colors">

                    Explore

                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-xs text-slate-500 pt-6 border-t">
        © 2026 SkillsGap AI Platform
      </footer>
    </div>
  )
}

export default Dashboard