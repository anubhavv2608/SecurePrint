// src/pages/ShopView.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_BASE from "../config";

import { FaLock, FaFilePdf, FaCheckCircle, FaTimesCircle, FaPrint } from "react-icons/fa";

export default function ShopView() {
  const { id } = useParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);

  const handleValidate = async () => {
    setLoading(true);
    setStatus(null);
    try {
      // 1️⃣ Validate OTP with deployed backend
      const res = await axios.post(`${API_BASE}/api/link/${id}/validate`, { otp });

      if (res.data.success) {
        // 2️⃣ Fetch PDF as Blob
        const fileRes = await axios.get(`${API_BASE}/api/link/${id}/blob`, {
          responseType: "blob",
        });

        const url = URL.createObjectURL(fileRes.data);
        setBlobUrl(url);
        setStatus("success");
      }
    } catch (err) {
      console.error("❌ Validate error:", err.response?.data || err.message);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!blobUrl) return;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.src = blobUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      // ✅ Keep iframe long enough for print dialog
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
        URL.revokeObjectURL(blobUrl);
      }, 60000);
    };
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white p-6 overflow-hidden">
      {/* card */}
      <div className="relative z-10 bg-white/10 p-8 rounded-3xl shadow-2xl max-w-md w-full backdrop-blur-2xl border border-white/20">
        <div className="flex items-center gap-3 mb-6">
          <FaFilePdf className="text-pink-400 text-3xl" />
          <h1 className="text-2xl font-extrabold">SecurePrint Shop</h1>
        </div>

        {status !== "success" && (
          <>
            <p className="text-sm text-white/70 mb-6">
              Enter the 6-digit OTP provided by the customer to unlock and print their file securely.
            </p>

            <div className="relative">
              <FaLock className="absolute left-3 top-4 text-white/50" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 mb-4 focus:ring-2 focus:ring-indigo-400 tracking-widest text-lg text-center"
              />
            </div>

            <button
              onClick={handleValidate}
              disabled={loading || otp.length < 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 font-bold text-black hover:scale-[1.03] transition disabled:opacity-50"
            >
              {loading ? "Validating..." : "Validate OTP"}
            </button>

            {status === "error" && (
              <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
                <FaTimesCircle /> Invalid or expired OTP. Please try again.
              </div>
            )}
          </>
        )}

        {/* ✅ Success state */}
        {status === "success" && (
          <div className="flex flex-col items-center text-center">
            <div className="text-emerald-400 flex items-center gap-2 text-lg font-semibold mb-4">
              <FaCheckCircle /> OTP Validated Successfully
            </div>
            <p className="text-sm text-white/70 mb-4">
              Your document is ready. Click below to{" "}
              <span className="text-emerald-400 font-bold">print securely</span>.
            </p>
            <button
              onClick={handlePrint}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-bold flex items-center gap-2 shadow-lg hover:scale-[1.05] transition"
            >
              <FaPrint /> Print Document
            </button>
          </div>
        )}
      </div>

      {/* footer */}
      <footer className="mt-10 text-center text-sm text-white/60 relative z-10">
        Built with <span className="text-pink-400">❤️</span> by{" "}
        <span className="font-semibold text-indigo-300">Anubhav</span>
      </footer>
    </div>
  );
}
