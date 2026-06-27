import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState([]);

  // ✅ SESSION MANAGEMENT — groups multiple orders into one dining session
  const [activeSessionId, setActiveSessionIdState] = useState(() => {
    const tableNo = localStorage.getItem("tableNumber");
    return tableNo ? (localStorage.getItem(`session_${tableNo}`) || null) : null;
  });

  // Function to switch tables reliably
  const changeTable = (newTable) => {
    localStorage.setItem("tableNumber", newTable);
    setCart([]); // Clear unsaved cart items
    setActiveSessionIdState(localStorage.getItem(`session_${newTable}`) || null);
  };

  const setActiveSessionId = (sessionId) => {
    const tableNo = localStorage.getItem("tableNumber");
    setActiveSessionIdState(sessionId);
    if (sessionId && tableNo) {
      localStorage.setItem(`session_${tableNo}`, sessionId);
    } else if (tableNo) {
      localStorage.removeItem(`session_${tableNo}`);
    }
  };

  // ✅ END SESSION — clears session and cart for CURRENT table
  const endSession = () => {
    const tableNo = localStorage.getItem("tableNumber");
    setActiveSessionIdState(null);
    if (tableNo) {
      localStorage.removeItem(`session_${tableNo}`);
    }
    setCart([]);
  };

  // ✅ ADD ITEM
  const addToCart = (item) => {
    // ✅ MUST HAVE A TABLE NUMBER FIRST
    const tableNumber = localStorage.getItem("tableNumber");
    if (!tableNumber || tableNumber === "undefined" || tableNumber === "null") {
      alert("Please scan a table QR code before adding items to the cart.");
      return;
    }

    // ✅ PRESERVE OFFER DATA
    const fixedItem = {
      ...item,

      image: item.image || "",

      final_price:
        item.final_price || item.price,

      discount_percentage:
        item.discount_percentage || 0
    };

    setCart((prev) => {

      const exist = prev.find(
        i => i.id === fixedItem.id
      );

      // ✅ IF ITEM ALREADY EXISTS
      if (exist) {

        return prev.map(i =>

          i.id === fixedItem.id

            ? {
                ...i,
                quantity: i.quantity + 1
              }

            : i
        );
      }

      // ✅ ADD NEW ITEM
      return [
        ...prev,
        {
          ...fixedItem,
          quantity: 1
        }
      ];
    });
  };

  // ✅ REMOVE ITEM
  const removeFromCart = (id) => {

    setCart(prev =>
      prev.filter(item => item.id !== id)
    );
  };

  // ✅ INCREASE QTY
  const increaseQty = (id) => {

    setCart(prev =>

      prev.map(item =>

        item.id === id

          ? {
              ...item,
              quantity: item.quantity + 1
            }

          : item
      )
    );
  };

  // ✅ DECREASE QTY
  const decreaseQty = (id) => {

    setCart(prev =>

      prev
        .map(item =>

          item.id === id

            ? {
                ...item,
                quantity: item.quantity - 1
              }

            : item
        )

        .filter(item => item.quantity > 0)
    );
  };

  // ✅ TOTAL PRICE WITH OFFER
  const totalPrice = cart.reduce(
    (total, item) => {

      // ✅ USE BACKEND FINAL PRICE
      const price =
        item.final_price || item.price;

      return total + (
        price * item.quantity
      );
    },
    0
  );

  // ✅ CLEAR CART
  const clearCart = () => {
    setCart([]);
  };

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

        activeSessionId,

        setActiveSessionId,

        endSession,

        changeTable
      }}
    >

      {children}

    </CartContext.Provider>
  );
};

export const useCart = () =>
  useContext(CartContext);