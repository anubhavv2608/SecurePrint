// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ShopView from "./pages/ShopView";   // ✅ import ShopView

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* default redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* user dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* shopkeeper view (link validation + print) */}
        <Route path="/shop/:id" element={<ShopView />} />   {/* ✅ added */}
      </Routes>
    </BrowserRouter>
  );
}
