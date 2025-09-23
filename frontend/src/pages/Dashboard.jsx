// src/pages/Dashboard.jsx
import React, { useState, useRef } from "react";
import {
  FaUpload,
  FaLink,
  FaEnvelope,
  FaHistory,
  FaUserCircle,
  FaTrash,
  FaCheck,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null); // { id, name }
  const [linkInfo, setLinkInfo] = useState(null); // { id, url, otp }
  const [shopkeeperEmail, setShopkeeperEmail] = useState("");
  const [activity, setActivity] = useState([]);
  const [toast, setToast] = useState(null);

  const dropRef = useRef(null);

  // toast helper
  const toastMsg = (msg) => {
    console.log("🔔", msg);
    setToast(msg);
    clearTimeout(window._sp_toast);
    window._sp_toast = setTimeout(() => setToast(null), 2500);
  };

  const pushActivity = (text) =>
    setActivity((a) => [
      { id: Date.now(), text, time: new Date().toLocaleString() },
      ...a,
    ].slice(0, 10));

  // file select handlers
  const onFileChosen = (f) => {
    setFile(f);
    toastMsg(`Selected: ${f.name}`);
  };
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) onFileChosen(e.target.files[0]);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) onFileChosen(f);
  };

  // 🔹 Upload to backend
  const startUpload = async () => {
    if (!file) return toastMsg("Choose a file first.");
    setUploading(true);
    pushActivity(`Uploading ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://localhost:3000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Upload response:", res.data);

      setUploadedFile({
        id: res.data.meta.fileId,
        name: res.data.meta.filename,
      });

      pushActivity(`Uploaded ${res.data.meta.filename}`);
      toastMsg(`Uploaded: ${res.data.meta.filename}`);
      setFile(null);
    } catch (err) {
      console.error("❌ Upload error:", err.response?.data || err.message);
      toastMsg(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Generate link
  const generateLink = async () => {
    if (!uploadedFile) return toastMsg("Upload a file first.");
    try {
      const res = await axios.post(
        "http://localhost:3000/api/link/generate",
        { fileId: uploadedFile.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Link response:", res.data);

      setLinkInfo({
        id: res.data.linkId,
        url: `http://localhost:5173/shop/${res.data.linkId}`,
        otp: res.data.otp,
        expiresAt: res.data.expiresAt,
      });

      pushActivity(`Generated link for ${uploadedFile.name}`);
    } catch (err) {
      console.error("❌ Link error:", err.response?.data || err.message);
      toastMsg(err.response?.data?.error || "Failed to generate link");
    }
  };

  // 🔹 Send link to shopkeeper
  const sendToShopkeeper = async () => {
    if (!linkInfo) return toastMsg("Generate a link first.");
    if (!shopkeeperEmail) return toastMsg("Enter shopkeeper email.");

    try {
      await axios.post(
        "http://localhost:3000/api/link/send",
        { linkId: linkInfo.id, email: shopkeeperEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      pushActivity(`Sent link to ${shopkeeperEmail}`);
      toastMsg(`Link sent to ${shopkeeperEmail}`);
      setShopkeeperEmail("");
    } catch (err) {
      console.error("❌ Send error:", err.response?.data || err.message);
      toastMsg(err.response?.data?.error || "Failed to send link");
    }
  };

  const removeUploaded = () => {
    if (!uploadedFile) return;
    pushActivity(`Removed ${uploadedFile.name}`);
    setUploadedFile(null);
    toastMsg("Removed file");
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white">
      <div className="relative z-10 flex">
        {/* sidebar */}
        <aside className="w-20 px-3 py-6 flex flex-col items-center gap-6 border-r border-white/10 bg-white/5 backdrop-blur-lg">
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg"
            >
              <FaUserCircle className="text-2xl text-white" />
            </button>
          </div>
        </aside>

        {/* main */}
        <main className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-300 bg-clip-text text-transparent">
              SecurePrint Dashboard
            </h1>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/login");
              }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-red-500 font-semibold"
            >
              Sign out
            </button>
          </div>

          {/* cards grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Upload Card */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaUpload className="text-emerald-400" /> Upload File
              </h3>
              <div
                ref={dropRef}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="mt-4 border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400"
                onClick={() => document.getElementById("file-input").click()}
              >
                <input id="file-input" type="file" className="hidden" onChange={handleFileInput} />
                {file ? <p>{file.name}</p> : <p>Drag & drop or click to choose</p>}
              </div>
              <button
                onClick={startUpload}
                disabled={uploading}
                className="mt-4 px-4 py-2 w-full rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 font-semibold text-black"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
              {uploadedFile && (
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span>✅ {uploadedFile.name}</span>
                  <button onClick={removeUploaded} className="text-red-400 text-xs">
                    <FaTrash />
                  </button>
                </div>
              )}
            </section>

           {/* Link Card */}
<section className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg hover:scale-[1.02] transition">
  <h3 className="text-lg font-semibold flex items-center gap-2">
    <FaLink className="text-indigo-400" /> Generate Link
  </h3>
  <button
    onClick={generateLink}
    className="mt-4 px-4 py-2 w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold"
  >
    Generate Link
  </button>
  {linkInfo && (
    <div className="mt-4 p-3 rounded bg-white/10 text-sm space-y-3">
      {/* URL Row */}
      <div className="flex items-center justify-between gap-2">
        <p className="truncate">
          <strong>URL:</strong> {linkInfo.url}
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(linkInfo.url);
            toastMsg("Link copied!");
          }}
          className="px-2 py-1 rounded bg-indigo-500 text-xs font-semibold"
        >
          Copy
        </button>
      </div>

      {/* OTP Row */}
      <div className="flex items-center justify-between gap-2">
        <p>
          <strong>OTP:</strong> {linkInfo.otp}
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(linkInfo.otp);
            toastMsg("OTP copied!");
          }}
          className="px-2 py-1 rounded bg-indigo-500 text-xs font-semibold"
        >
          Copy
        </button>
      </div>

      <p className="text-xs text-white/50">
        Expires: {new Date(linkInfo.expiresAt).toLocaleString()}
      </p>
    </div>
  )}
</section>


            {/* Send to Shopkeeper */}
            <section className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg hover:scale-[1.02] transition">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaEnvelope className="text-yellow-400" /> Send to Shopkeeper
              </h3>
              <input
                type="email"
                value={shopkeeperEmail}
                onChange={(e) => setShopkeeperEmail(e.target.value)}
                placeholder="Enter shopkeeper email"
                className="mt-4 w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={sendToShopkeeper}
                className="mt-3 px-4 py-2 w-full rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 font-semibold text-black"
              >
                Send Link
              </button>
            </section>
          </div>

          {/* Activity */}
          <section className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FaHistory className="text-pink-400" /> Recent Activity
            </h3>
            {activity.length === 0 ? (
              <p className="text-sm text-white/60 mt-3">No activity yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {activity.map((a) => (
                  <li key={a.id} className="p-2 rounded bg-white/10 flex justify-between">
                    <span>{a.text}</span>
                    <span className="text-xs text-white/50">{a.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Footer */}
          <footer className="mt-10 text-center text-sm text-white/60">
            <div className="py-6">
              Built with <span className="text-pink-400">❤️</span> by{" "}
              <span className="font-semibold text-indigo-300">Anubhav</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed right-6 bottom-6 px-4 py-2 rounded-lg bg-black/70 backdrop-blur text-white flex items-center gap-2 shadow-lg">
          <FaCheck className="text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}
