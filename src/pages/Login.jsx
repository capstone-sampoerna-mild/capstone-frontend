import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import api from "../services/api";
import { useNavigate, Navigate } from "react-router-dom";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react"; // Pastikan lucide-react terinstall

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Kalau sudah login, langsung lempar ke dashboard
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Login popup Google Firebase
      const result = await signInWithPopup(auth, googleProvider);

      // Ambil user Firebase
      const user = result.user;

      // Ambil Firebase ID Token
      const idToken = await user.getIdToken();

      // Kirim token ke backend Express
      const response = await api.post("/auth/google", {
        idToken,
      });


      // Simpan session
      localStorage.setItem("token", idToken);
      localStorage.setItem("user", JSON.stringify(response.data));

      // Redirect ke dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("FULL ERROR:", error);

      throw(error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* KIRI: Brand & Visual Hero (Akan tersembunyi otomatis di layar HP) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#12162b] relative overflow-hidden flex-col justify-between p-12">
        {/* Dekorasi Efek Cahaya Gradasi AI */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Logo Atas */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex items-center justify-center w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <span className="text-indigo-400 text-xl font-bold">S</span>
          </div>
          <span className="text-white font-bold text-lg tracking-wide">SkillsGap</span>
        </div>

        {/* Kata-kata Promosi Tengah */}
        <div className="space-y-6 relative z-10 my-auto max-w-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" /> AI Career Navigator
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Bridge the gap between where you are and{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              where you want to be.
            </span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Analyze your skillset and unlock your true career trajectory today.
          </p>
        </div>

        {/* Footer Kiri */}
        <p className="text-xs text-slate-500 relative z-10">
          Powered by advanced AI models.
        </p>
      </div>

      {/* KANAN: Container Utama Form Login */}
      <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center p-6 sm:p-12 bg-slate-50">
        
        {/* Login Card Wrapper */}
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-10 transition-all">
          
          {/* Logo Khusus Mobile View (Sembunyi di Desktop) */}
          <div className="text-center lg:hidden mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#12162b] rounded-xl mb-3">
              <span className="text-[#6366f1] text-2xl font-bold">S</span>
            </div>
            <h1 className="text-2xl font-bold text-[#12162b]">SkillsGap</h1>
            <p className="text-gray-500 mt-1 text-xs">AI Career Navigator</p>
          </div>

          {/* Welcome Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 text-sm mt-1">Please sign in to continue your journey</p>
          </div>

          {/* Google Login Button */}
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] transition-all duration-200 mb-6 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            ) : (
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="w-5 h-5"
              />
            )}
            <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium tracking-wider text-[10px]">
                Or limited access
              </span>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-[11px] text-slate-400 mt-10 space-y-1">
            <p>© 2026 SkillsGap AI Platform.</p>
            </div>

        </div>

      </div>

    </div>
  );
};

export default Login;