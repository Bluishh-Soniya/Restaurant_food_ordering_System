import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // ADD ITEM — prompts modal if no orderType set
  const addToCart = (item) => {
    const orderType = localStorage.getItem("orderType");

    if (!orderType) {
      setShowOrderModal(true);
      return;
    }

    const fixedItem = {
      ...item,
      image: item.image || "",
      final_price: item.final_price || item.price,
      discount_percentage: item.discount_percentage || 0,
    };

    setCart((prev) => {
      const exist = prev.find((i) => i.id === fixedItem.id);
      if (exist) {
        return prev.map((i) =>
          i.id === fixedItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...fixedItem, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const totalPrice = cart.reduce((total, item) => {
    const price = item.final_price || item.price;
    return total + price * item.quantity;
  }, 0);

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        totalPrice,
        clearCart,
        showOrderModal,
        setShowOrderModal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);