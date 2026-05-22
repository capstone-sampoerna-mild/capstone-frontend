import { Plus, UploadCloud } from "lucide-react"
import SkillBadge from "./SkillBadge"

const InputSkill = ({handleFileChange, fileName, handleAddSkill,handleAnalyze, loading, newSkill, skills}) => {
  console.log('skills :', skills)
  return (
    <div className="col-span-12 bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between space-y-6">
      <div>

        <h3 className="text-lg font-bold mb-1">
          Analyze Your Skills
        </h3>

        <p className="text-sm text-slate-500 mb-4">
          Upload your CV and define your current
          skillset for AI-powered job recommendations.
        </p>

        <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-500 transition-colors group cursor-pointer">

          <input
            type="file"
            accept=".pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />

          <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 mx-auto mb-2 transition-colors" />

          <p className="text-sm font-medium text-slate-700">
            {fileName
              ? fileName
              : "Upload CV / Portfolio (PDF)"}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Max size 5MB
          </p>
        </div>

        <div className="mt-5">

          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Current Skillset
          </label>

          <form
            onSubmit={handleAddSkill}
            className="flex gap-2 mb-3"
          >

            <input
              type="text"
              placeholder="e.g. Node.js"
              value={newSkill}
              onChange={(e) =>
                setNewSkill(e.target.value)
              }
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            />

            <button
              type="submit"
              className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>

          </form>

          {/* Skills Badge */}
          <SkillBadge skills={skills} />
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full bg-indigo-500 text-white text-sm font-medium py-3 rounded-xl hover:bg-indigo-600 shadow-sm shadow-indigo-100 transition-all disabled:opacity-50"
      >

        {loading
          ? "Analyzing..."
          : "Run AI Gap Analysis"}

      </button>
    </div>
  )
}

export default InputSkill