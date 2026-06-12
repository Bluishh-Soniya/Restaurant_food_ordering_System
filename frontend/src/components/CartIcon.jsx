import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { MdOutlineShoppingCart } from "react-icons/md";

const CartIcon = () => {
  const { cart } = useCart();
  const navigate = useNavigate();

  const totalItems = cart.reduce((t, i) => t + i.quantity, 0);

  return (
    <div
      onClick={() => navigate("/cart")}
      style={{
        background: "#ff7a00",
        padding: "14px 26px",
        borderRadius: "40px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        color: "#fff",
        fontWeight: "600",
        fontSize: "18px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        transition: "0.3s ease"
      }}
    >
      <MdOutlineShoppingCart size={28} color="#fff" />

      <span>Cart ({totalItems})</span>
    </div>
  );
};

export default CartIcon;