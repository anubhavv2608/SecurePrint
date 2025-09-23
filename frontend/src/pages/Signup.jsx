// src/pages/Signup.jsx
import React, { useState, useMemo } from "react";
import { FaGoogle, FaGithub, FaApple, FaShieldAlt } from "react-icons/fa";
import { FiMail, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreement, setAgreement] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // password strength meter
  const passScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const passColor = ["bg-red-500","bg-orange-400","bg-yellow-400","bg-emerald-400","bg-green-400"][passScore];
  const passLabel = ["Too weak","Weak","Okay","Strong","Very strong"][passScore];

  // ✅ real signup submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match!");
      return;
    }
    if (!agreement) {
      alert("Please accept the terms to sign up.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post("http://localhost:3000/api/auth/signup", {
        email,
        password,
        name: email.split("@")[0] || "User", // simple name fallback
      });
      alert("Account created ✅ Now log in.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white flex items-center justify-center">
      {/* Animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px,0px) scale(1); }
          33% { transform: translate(30px,-20px) scale(1.08); }
          66% { transform: translate(-20px,30px) scale(0.95); }
          100% { transform: translate(0px,0px) scale(1); }
        }
        .animate-blob { animation: blob 9s ease-in-out infinite; }
      `}</style>

      {/* Decorative blobs */}
      <div className="absolute -left-44 -top-36 w-[36rem] h-[36rem] rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 opacity-30 blur-3xl animate-blob pointer-events-none"></div>
      <div className="absolute -right-32 -bottom-44 w-72 h-72 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 opacity-25 blur-3xl animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl p-1">
        <div className="rounded-3xl bg-gradient-to-br from-white/6 to-white/4 border border-white/8 p-8 backdrop-blur-md shadow-2xl">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            {/* Left panel */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-tr from-yellow-400 to-red-500 shadow-xl transform -rotate-12">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="white">
                    <path d="M6 9h12v6H6z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 15v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 9V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-extrabold">SecurePrint</h2>
                  <p className="text-sm text-white/70 mt-1">Privacy-first print links • OTPs • no downloads</p>
                </div>
              </div>

              <div className="grid gap-3">
                <FeatureRow icon={<FaShieldAlt />} title="Private by design" text="Links expire, nothing stays on shop computers." />
                <FeatureRow icon={<FiMail />} title="OTP verified" text="Share files only with trusted shops." />
                <FeatureRow icon={<FiLock />} title="Encrypted" text="Files stored securely in the cloud." />
              </div>
            </div>

            {/* Right panel - form */}
            <div className="w-full">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/8">
                <h3 className="text-xl font-bold mb-2">Create your account</h3>
                <p className="text-sm text-white/70 mb-4">Upload, share, and print securely with expiring links.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <label className="block">
                    <span className="text-xs text-white/70 flex items-center gap-2"><FiMail /> Email</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@company.com"
                      className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </label>

                  <label className="block">
                    <span className="text-xs text-white/70 flex items-center gap-2"><FiLock /> Password</span>
                    <div className="mt-2 relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Strong password"
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-3 text-sm text-white/80"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    {/* Strength meter */}
                    <div className="mt-3">
                      <div className="relative h-2 rounded-full bg-white/10 overflow-hidden">
                        <div className={`absolute left-0 top-0 h-full ${passColor}`} style={{ width: `${(passScore / 4) * 100}%`, transition: "width 220ms" }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                        <span>{passLabel}</span>
                        <span>{password.length} chars</span>
                      </div>
                    </div>
                  </label>

                  <label className="block">
                    <span className="text-xs text-white/70">Confirm password</span>
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      placeholder="Re-enter password"
                      className="mt-2 w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </label>

                  <label className="flex items-start gap-3 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={agreement}
                      onChange={(e) => setAgreement(e.target.checked)}
                      className="mt-1 accent-indigo-400"
                    />
                    <span>I agree to <a className="text-indigo-300 hover:underline">Terms</a> & <a className="text-indigo-300 hover:underline">Privacy</a>.</span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold shadow-lg hover:scale-[1.02] transform transition disabled:opacity-60"
                  >
                    {submitting ? "Creating account..." : "Create account"}
                  </button>
                </form>

                <div className="mt-4 text-center text-sm text-white/60">or continue with</div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <SocialBtn icon={<FaGoogle />} label="Google" />
                  <SocialBtn icon={<FaGithub />} label="Github" />
                  <SocialBtn icon={<FaApple />} label="Apple" />
                </div>

                <p className="text-sm text-white/60 mt-4">
                  Already have an account?{" "}
                  <button onClick={() => navigate("/login")} className="text-indigo-300 hover:underline">
                    Log in
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helpers */
function FeatureRow({ icon, title, text }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-10 h-10 rounded-lg bg-white/6 flex items-center justify-center text-indigo-300">
        {icon}
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-white/60">{text}</div>
      </div>
    </div>
  );
}

function SocialBtn({ icon, label }) {
  return (
    <button className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition text-white">
      <span className="text-lg">{icon}</span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
