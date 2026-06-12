import React, { useEffect, useState, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchMenuByCategory } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { NotificationContext } from "../../context/NotificationContext";
import { FaArrowLeft } from "react-icons/fa";

const MenuPage = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, addToCart, increaseQty, decreaseQty } = useCart();
  const { addNotification } = useContext(NotificationContext);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryName = location.state?.categoryName || `Category ${categoryId}`;

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

  // ✅ HANDLE REMOVE WITH NOTIFICATION
  const handleDecreaseQty = (itemId, itemName) => {
    const cartItem = cart.find(c => c.id === itemId);
    
    if (cartItem && cartItem.quantity === 1) {
      addNotification(`${itemName} is successfully removed from cart`, "success");
    }
    
    decreaseQty(itemId);
  };


  useEffect(() => {
    const loadCategoryMenu = async () => {
      try {
        setLoading(true);
        const response = await fetchMenuByCategory(categoryId);
        setMenuItems(response.data.menu || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching category menu:", err);
        setError("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      loadCategoryMenu();
    }
  }, [categoryId]);

  if (loading) {
    return (
      <div
        style={{
          padding: "60px 20px",
          textAlign: "center",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2 style={{ color: "#666" }}>Loading menu items...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "60px 20px",
          textAlign: "center",
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2 style={{ color: "red" }}>⚠️ {error}</h2>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 20px",
            marginTop: "20px",
            cursor: "pointer",
            backgroundColor: "#ff5722",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "15px",
            fontFamily: "inherit",
          }}
        >
          Go Back Home
        </button>
      </div>
    );
  }

  return (
    <section
      className="section"
      style={{
        background: "#ffffff",
        minHeight: "100vh",
      }}
    >
      <div className="container">

        {/* BACK BUTTON */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <FaArrowLeft size={20} color="#ff5722" />
          <span
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#ff5722",
            }}
          >
            Back to Home
          </span>
        </div>

        {/* CATEGORY TITLE */}
        <h1
          style={{
            fontSize: "clamp(24px, 4vw, 42px)",
            fontWeight: "bold",
            marginBottom: "8px",
            color: "#111",
          }}
        >
          🍽️ {categoryName}
        </h1>

        <p
          style={{
            fontSize: "clamp(13px, 2vw, 16px)",
            color: "#666",
            marginBottom: "32px",
            fontStyle: "italic",
          }}
        >
          Showing {menuItems.length} delicious items in this category
        </p>

        {/* EMPTY STATE */}
        {menuItems.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#f5f5f5",
              borderRadius: "12px",
            }}
          >
            <p
              style={{
                fontSize: "18px",
                color: "#666",
                marginBottom: "20px",
              }}
            >
              No items available in this category yet.
            </p>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "12px 30px",
                backgroundColor: "#ff5722",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                fontFamily: "inherit",
              }}
            >
              Back to Home
            </button>
          </div>
        ) : (

          /* ✅ RESPONSIVE FOOD GRID */
          <div className="food-grid">
            {menuItems.map((item) => {
              const cartItem = cart.find((c) => c.id === item.id);

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
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    border: "1px solid #f0f0f0",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
                    e.currentTarget.style.transform = "translateY(-5px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(0)";
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
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/280x160?text=No+Image";
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
                        marginBottom: "6px",
                      }}
                    >
                      {item.name}
                    </p>

                    {/* DESCRIPTION */}
                    {item.description && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#888",
                          marginBottom: "8px",
                          lineHeight: "1.4",
                          maxHeight: "40px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {item.description}
                      </p>
                    )}

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
                                marginRight: "4px",
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

        )}
      </div>
    </section>
  );
};

export default MenuPage;
