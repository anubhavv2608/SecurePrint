// src/pages/Login.jsx
import React, { useState, useRef, useEffect } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({ transform: "perspective(1000px)" });
  const navigate = useNavigate();

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const leave = () =>
      setTiltStyle({
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
      });
    el.addEventListener("mouseleave", leave);
    return () => el.removeEventListener("mouseleave", leave);
  }, []);

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;
    const rotateX = (dy * 6).toFixed(2);
    const rotateY = (dx * -6).toFixed(2);
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
    });
  };

  // 🔹 Login with backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token); // store JWT
        navigate("/dashboard"); // redirect to dashboard
      } else {
        alert("No token received from server.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Invalid credentials ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white">
      {/* animated gradient blobs */}
      <div className="absolute -left-32 -top-28 w-96 h-96 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -right-20 -bottom-36 w-80 h-80 bg-gradient-to-tr from-yellow-400 to-red-500 rounded-full blur-3xl opacity-25 animate-blob animation-delay-4000 pointer-events-none"></div>

      {/* subtle particle dots */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <span
            key={i}
            className="block absolute bg-white/60 rounded-full w-1.5 h-1.5 opacity-60 animate-float"
            style={{
              left: `${(i * 37) % 101}%`,
              top: `${(i * 29) % 101}%`,
              animationDuration: `${6 + (i % 6)}s`,
              transform: "translateY(0)",
              filter: "blur(0.3px)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          style={{ transition: "transform 150ms ease", ...tiltStyle }}
          className="relative w-full max-w-4xl rounded-3xl p-1"
        >
          {/* outer neon border */}
          <div className="rounded-3xl bg-gradient-to-br from-white/4 to-white/2 border border-white/6 p-8 backdrop-blur-md shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left - Branding & Pitch */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-tr from-yellow-400 to-red-500 shadow-lg transform -rotate-12">
                    {/* stylized printer icon */}
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9h12v6H6z" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6 15v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6 9V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">SecurePrint</h2>
                    <p className="text-sm text-white/70 mt-1">Private print links • OTP access • No downloads</p>
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => navigate("/signup")}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-semibold hover:scale-105 transition shadow"
                  >
                    Create free account
                  </button>
                  <button className="px-4 py-2 rounded-lg border border-white/8 text-white/90 hover:bg-white/3">
                    See demo
                  </button>
                </div>
              </div>

              {/* Right - Form */}
              <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs text-white/70">Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                      placeholder="you@company.com"
                      className="mt-2 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/6 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/70">Password</label>
                    <div className="mt-2 relative">
                      <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/6 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-3 text-sm text-white/80"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold shadow-lg hover:scale-[1.02] transform transition disabled:opacity-60"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>

                  <div className="flex items-center gap-3 mt-2">
                    <hr className="flex-1 border-white/6" />
                    <span className="text-white/60 text-sm">Or continue with</span>
                    <hr className="flex-1 border-white/6" />
                  </div>

                  <div className="flex gap-3 mt-3">
                    <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition">
                      <FaGoogle className="text-red-500" />
                      <span>Google</span>
                    </button>
                    <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition">
                      <FaGithub className="text-gray-200" />
                      <span>Github</span>
                    </button>
                  </div>

                  <p className="text-xs text-white/60 mt-4">
                    By signing in you agree to our{" "}
                    <a className="text-indigo-300 hover:underline">Terms</a>.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
