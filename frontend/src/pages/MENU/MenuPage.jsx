import React, { useEffect, useState, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { fetchMenuItems } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { NotificationContext } from "../../context/NotificationContext";
import { FaArrowLeft } from "react-icons/fa";
import { Utensils } from "lucide-react";

const MenuPage = () => {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, addToCart, increaseQty, decreaseQty } = useCart();
  const { addNotification } = useContext(NotificationContext);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryName = location.state?.categoryName || categoryId;

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
        // Note: categoryName is used because our API now filters by name instead of ID
        const response = await fetchMenuItems(1, categoryName, "");
        setMenuItems(response.data.menu || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching category menu:", err);
        setError("Failed to load menu items");
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      loadCategoryMenu();
    }
  }, [categoryName]);

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
          <Utensils size={32} style={{ marginRight: "12px", color: "#1e3a8a", verticalAlign: "middle" }} /> {categoryName}
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
                backgroundColor: "#f97316",
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

          /* Swiggy Style Menu List */
          <div style={{ background: "white", borderRadius: "24px", padding: "10px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
            {menuItems.map((item, index) => {
              const cartItem = cart.find(c => c.id === item.id);
              const isLast = index === menuItems.length - 1;
              const nonVegWords = ['chicken', 'mutton', 'beef', 'fish', 'prawn', 'egg', 'meat'];
              const veg = !nonVegWords.some(word => item.name.toLowerCase().includes(word));

              return (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    padding: "24px 16px",
                    borderBottom: isLast ? "none" : "1px dashed #e2e8f0",
                    gap: "20px"
                  }}
                >
                  {/* Left Side: Info */}
                  <div style={{ flex: 1 }}>
                    {/* Veg/Non-Veg Icon */}
                    <div style={{ 
                      width: "16px", height: "16px", border: `1px solid ${veg ? '#16a34a' : '#dc2626'}`, 
                      display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "4px",
                      marginBottom: "8px"
                    }}>
                      <div style={{ 
                        width: "8px", height: "8px", background: veg ? '#16a34a' : '#dc2626', 
                        borderRadius: veg ? "50%" : "2px" 
                      }}></div>
                    </div>

                    {/* Name */}
                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                      {item.name}
                    </h3>

                    {/* Price */}
                    <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "16px", marginBottom: "10px" }}>
                      {item.discount_percentage > 0 ? (
                        <>
                          ₹{item.final_price}{" "}
                          <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "14px", fontWeight: "500" }}>
                            ₹{item.price}
                          </span>
                        </>
                      ) : (
                        <>₹{item.price}</>
                      )}
                    </div>

                    {/* Rating & Best Seller Tag */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#16a34a", fontWeight: "700", fontSize: "13px" }}>
                        ⭐ 4.2 (1K+)
                      </div>
                      {item.is_recommended && (
                        <span style={{ background: "#fef3c7", color: "#d97706", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", fontWeight: "800" }}>
                          BESTSELLER
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p style={{ color: "#64748b", fontSize: "14px", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.description}
                    </p>
                  </div>

                  {/* Right Side: Image & Add Button */}
                  <div style={{ position: "relative", width: "140px", height: "140px", flexShrink: 0 }}>
                    <img
                      src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                      alt={item.name}
                      style={{
                        width: "100%", height: "100%", objectFit: "cover", borderRadius: "16px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                      }}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
                      }}
                    />

                    {/* Floating ADD Button */}
                    <div style={{ position: "absolute", bottom: "-12px", left: "50%", transform: "translateX(-50%)", width: "110px" }}>
                      {!cartItem ? (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="swiggy-add-btn"
                        >
                          ADD
                          <div style={{ position: "absolute", top: "2px", right: "6px", fontSize: "10px", color: "#16a34a", fontWeight: "800" }}>+</div>
                        </button>
                      ) : (
                        <div className="swiggy-qty-control">
                          <button onClick={() => handleDecreaseQty(item.id, item.name)} className="qty-btn">−</button>
                          <span style={{ fontWeight: "800", color: "#16a34a", fontSize: "15px" }}>{cartItem.quantity}</span>
                          <button onClick={() => increaseQty(item.id)} className="qty-btn">+</button>
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

      <style>{`
        .swiggy-add-btn {
          width: 100%;
          background: white;
          color: #16a34a;
          border: 1px solid #e2e8f0;
          padding: 8px 0;
          border-radius: 8px;
          font-weight: 800;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0,0,0,0.06);
          position: relative;
          transition: all 0.2s ease;
          text-align: center;
        }
        .swiggy-add-btn:hover {
          background: #f0fdf4;
          box-shadow: 0 6px 12px rgba(0,0,0,0.1);
        }
        .swiggy-qty-control {
          width: 100%;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 8px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.06);
        }
        .qty-btn {
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 20px;
          font-weight: 600;
          cursor: pointer;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qty-btn:hover {
          color: #16a34a;
        }
      `}</style>
    </section>
  );
};

export default MenuPage;
