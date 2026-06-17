import React, { useContext, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../context/NotificationContext";
import { MdOutlineShoppingCart } from "react-icons/md";
import { Package, Utensils, RefreshCw } from "lucide-react";
import OrderTypeModal from "../components/OrderTypeModal";

const CartPage = () => {
  const { cart, increaseQty, decreaseQty, removeFromCart, totalPrice } = useCart();
  const { addNotification } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const handleRemove = (itemId, itemName) => {
    addNotification(`${itemName} removed from cart`, "error");
    removeFromCart(itemId);
  };

  const orderType = localStorage.getItem("orderType");
  const tableNumber = localStorage.getItem("tableNumber");
  const tax = totalPrice * 0.05;
  const finalTotal = totalPrice + tax;

  return (
    <div className="page-wrapper" style={{ background: "#f5f5f5" }}>
      <div className="container">
        <h2 style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: "bold", marginBottom: "12px" }}>
          <MdOutlineShoppingCart size={42} color="#1e3a8a" />
          Shopping Cart
        </h2>

        {/* ORDER TYPE BADGE + SWITCH */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          {orderType === "parcel" ? (
            <div style={{ background: "#e8f5e9", border: "1px solid #4caf50", borderRadius: "8px", padding: "10px 16px", fontSize: "14px", color: "#2e7d32", fontWeight: "600" }}>
              <Package size={16} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }} /> Parcel / Takeaway
            </div>
          ) : orderType === "dine-in" ? (
            <div style={{ background: "#fff3e0", border: "1px solid #ff9800", borderRadius: "8px", padding: "10px 16px", fontSize: "14px", color: "#e65100", fontWeight: "600" }}>
              <Utensils size={16} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }} /> Table {tableNumber}
            </div>
          ) : null}
          <button
            onClick={() => setShowSwitchModal(true)}
            style={{
              padding: "8px 16px", borderRadius: "8px", border: "1px solid #d1d5db",
              background: "#fff", color: "#374151", fontSize: "13px", cursor: "pointer",
              fontWeight: "500", transition: "all 0.2s",
            }}
          >
            <RefreshCw size={16} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }} /> Switch
          </button>
        </div>

        <OrderTypeModal isOpen={showSwitchModal} onClose={() => setShowSwitchModal(false)} />

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: "18px", color: "#666" }}>Your cart is empty</p>
          </div>
        ) : (
          <div className="cart-layout">
            {/* LEFT — ITEMS */}
            <div className="cart-items-panel" style={{ flex: 2, background: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              {cart.map((item) => {
                const displayPrice = item.final_price || item.price;
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #f0f0f0", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 2, minWidth: "200px" }}>
                      {item.image && (
                        <img src={item.image} alt={item.name} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "12px", flexShrink: 0 }} />
                      )}
                      <div>
                        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>{item.name}</h3>
                        <p style={{ margin: "4px 0 0", color: "#555", fontSize: "14px" }}>₹{displayPrice}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, justifyContent: "center" }}>
                      <button onClick={() => decreaseQty(item.id)} style={{ padding: "6px 10px", borderRadius: "4px", border: "none", background: "#ddd", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#333" }}>−</button>
                      <span style={{ fontWeight: "bold", minWidth: "24px", textAlign: "center", fontSize: "15px" }}>{item.quantity}</span>
                      <button onClick={() => increaseQty(item.id)} style={{ padding: "6px 10px", borderRadius: "4px", border: "none", background: "#ff5722", color: "#fff", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>+</button>
                    </div>
                    <div style={{ textAlign: "right", flex: 1, minWidth: "80px" }}>
                      <p style={{ margin: 0, fontWeight: "600" }}>₹{(displayPrice * item.quantity).toFixed(2)}</p>
                      <button onClick={() => handleRemove(item.id, item.name)} style={{ marginTop: "6px", border: "1px solid red", background: "transparent", color: "red", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT — SUMMARY */}
            <div className="cart-summary-panel" style={{ flex: 1, background: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", alignSelf: "flex-start" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Order Summary</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ display: "flex", justifyContent: "space-between", fontSize: "15px" }}><span>Subtotal</span><span>₹{totalPrice.toFixed(2)}</span></p>
                <p style={{ display: "flex", justifyContent: "space-between", fontSize: "15px" }}><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></p>
                <hr style={{ margin: "4px 0", border: "none", borderTop: "1px solid #eee" }} />
                <p style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "17px" }}><span>Total</span><span>₹{finalTotal.toFixed(2)}</span></p>
              </div>
              <button onClick={() => navigate("/checkout")} style={{ width: "100%", marginTop: "24px", padding: "14px", background: "#2e7d32", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", cursor: "pointer", fontWeight: "600", fontFamily: "inherit" }}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .cart-layout { display: flex; gap: 24px; align-items: flex-start; }
        @media (max-width: 768px) {
          .cart-layout { flex-direction: column; }
          .cart-items-panel, .cart-summary-panel { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default CartPage;