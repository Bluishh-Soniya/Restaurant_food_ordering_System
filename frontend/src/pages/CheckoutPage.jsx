import React from "react";
import { useCart } from "../context/CartContext";
import { placeOrder } from "../services/api";

const CheckoutPage = () => {
  const { cart, totalPrice } = useCart();


  const handleOrder = async () => {
    try {
      const orderData = {
        restaurant: 1,
        order_type: "dine_in",
        items: cart.map(i => ({
          menu_item: i.id,
          quantity: i.quantity
        }))
      };

      const orderRes = await placeOrder(orderData);
      console.log("Order:", orderRes.data);
      alert("Order placed successfully! ✅");

    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong");
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
              const displayPrice = item.final_price || item.price;  // ✅ FIX

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
                    ₹{displayPrice * item.quantity}
                  </span>
                </div>
              );
            })}
          </div>

          {/* TOTAL */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              fontSize: "18px",
              padding: "14px 0",
              borderTop: "2px solid #eee",
              marginBottom: "24px",
            }}
          >
            <span>Total</span>
            <span>₹{totalPrice}</span>
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