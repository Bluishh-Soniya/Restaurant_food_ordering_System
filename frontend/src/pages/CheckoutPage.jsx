import React from "react";
import { useCart } from "../context/CartContext";
import { placeOrder, verifyPayment } from "../services/api";
import { useNavigate } from "react-router-dom";

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

  // ✅ Mirror CartPage tax calculation exactly
  const tax = parseFloat((totalPrice * TAX_RATE).toFixed(2));
  const finalTotal = parseFloat((totalPrice + tax).toFixed(2));

  const handleOrder = async () => {
    try {
      // ✅ Read table number from localStorage (set when QR was scanned)
      const tableNumber = localStorage.getItem("tableNumber");

      if (!tableNumber || tableNumber === "undefined" || tableNumber === "null") {
        alert("Please scan a table QR code before placing an order. No table number found.");
        return;
      }

      const orderData = {
        order_type: "dine_in",
        table_number: parseInt(tableNumber, 10),
        items: cart.map(i => ({
          menu_item: i.id,
          quantity: i.quantity
        }))
      };

      const orderRes = await placeOrder(orderData);
      console.log("Order placed:", orderRes.data);

      if (!orderRes.data.razorpay_order_id) {
        // Fallback if Razorpay is not configured or failed to initialize
        clearCart();
        alert(`✅ Order placed!\nTable: ${tableNumber || "N/A"}\nTotal (incl. tax): ₹${finalTotal}`);
        navigate("/");
        return;
      }

      // Load Razorpay Script
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      
      if (!res) {
        alert("Razorpay SDK failed to load. Are you offline?");
        return;
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || orderRes.data.key_id,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "RestroScan",
        description: "Payment for Order",
        order_id: orderRes.data.razorpay_order_id,
        handler: async function (response) {
          try {
            const data = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            };
            const result = await verifyPayment(data);
            alert("✅ " + result.data.message);
            clearCart();
            navigate("/");
          } catch (err) {
            console.error(err);
            alert("Payment verification failed!");
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