import React, { useContext, useState } from "react";
import { useCart } from "../context/CartContext";
import { NotificationContext } from "../context/NotificationContext";
import { FaUtensils } from "react-icons/fa";

const MenuSection = ({ data, searchTerm }) => {

  const { cart, addToCart, increaseQty, decreaseQty } = useCart();
  const { addNotification } = useContext(NotificationContext);
  const [showAll, setShowAll] = useState(false);

  if (!data || data.length === 0) return null;

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
      price: item.final_price,
      quantity: 1,
      image: item.image,
      final_price: item.final_price,
      discount_percentage: item.discount_percentage
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

  // ✅ FILTER LOGIC
  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes((searchTerm || "").toLowerCase())
  );

  // ✅ SLICE TO 8 ITEMS UNLESS 'showAll' IS TRUE OR SEARCH IS ACTIVE
  // If user is searching, we might want to show all matching results, but let's stick to max 8 if not expanded
  const itemsToShow = showAll ? filteredData : filteredData.slice(0, 8);

  return (

    <section className="section" style={{ background: "#ffffff" }}>

      <div className="container">

        {/* TITLE */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <h2 className="heading" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FaUtensils color="#ff5722" /> OUR MENU
          </h2>

          {filteredData.length > 8 && (
            <span
              onClick={() => setShowAll(!showAll)}
              style={{
                cursor: "pointer",
                color: "var(--primary)",
                fontWeight: "600",
                fontSize: "14px",
              }}
            >
              {showAll ? "Show Less ←" : "See All →"}
            </span>
          )}
        </div>

        {/* EMPTY STATE */}
        {filteredData.length === 0 && (
          <p className="subtitle">No items found</p>
        )}

        {/* ✅ RESPONSIVE FOOD GRID */}
        <div className="food-grid">

          {itemsToShow.map(item => {

            const cartItem = cart.find(c => c.id === item.id);

            return (

              <div
                key={item.id}
                className="fade-up food-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  background: "#ffffff",
                  overflow: "hidden",
                  borderRadius: "18px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  border: "1px solid #f0f0f0",
                }}
              >

                {/* IMAGE */}
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    display: "block",
                  }}
                />

                {/* CONTENT */}
                <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column" }}>

                  {/* NAME */}
                  <p
                    style={{
                      fontWeight: "bold",
                      fontSize: "15px",
                      color: "#222",
                      marginBottom: "8px",
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
                      marginTop: "auto",
                    }}
                  >

                    {/* PRICE */}
                    <span
                      style={{
                        fontWeight: "bold",
                        color: "#333",
                        fontSize: "14px",
                      }}
                    >
                      {item.discount_percentage > 0 ? (
                        <>
                          <span
                            style={{
                              textDecoration: "line-through",
                              color: "#999",
                              fontSize: "13px",
                            }}
                          >
                            ₹{item.price}
                          </span>{" "}
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
                          padding: "8px 14px",
                          fontSize: "13px",
                        }}
                      >
                        ADD+
                      </button>

                    ) : (

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
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
                            color: "#333",
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
                            fontWeight: "600",
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

        {/* BUTTON */}
        {filteredData.length > 8 && (
          <div
            style={{
              textAlign: "center",
              marginTop: "40px",
            }}
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn"
              style={{
                padding: "16px 40px",
                fontSize: "16px",
              }}
            >
              {showAll ? "↑ SHOW LESS" : "🔍 EXPLORE FULL MENU"}
            </button>
          </div>
        )}

      </div>

    </section>
  );
};

export default MenuSection;