import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle, Printer, Home } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/";

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [invoice, setInvoice] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (orderId) {
      axios.get(`${API_URL}invoice/${orderId}/`)
        .then(res => setInvoice(res.data))
        .catch(err => console.error("Failed to fetch invoice:", err));
    }
  }, [orderId]);

  if (!orderId) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <h2>No Order ID found</h2>
        <button onClick={() => navigate("/")} style={{ marginTop: "20px", padding: "10px 20px", background: "#ff5722", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>Go Home</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px", background: "#f5f5f5", minHeight: "80vh", display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: "600px", width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {/* Success Banner */}
        <div style={{ background: "#fff", padding: "30px", borderRadius: "16px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ marginBottom: "16px", color: "#10b981" }}><CheckCircle size={48} style={{ display: "inline-block" }} /></div>
          <h1 style={{ margin: 0, fontSize: "28px", color: "#10b981", fontWeight: "700" }}>Payment Successful!</h1>
          <p style={{ color: "#6b7280", marginTop: "10px", fontSize: "15px" }}>Your order has been placed successfully. Below is your bill.</p>
        </div>

        {/* Invoice Area to Print */}
        {invoice ? (
          <div id="invoice-area" style={{ background: "#fff", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ textAlign: "center", borderBottom: "2px dashed #e5e7eb", paddingBottom: "20px", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#1f2937" }}>RESTROSCAN</h2>
              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>Order #{invoice.order}</p>
              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>Invoice #{invoice.invoice_number}</p>
              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>{new Date(invoice.generated_at).toLocaleString()}</p>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" }}>Item</th>
                  <th style={{ textAlign: "center", paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" }}>Qty</th>
                  <th style={{ textAlign: "right", paddingBottom: "12px", borderBottom: "1px solid #e5e7eb" }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.order_details?.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>{item.name}</td>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #f3f4f6", textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ padding: "12px 0", borderBottom: "1px solid #f3f4f6", textAlign: "right" }}>₹{item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#4b5563" }}>
              <span>Subtotal</span>
              <span>₹{invoice.subtotal}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "#4b5563" }}>
              <span>Tax</span>
              <span>₹{invoice.tax}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "20px", color: "#1f2937", borderTop: "2px dashed #e5e7eb", paddingTop: "16px" }}>
              <span>Total</span>
              <span>₹{invoice.total}</span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", background: "#fff", borderRadius: "16px" }}>Loading your bill...</div>
        )}

        {/* Actions (Hidden when printing) */}
        <div className="no-print" style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "10px" }}>
          <button 
            onClick={() => window.print()} 
            disabled={!invoice}
            style={{ padding: "14px 24px", background: "#1f2937", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "16px", cursor: "pointer", flex: 1 }}
          >
            <Printer size={18} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px" }} /> Download / Print Bill
          </button>
          <button 
            onClick={() => navigate("/")} 
            style={{ padding: "14px 24px", background: "#ff5722", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", fontSize: "16px", cursor: "pointer", flex: 1 }}
          >
            <Home size={18} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "6px" }} /> Back to Home
          </button>
        </div>

      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-area, #invoice-area * { visibility: visible; }
          #invoice-area { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;
