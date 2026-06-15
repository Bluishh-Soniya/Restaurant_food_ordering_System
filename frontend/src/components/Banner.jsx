import React, { useState, useEffect } from "react";
import { fetchTables } from "../services/api";
import { Utensils, Package, CheckCircle, Edit2 } from "lucide-react";

const Banner = ({ data }) => {
  const [step, setStep] = useState(localStorage.getItem("orderType") ? "set" : "choose");
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [orderType, setOrderType] = useState(localStorage.getItem("orderType") || "");
  const [tableNumber, setTableNumber] = useState(localStorage.getItem("tableNumber") || "");

  const handleParcel = () => {
    localStorage.setItem("orderType", "parcel");
    localStorage.removeItem("tableNumber");
    setOrderType("parcel");
    setTableNumber("");
    setStep("set");
    // Trigger storage event so CartPage/CheckoutPage updates
    window.dispatchEvent(new Event("storage"));
  };

  const handleDineIn = () => {
    setStep("table");
    fetchTables().then((res) => setTables(res.data)).catch(() => {});
  };

  const handleTableSelect = () => {
    if (!selectedTable) return;
    localStorage.setItem("orderType", "dine-in");
    localStorage.setItem("tableNumber", selectedTable);
    setOrderType("dine-in");
    setTableNumber(selectedTable);
    setStep("set");
    window.dispatchEvent(new Event("storage"));
  };

  const imageUrl = data?.image?.startsWith("http") 
    ? data.image 
    : data?.image 
      ? `http://127.0.0.1:8000${data.image}`
      : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=80"; // Fallback beautiful restaurant image

  return (
    <div style={{ 
      position: "relative", width: "100%", height: "400px", 
      overflow: "hidden", display: "flex", alignItems: "center", 
      justifyContent: "center", marginTop: "60px", marginBottom: "40px",
      borderRadius: "0" 
    }}>
      {/* Background Image with Overlay */}
      <div style={{ 
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0, 
        backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", 
        backgroundPosition: "center", filter: "brightness(0.6)" 
      }} />
      
      {/* Interactive Hero Card */}
      <div style={{ 
        position: "relative", zIndex: 10, background: "rgba(255,255,255,0.95)", 
        backdropFilter: "blur(12px)", padding: "30px", borderRadius: "16px", 
        boxShadow: "0 10px 40px rgba(0,0,0,0.3)", width: "90%", maxWidth: "420px" 
      }}>
        
        {step === "set" ? (
          <div style={{ textAlign: "center", animation: "fadeIn 0.3s" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px", color: "#1f2937" }}>
              Ready to Order
            </h2>
            <div style={{ 
              display: "inline-flex", alignItems: "center", gap: "10px", 
              background: orderType === "parcel" ? "#e8f5e9" : "#fff3e0", 
              border: orderType === "parcel" ? "1px solid #4caf50" : "1px solid #ff9800",
              color: orderType === "parcel" ? "#2e7d32" : "#e65100",
              padding: "12px 24px", borderRadius: "10px", fontWeight: "600", 
              fontSize: "15px", marginBottom: "20px" 
            }}>
              {orderType === "parcel" ? (
                <><Package size={18} /> Parcel / Takeaway</>
              ) : (
                <><Utensils size={18} /> Dine In (Table {tableNumber})</>
              )}
            </div>
            <div>
              <button onClick={() => setStep("choose")} style={{ 
                background: "transparent", border: "1px solid #d1d5db", 
                padding: "8px 16px", borderRadius: "8px", color: "#4b5563", 
                fontWeight: "600", cursor: "pointer", display: "inline-flex", 
                alignItems: "center", gap: "6px", transition: "all 0.2s" 
              }}>
                <Edit2 size={14} /> Change Preference
              </button>
            </div>
          </div>
        ) : step === "choose" ? (
          <div style={{ animation: "fadeIn 0.3s" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", textAlign: "center", marginBottom: "8px", color: "#1f2937" }}>
              Where will you be eating?
            </h2>
            <p style={{ textAlign: "center", color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
              Select your preference to continue
            </p>

            <button onClick={handleDineIn} style={{
              width: "100%", padding: "14px", marginBottom: "12px",
              background: "linear-gradient(135deg, #ff5722, #ff7043)",
              color: "#fff", border: "none", borderRadius: "10px",
              fontSize: "16px", fontWeight: "600", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <Utensils size={20} /> Dine In
            </button>

            <button onClick={handleParcel} style={{
              width: "100%", padding: "14px",
              background: "#f3f4f6", color: "#1f2937",
              border: "2px solid #e5e7eb", borderRadius: "10px",
              fontSize: "16px", fontWeight: "600", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <Package size={20} /> Parcel / Takeaway
            </button>
          </div>
        ) : (
          <div style={{ animation: "fadeIn 0.3s" }}>
            <h2 style={{ fontSize: "22px", fontWeight: "700", textAlign: "center", marginBottom: "8px", color: "#1f2937" }}>
              Select Your Table
            </h2>
            <p style={{ textAlign: "center", color: "#6b7280", fontSize: "14px", marginBottom: "20px" }}>
              Choose a table to continue
            </p>

            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              style={{
                width: "100%", padding: "14px", borderRadius: "10px",
                border: "2px solid #e5e7eb", fontSize: "15px",
                marginBottom: "16px", outline: "none", background: "#f9fafb",
              }}
            >
              <option value="">-- Select Table --</option>
              {tables.map((t) => (
                <option key={t.id} value={t.table_number}>
                  Table {t.table_number}
                </option>
              ))}
            </select>

            <button onClick={handleTableSelect} disabled={!selectedTable} style={{
              width: "100%", padding: "14px", marginBottom: "10px",
              background: selectedTable ? "linear-gradient(135deg, #ff5722, #ff7043)" : "#ccc",
              color: "#fff", border: "none", borderRadius: "10px",
              fontSize: "16px", fontWeight: "600",
              cursor: selectedTable ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
            }}>
              <CheckCircle size={18} /> Confirm Table
            </button>

            <button onClick={() => { setStep("choose"); setSelectedTable(""); }} style={{
              width: "100%", padding: "10px", background: "transparent",
              color: "#6b7280", border: "none", cursor: "pointer",
              fontSize: "14px", fontWeight: "500"
            }}>
              ← Back
            </button>
          </div>
        )}

      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Banner;