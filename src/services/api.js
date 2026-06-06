import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 1. Request Interceptor (Tetap seperti kode aslimu)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 2. Response Interceptor (Tambahan untuk menangani Refresh Token otomatis)
api.interceptors.response.use(
  (response) => {
    return response; // Jika request sukses, langsung loloskan responnya
  },
  async (error) => {
    const originalRequest = error.config;

    // Periksa jika server merespon dengan status 401 (Unauthorized) 
    // dan request ini belum pernah melakukan percobaan ulang (_retry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Kunci request agar tidak looping jika refresh gagal

      try {
        const storedRefreshToken = localStorage.getItem("refreshToken");

        // Jika di localStorage tidak ada refresh token, paksa keluar ke halaman login
        if (!storedRefreshToken) {
          handleLogoutForce();
          return Promise.reject(error);
        }

        // Tembak endpoint refresh token dengan base URL dari env kamu
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken: storedRefreshToken } // Mengirim properti JSON sesuai instruksi Swagger
        );

        if (response.status === 200 || response.status === 201) {
          // Ambil access token baru dari response backend kamu
          // Sesuai dengan format balikan backend, sesuaikan properti penampungnya jika perlu
          const newAccessToken = response.data.token || response.data.accessToken || response.data.data?.token;
          const newRefreshToken = response.data.refreshToken || response.data.data?.refreshToken;

          // Perbarui token di penyimpanan lokal browser
          localStorage.setItem("token", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          // Pasang Access Token baru ke header request yang sempat gagal tadi
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Eksekusi ulang request awal yang gagal tadi dengan token yang baru gres!
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token kedaluwarsa atau tidak valid, sesi hangus:", refreshError);
        handleLogoutForce();
        return Promise.reject(refreshError);
      }
    }

    // Jika error di luar kode 401, lemparkan error seperti biasa
    return Promise.reject(error);
  }
);

// Fungsi utilitas untuk membersihkan data lokal ketika sesi benar-benar mati
const handleLogoutForce = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/login"; // Mengarahkan user kembali ke pintu masuk login
};

export default api;