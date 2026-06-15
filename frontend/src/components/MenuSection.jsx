import React, { useContext, useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { NotificationContext } from "../context/NotificationContext";
import { Star, ChevronDown } from "lucide-react";
import { fetchMenuItems } from "../services/api";

const MenuSection = ({ data, categories, searchTerm }) => {
  const { cart, addToCart, increaseQty, decreaseQty } = useCart();
  const { addNotification } = useContext(NotificationContext);
  
  const [showAll, setShowAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  
  // State for dynamic backend fetching
  const [menuItems, setMenuItems] = useState(data || []);
  const [loading, setLoading] = useState(false);

  // Derive categories from the passed prop so they never disappear
  const categoryNames = ["All", "Recommended", "Trending", ...(categories || []).map(c => c.name).filter(Boolean)];

  // Fetch from backend when category or search changes
  useEffect(() => {
    // Optimization: Skip initial fetch if we already have the default unfiltered data and no search is active
    if (activeCategory === "All" && !searchTerm && data && data.length > 0 && menuItems.length === data.length) {
      return; 
    }

    const loadMenu = async () => {
      setLoading(true);
      try {
        const response = await fetchMenuItems(1, activeCategory, searchTerm);
        setMenuItems(response.data.menu || []);
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      loadMenu();
    }, 300);

    return () => clearTimeout(timer);
  }, [activeCategory, searchTerm]);


  const isVeg = (name) => {
    const nonVegWords = ['chicken', 'mutton', 'beef', 'fish', 'prawn', 'egg', 'meat'];
    return !nonVegWords.some(word => name.toLowerCase().includes(word));
  };

  const handleAddToCart = (item) => {
    const cartItem = cart.find(c => c.id === item.id);
    if (cartItem) {
      addNotification(`${item.name} quantity increased`, "success");
    } else {
      addNotification(`${item.name} added to cart`, "success");
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

  const handleDecreaseQty = (itemId, itemName) => {
    const cartItem = cart.find(c => c.id === itemId);
    if (cartItem && cartItem.quantity === 1) {
      addNotification(`${itemName} removed from cart`, "success");
    }
    decreaseQty(itemId);
  };

  const itemsToShow = showAll ? menuItems : menuItems.slice(0, 10);

  return (
    <section id="menu" style={{ background: "#f8f9fa", padding: "60px 0" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* Title Area */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: "900", color: "#1e293b", marginBottom: "8px", letterSpacing: "-0.5px" }}>
              Explore Menu
            </h2>
            <div style={{ height: "4px", width: "40px", background: "#f97316", borderRadius: "2px" }}></div>
          </div>
        </div>

        {/* Categories / Filter Chips (Swiggy Style) */}
        <div style={{ 
          display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "16px", 
          scrollbarWidth: "none", msOverflowStyle: "none", marginBottom: "16px" 
        }}>
          {categoryNames.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: activeCategory === cat ? "1px solid #f97316" : "1px solid #e2e8f0",
                background: activeCategory === cat ? "#fff7ed" : "#ffffff",
                color: activeCategory === cat ? "#ea580c" : "#64748b",
                fontWeight: activeCategory === cat ? "700" : "600",
                fontSize: "14px",
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: activeCategory === cat ? "0 2px 8px rgba(249, 115, 22, 0.1)" : "0 2px 4px rgba(0,0,0,0.02)"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {!loading && menuItems.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
            <img src="https://illustrations.popsy.co/amber/shattered-plate.svg" alt="Empty" style={{width: '120px', marginBottom: '16px', opacity: 0.8}} />
            <p style={{ color: "#64748b", fontSize: "16px", fontWeight: "500" }}>We couldn't find any dishes matching your search.</p>
          </div>
        )}

        {/* Swiggy Style Menu List */}
        <div style={{ background: "white", borderRadius: "24px", padding: "10px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)" }}>
          
          {loading ? (
            /* Skeleton Loaders */
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} style={{ display: "flex", padding: "24px 16px", borderBottom: idx === 3 ? "none" : "1px dashed #e2e8f0", gap: "20px" }}>
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: "16px", height: "16px", borderRadius: "4px", marginBottom: "8px" }}></div>
                  <div className="skeleton" style={{ width: "60%", height: "24px", borderRadius: "4px", marginBottom: "6px" }}></div>
                  <div className="skeleton" style={{ width: "30%", height: "20px", borderRadius: "4px", marginBottom: "12px" }}></div>
                  <div className="skeleton" style={{ width: "90%", height: "14px", borderRadius: "4px", marginBottom: "4px" }}></div>
                  <div className="skeleton" style={{ width: "70%", height: "14px", borderRadius: "4px" }}></div>
                </div>
                <div className="skeleton" style={{ width: "140px", height: "140px", borderRadius: "16px", flexShrink: 0 }}></div>
              </div>
            ))
          ) : (
            /* Actual Items */
            itemsToShow.map((item, index) => {
              const cartItem = cart.find(c => c.id === item.id);
              const veg = isVeg(item.name);
              const isLast = index === itemsToShow.length - 1;

              return (
                <div
                  key={item.id}
                  className="fade-in"
                  style={{
                    display: "flex",
                    padding: "24px 16px",
                    borderBottom: isLast ? "none" : "1px dashed #e2e8f0",
                    gap: "20px",
                    animationDelay: `${index * 0.05}s`
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
                        <Star size={14} fill="#16a34a" /> 4.2 (1K+)
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
            })
          )}
        </div>

        {/* Explore More Button */}
        {!loading && menuItems.length > 10 && (
          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <button
              onClick={() => setShowAll(!showAll)}
              style={{
                padding: "14px 32px", background: "transparent", border: "1px solid #cbd5e1",
                borderRadius: "12px", color: "#334155", fontWeight: "700", fontSize: "15px",
                cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {showAll ? "Show Less" : "See Full Menu"} <ChevronDown size={18} style={{ display: "inline", verticalAlign: "middle", transform: showAll ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
          </div>
        )}

      </div>

      <style>{`
        .skeleton {
          background: #e2e8f0;
          background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
          border-radius: 5px;
          background-size: 200% 100%;
          animation: 1.5s shine linear infinite;
        }
        @keyframes shine {
          to {
            background-position-x: -200%;
          }
        }
        .fade-in {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
          transform: translateY(10px);
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
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

export default MenuSection;