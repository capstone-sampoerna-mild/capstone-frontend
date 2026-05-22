import { X } from "lucide-react"

const SkillBadge = ({skills}) => {
  return (
    <div className="flex flex-wrap gap-2">

      {skills.map((skill, index) => (
        <div
          key={index}
          className="flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-md border border-indigo-100/50"
        >
          {skill}

          <button
            onClick={() =>
              handleRemoveSkill(skill)
            }
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

    </div>
  )
}

export default SkillBadge