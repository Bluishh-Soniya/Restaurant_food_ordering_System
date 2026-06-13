import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {

  const [cart, setCart] = useState([]);

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

        clearCart
      }}
    >

      {children}

    </CartContext.Provider>
  );
};

export const useCart = () =>
  useContext(CartContext);