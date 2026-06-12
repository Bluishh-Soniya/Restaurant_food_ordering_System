import React, { useContext } from "react";
import { useCart } from "../context/CartContext";
import { NotificationContext } from "../context/NotificationContext";
import { FaFire } from "react-icons/fa";

const Trending = ({ data }) => {
  const { cart, addToCart, increaseQty, decreaseQty } = useCart();
  const { addNotification } = useContext(NotificationContext);

  // ✅ HANDLE ADD TO CART WITH NOTIFICATION
  const handleAddToCart = (item) => {
    const cartItem = cart.find(c => c.id === item.id);
    
    if (cartItem) {
      addNotification(`${item.name} quantity increased`, "success");
    } else {
      addNotification(`${item.name} is successfully added to cart`, "success");
    }
    
    addToCart({
      id: item.id,
      name: item.name,
      price: item.final_price || item.price,
      quantity: 1,
      image: item.image,
      final_price: item.final_price || item.price,
      discount_percentage: item.discount_percentage || 0
    });
  };


  // ✅ HANDLE REMOVE FROM CART WITH NOTIFICATION
  const handleDecreaseQty = (itemId, itemName) => {
    const cartItem = cart.find(c => c.id === itemId);
    
    if (cartItem && cartItem.quantity === 1) {
      addNotification(`${itemName} is successfully removed from cart`, "success");
    }
    
    decreaseQty(itemId);
  };

  return (

    <section className="section" style={{ background: "#f8f8f8" }}>

      <div className="container">

      <h2
        className="heading"
        style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}
      >
        <FaFire color="#ff5722" /> Trending
      </h2>

      {/* TRENDING SLIDER */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          overflowX: "auto",
          paddingBottom: "10px",
          paddingTop: "4px",
          flexWrap: "nowrap",
          scrollbarWidth: "none",
        }}
      >

        {data.map((item) => {
          const cartItem = cart.find(c => c.id === item.id);

          return (
            <div
              key={item.id}
              className="fade-up food-card"
              style={{
                minWidth: "280px",
                width: "280px",
                flexShrink: 0,
                background: "#ffffff",
                borderRadius: "18px",
                overflow: "hidden",
                border: "1px solid #e0e0e0",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column"
              }}
            >

              {/* IMAGE */}
              <div
                style={{
                  width: "100%",
                  height: "220px",
                  background: "#e0e0e0",
                  overflow: "hidden"
                }}
              >

                {item.image ? (

                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 0.5s ease"
                    }}
                  />

                ) : (

                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                      fontSize: "12px"
                    }}
                  >
                    No Image
                  </div>

                )}

              </div>

              {/* CONTENT */}
              <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column" }}>

                {/* FOOD NAME */}
                <p
                  style={{
                    fontWeight: "bold",
                    color: "#000",
                    fontSize: "18px",
                    margin: 0,
                    marginBottom: "12px"
                  }}
                >
                  {item.name}
                </p>

                {/* PRICE + BUTTON */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "auto"
                  }}
                >

                  {/* PRICE */}
                  <span
                    style={{
                      fontWeight: "bold",
                      color: "#333",
                      fontSize: "14px"
                    }}
                  >
                    {item.discount_percentage > 0 ? (
                      <>
                        <span
                          style={{
                            textDecoration: "line-through",
                            color: "#999",
                            fontSize: "13px",
                            marginRight: "5px"
                          }}
                        >
                          ₹{item.price}
                        </span>
                        <span style={{ color: "#ff5722" }}>
                          ₹{item.final_price}
                        </span>
                      </>
                    ) : (
                      <>₹{item.price}</>
                    )}
                  </span>

                  {/* ADD BUTTON */}
                  {!cartItem ? (

                    <button
                      onClick={() => handleAddToCart(item)}
                      className="btn"
                      style={{
                        padding: "8px 16px",
                        fontSize: "13px",
                        marginLeft: "auto",
                        backgroundColor: "#ff5722",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontWeight: "600"
                      }}
                    >
                      ADD+
                    </button>

                  ) : (

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}
                    >

                      <button
                        onClick={() => handleDecreaseQty(item.id, item.name)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "4px",
                          border: "none",
                          background: "#ddd",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#333"
                        }}
                      >
                        −
                      </button>

                      <span style={{ fontWeight: "bold", minWidth: "20px", textAlign: "center" }}>
                        {cartItem.quantity}
                      </span>

                      <button
                        onClick={() => increaseQty(item.id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "4px",
                          border: "none",
                          background: "#ff5722",
                          color: "#fff",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600"
                        }}
                      >
                        +
                      </button>

                    </div>

                  )}

                </div>

              </div>

            </div>
          );
        })}

      </div>

      </div>

    </section>
  );
};

export default Trending;