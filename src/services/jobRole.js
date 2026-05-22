import api from "./api";

export const getJobRecommendation = async (payload) => {
  const response = await api.post(
    "/job-role/recommend",
    payload
  );

  return response.data;
};