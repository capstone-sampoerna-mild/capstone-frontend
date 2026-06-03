import api from "./api"

export const getJobRecommendation = async (
  payload
) => {

  const response = await api.post(
    "/job-role/recommend",
    payload
  )

  return response.data
}

export const uploadCV = async ({
  file,
  skills,
  name,
}) => {

  const formData = new FormData()

  // ================= FILE =================
  formData.append(
    "file",
    file
  )

  // ================= EXTRA DATA =================
  formData.append(
    "skillset",
    JSON.stringify(skills || [])
  )

  formData.append(
    "name",
    name || "Anonymous"
  )

  formData.append(
    "documentType",
    "cv"
  )

  const response = await api.post(
    "/document/upload",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  )

  return response.data
}
