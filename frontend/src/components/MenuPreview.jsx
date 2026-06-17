import React from "react";
import { ClipboardList } from "lucide-react";
import { useCart } from "../context/CartContext";

const MenuPreview = ({ data }) => {

  const { addToCart } = useCart();

  if (!data || data.length === 0) return null;

  return (

    <section className="section container">

      <h2 className="heading">
        <ClipboardList size={20} style={{ marginRight: "6px", verticalAlign: "middle" }} /> Menu Preview
      </h2>

      {/* SAFE GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(280px, 280px))",
          gap: "25px",
          justifyContent: "flex-start"
        }}
      >

        {data.map((item) => (

          <div
            key={item.id}
            className="fade-up"
            style={{
              width: "280px",
              minWidth: "280px",
              background: "#ffffff",
              borderRadius: "18px",
              border: "1px solid #e0e0e0",
              boxShadow:
                "0 2px 8px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textAlign: "center",
              padding: "15px",
              flexShrink: 0
            }}
          >

            {/* NAME */}
            <h3
              className="subtitle"
              style={{
                marginTop: "0",
                marginBottom: "10px"
              }}
            >
              {item.name}
            </h3>

            {/* PRICE */}
            <div style={{ marginBottom: "15px" }}>

              {item.discount_percentage > 0 ? (

                <>
                  <span
                    style={{
                      textDecoration: "line-through",
                      color: "var(--text-light)",
                      fontSize: "13px"
                    }}
                  >
                    ₹{item.price}
                  </span>{" "}

                  <strong
                    style={{
                      color: "var(--primary)",
                      fontSize: "16px"
                    }}
                  >
                    ₹{item.final_price}
                  </strong>

                  <span
                    style={{
                      color: "var(--primary)",
                      marginLeft: "5px",
                      fontSize: "12px"
                    }}
                  >
                    ({item.discount_percentage}% OFF)
                  </span>
                </>

              ) : (

                <strong style={{ fontSize: "16px" }}>
                  ₹{item.price}
                </strong>

              )}

            </div>

            {/* BUTTON */}
            <button
              onClick={() => addToCart(item)}
              className="btn"
              style={{
                padding: "10px 16px",
                fontSize: "12px",
                marginTop: "auto"
              }}
            >
              ADD+
            </button>

          </div>

        ))}

      </div>

    </section>
  );
};

export default MenuPreview;