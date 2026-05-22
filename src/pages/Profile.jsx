import { Edit2, MapPin, Mail, Link as LinkIcon, Award, School, ArrowRight } from "lucide-react"
const storedUser = JSON.parse(
  localStorage.getItem("user")
);

const user = storedUser?.data?.user;
// helper cn
function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

function Profile() {
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <section className="bg-white rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        
        {/* Avatar */}
        <div className="relative">
          <img
            src={user?.picture}
            className="w-28 h-28 rounded-xl object-cover"
          />
          <button className="absolute -bottom-2 -right-2 p-2 bg-indigo-500 text-white rounded-lg">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <p className="text-indigo-500 text-sm">
            Senior UX Architect & AI Strategist
          </p>

          <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> San Francisco
            </div>
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" /> {user?.email}
            </div>
            <div className="flex items-center gap-1">
              <LinkIcon className="w-4 h-4" /> portfolio.com
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <div className="grid grid-cols-12 gap-6">

        {/* LEFT */}
        <div className="col-span-12 md:col-span-5 space-y-6">

          {/* SKILLS */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold mb-4">Skills</h3>

            <div className="flex flex-wrap gap-2">
              {["React", "UI/UX", "AI Tools", "Tailwind"].map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs bg-indigo-100 text-indigo-600 rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* CERT */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold mb-4">Certifications</h3>

            {[
              "Google UX Design",
              "AWS Cloud Practitioner",
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-3 mb-3">
                <Award className="w-4 h-4 text-indigo-500" />
                <span className="text-sm">{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-12 md:col-span-7 space-y-6">

          {/* EXPERIENCE */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold mb-4">Experience</h3>

            <div className="space-y-4">
              {[
                {
                  role: "UX Designer",
                  company: "Tech Corp",
                },
                {
                  role: "Product Designer",
                  company: "Startup Inc",
                },
              ].map((exp, i) => (
                <div key={i}>
                  <p className="font-semibold">{exp.role}</p>
                  <p className="text-sm text-slate-500">
                    {exp.company}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* EDUCATION */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold mb-4">Education</h3>

            {[
              "Stanford University",
              "MIT",
            ].map((edu, i) => (
              <div key={i} className="flex items-center gap-2 mb-3">
                <School className="w-4 h-4 text-indigo-500" />
                <span className="text-sm">{edu}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PROGRESS */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-xl">
        <h3 className="font-bold text-lg mb-2">
          Learning Progress
        </h3>
        <p className="text-sm opacity-80 mb-4">
          You're 75% complete 🚀
        </p>

        <div className="w-full h-2 bg-white/30 rounded-full">
          <div className="w-[75%] h-full bg-white rounded-full"></div>
        </div>

        <button className="mt-4 flex items-center gap-1 text-sm">
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    </div>
  )
}

export default Profile