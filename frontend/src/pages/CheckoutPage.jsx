import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { placeOrder, verifyPayment, createPayment } from "../services/api";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiPrinter, FiHome } from "react-icons/fi";

const TAX_RATE = 0.05; // 5% GST — same as CartPage

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const CheckoutPage = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // ✅ Mirror CartPage tax calculation exactly
  const tax = parseFloat((totalPrice * TAX_RATE).toFixed(2));
  const finalTotal = parseFloat((totalPrice + tax).toFixed(2));

  const handleOrder = async () => {
    try {
      if (!cart || cart.length === 0) {
        alert("Your cart is empty! Please add some items before checking out.");
        return;
      }

      // ✅ Read table number from localStorage
      const tableNumber = localStorage.getItem("tableNumber");

      if (!tableNumber || tableNumber === "undefined" || tableNumber === "null") {
        alert("Please scan a table QR code before placing an order. No table number found.");
        return;
      }

      const itemNames = cart.map(i => `${i.quantity}x ${i.name}`).join(", ");

      const orderData = {
        order_type: "dine_in",
        table_number: parseInt(tableNumber, 10),
        item_names: itemNames,
        total_price: finalTotal
      };

      // 1. Create Payment Order first
      const paymentRes = await createPayment({ total_price: finalTotal });
      console.log("Payment initialized:", paymentRes.data);

      if (!paymentRes.data.razorpay_order_id) {
        alert("Failed to initialize payment.");
        return;
      }

      // 2. Load Razorpay Script
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      
      if (!res) {
        alert("Razorpay SDK failed to load. Are you offline?");
        return;
      }

      // 3. Open Razorpay Popup
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || paymentRes.data.key_id,
        amount: paymentRes.data.amount,
        currency: paymentRes.data.currency,
        name: "RestroScan",
        description: "Payment for Order",
        order_id: paymentRes.data.razorpay_order_id,
        handler: async function (response) {
          try {
            const verificationData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            };
            
            // 4. Verify Payment
            const verifyRes = await verifyPayment(verificationData);
            
            if (verifyRes.status === 200) {
                // 5. Place Order after verification
                const finalOrderData = {
                  ...orderData,
                  ...verificationData
                };
                
                const orderRes = await placeOrder(finalOrderData);
                console.log("Order placed:", orderRes.data);
                
                // Set the receipt data and switch UI to success mode
                setOrderDetails({
                  id: orderRes.data.order.id,
                  items: [...cart],
                  subtotal: totalPrice,
                  tax: tax,
                  total: finalTotal,
                  date: new Date()
                });
                setIsSuccess(true);
                clearCart();
            }
          } catch (err) {
            console.error("Verification/Order Error:", err);
            alert("Payment verified but order creation failed, or verification failed!");
          }
        },
        prefill: {
          name: "Dine In User",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#ff5722"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      console.error("Order error:", err?.response?.data || err);
      alert("Something went wrong placing your order. Please try again.");
    }
  };

  if (isSuccess && orderDetails) {
    return (
      <div className="page-wrapper" style={{ background: "#f5f5f5", padding: "40px 20px", minHeight: "100vh" }}>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            #receipt-area, #receipt-area * { visibility: visible; }
            #receipt-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
            .no-print { display: none !important; }
            @page { margin: 0; }
            body { margin: 1.6cm; }
          }
        `}</style>
        <div id="receipt-area" style={{ maxWidth: "500px", margin: "0 auto" }}>
          
          {/* Success Header Card */}
          <div style={{ background: "#fff", borderRadius: "12px", padding: "30px", textAlign: "center", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "70px", height: "70px", borderRadius: "50%", background: "#e8f5e9", marginBottom: "16px" }}>
              <FiCheckCircle size={40} color="#00b894" />
            </div>
            <h2 style={{ color: "#00b894", fontSize: "24px", fontWeight: "bold", margin: "0 0 8px 0" }}>Payment Successful!</h2>
            <p style={{ color: "#666", margin: 0 }}>Your order has been placed successfully. Below is your bill.</p>
          </div>
          
          {/* Receipt Card */}
          <div style={{ background: "#fff", borderRadius: "12px", padding: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "22px", fontWeight: "bold", margin: "0 0 8px 0", color: "#1e293b" }}>RESTROSCAN</h3>
              <p style={{ margin: "0 0 4px 0", color: "#64748b", fontSize: "14px" }}>Order #{orderDetails.id}</p>
              <p style={{ margin: "0 0 4px 0", color: "#94a3b8", fontSize: "13px" }}>
                Invoice #INV-{orderDetails.id}-{orderDetails.date.toISOString().split('T')[0].replace(/-/g, '')}
              </p>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
                {orderDetails.date.toLocaleString()}
              </p>
            </div>

            <hr style={{ border: "none", borderTop: "1px dashed #cbd5e1", margin: "0 0 16px 0" }} />

            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", marginBottom: "16px" }}>
              <thead>
                <tr style={{ color: "#1e293b", fontWeight: "bold", borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 0", textAlign: "left" }}>Item</td>
                  <td style={{ padding: "8px 0", textAlign: "center" }}>Qty</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>Price</td>
                </tr>
              </thead>
              <tbody>
                {orderDetails.items.map(item => {
                  const displayPrice = item.final_price || item.price;
                  return (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "12px 0", color: "#334155" }}>{item.name}</td>
                      <td style={{ padding: "12px 0", textAlign: "center", color: "#64748b" }}>{item.quantity}</td>
                      <td style={{ padding: "12px 0", textAlign: "right", color: "#334155" }}>₹{(displayPrice * item.quantity).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748b", marginBottom: "8px" }}>
              <span>Subtotal</span>
              <span>₹{orderDetails.subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#64748b", marginBottom: "16px" }}>
              <span>Tax</span>
              <span>₹{orderDetails.tax.toFixed(2)}</span>
            </div>

            <hr style={{ border: "none", borderTop: "1px dashed #cbd5e1", margin: "0 0 16px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "bold", color: "#0f172a" }}>
              <span>Total</span>
              <span>₹{orderDetails.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="no-print" style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
            <button onClick={() => window.print()} style={{ flex: 1, padding: "14px", background: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <FiPrinter size={18} /> Download / Print Bill
            </button>
            <button onClick={() => navigate("/")} style={{ flex: 1, padding: "14px", background: "#ff5722", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <FiHome size={18} /> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ background: "#f5f5f5" }}>
      <div className="container">
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            background: "#fff",
            borderRadius: "16px",
            padding: "32px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(22px, 4vw, 32px)",
              fontWeight: "700",
              marginBottom: "24px",
              color: "#111",
            }}
          >
            Checkout
          </h2>

          {/* TABLE BADGE */}
          {localStorage.getItem("tableNumber") && (
            <div
              style={{
                background: "#fff3e0",
                border: "1px solid #ff9800",
                borderRadius: "8px",
                padding: "10px 16px",
                marginBottom: "20px",
                fontSize: "14px",
                color: "#e65100",
                fontWeight: "600",
              }}
            >
              🍽️ Table {localStorage.getItem("tableNumber")}
            </div>
          )}

          {/* ORDER ITEMS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {cart.map(item => {
              const displayPrice = item.final_price || item.price;

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: "1px solid #f0f0f0",
                    fontSize: "15px",
                  }}
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span style={{ fontWeight: "600" }}>
                    ₹{(displayPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* PRICE BREAKDOWN — mirrors CartPage exactly */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              borderTop: "2px solid #eee",
              paddingTop: "14px",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px" }}>
              <span>Subtotal</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", color: "#555" }}>
              <span>Tax (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>

            <hr style={{ margin: "4px 0", border: "none", borderTop: "1px solid #eee" }} />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              <span>Total</span>
              <span style={{ color: "#ff5722" }}>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* PLACE ORDER BUTTON */}
          <button
            onClick={handleOrder}
            style={{
              width: "100%",
              padding: "14px",
              background: "#ff5722",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "700",
              fontFamily: "inherit",
            }}
          >
            PLACE ORDER
          </button>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;