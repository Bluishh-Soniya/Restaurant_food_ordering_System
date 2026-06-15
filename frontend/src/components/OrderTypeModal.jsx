import React, { useState, useEffect } from "react";
import { fetchTables } from "../services/api";
import { Utensils, Package, CheckCircle } from "lucide-react";

const OrderTypeModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState("choose"); // "choose" | "table"
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");

  useEffect(() => {
    if (isOpen && step === "table") {
      fetchTables().then((res) => setTables(res.data)).catch(() => {});
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  const handleParcel = () => {
    localStorage.setItem("orderType", "parcel");
    localStorage.removeItem("tableNumber");
    onClose();
  };

  const handleDineIn = () => {
    setStep("table");
    fetchTables().then((res) => setTables(res.data)).catch(() => {});
  };

  const handleTableSelect = () => {
    if (!selectedTable) return;
    localStorage.setItem("orderType", "dine-in");
    localStorage.setItem("tableNumber", selectedTable);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 9999, padding: "20px",
    }}>
      <div style={{
        background: "#fff", borderRadius: "20px", padding: "36px",
        maxWidth: "420px", width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        animation: "fadeInUp 0.3s ease",
      }}>
        {step === "choose" ? (
          <>
            <h2 style={{ fontSize: "22px", fontWeight: "700", textAlign: "center", marginBottom: "8px", color: "#1f2937" }}>
              How would you like to order?
            </h2>
            <p style={{ textAlign: "center", color: "#6b7280", fontSize: "14px", marginBottom: "28px" }}>
              Select your preference to continue
            </p>

            <button onClick={handleDineIn} style={{
              width: "100%", padding: "16px", marginBottom: "12px",
              background: "linear-gradient(135deg, #ff5722, #ff7043)",
              color: "#fff", border: "none", borderRadius: "12px",
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
              width: "100%", padding: "16px",
              background: "#f3f4f6", color: "#1f2937",
              border: "2px solid #e5e7eb", borderRadius: "12px",
              fontSize: "16px", fontWeight: "600", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              <Package size={20} /> Parcel / Takeaway
            </button>
          </>
        ) : (
          <>
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
              color: "#fff", border: "none", borderRadius: "12px",
              fontSize: "16px", fontWeight: "600",
              cursor: selectedTable ? "pointer" : "not-allowed",
            }}>
              <CheckCircle size={20} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px" }} /> Confirm Table
            </button>

            <button onClick={() => { setStep("choose"); setSelectedTable(""); }} style={{
              width: "100%", padding: "12px", background: "transparent",
              color: "#6b7280", border: "none", cursor: "pointer",
              fontSize: "14px",
            }}>
              ← Back
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OrderTypeModal;
