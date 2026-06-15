import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Utensils } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}admin/login/`, { username, password });
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminUser", res.data.username);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "100vh", background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
      padding: "20px",
    }}>
      <form onSubmit={handleLogin} style={{
        background: "#fff", padding: "44px 36px", borderRadius: "16px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)", width: "100%", maxWidth: "400px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ marginBottom: "8px", color: "#ff5722" }}><Utensils size={40} style={{ display: "inline-block" }} /></div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#1f2937", margin: 0 }}>RestroScan Admin</h2>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "6px" }}>Sign in to manage your restaurant</p>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#dc2626", fontSize: "14px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Username</label>
          <input
            type="text" value={username} onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "15px", outline: "none", boxSizing: "border-box", transition: "border 0.2s" }}
            onFocus={e => e.target.style.borderColor = "#ff5722"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            required
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Password</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "15px", outline: "none", boxSizing: "border-box", transition: "border 0.2s" }}
            onFocus={e => e.target.style.borderColor = "#ff5722"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            required
          />
        </div>

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "14px", background: loading ? "#ccc" : "linear-gradient(135deg, #ff5722, #ff7043)",
          color: "#fff", border: "none", borderRadius: "10px", cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px", fontWeight: "700", transition: "transform 0.2s",
        }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
