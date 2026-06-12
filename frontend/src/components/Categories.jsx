import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUtensils } from "react-icons/fa";

const Categories = ({ data }) => {

  const navigate = useNavigate();

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const handleCategoryClick = (categoryId, categoryName) => {
    navigate(`/menu/${categoryId}`, { state: { categoryName } });
  };

  return (

    <section className="section" style={{ background: "#f8f8f8" }}>

      <div className="container">

        {/* HEADING */}
        <h2
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "clamp(22px, 4vw, 36px)",
            fontWeight: "bold"
          }}
        >
          <FaUtensils color="#1e3a8a" />
          Categories
        </h2>

        <p
          style={{
            color: "#666",
            fontSize: "clamp(14px, 2vw, 18px)",
            lineHeight: "1.7",
            maxWidth: "760px",
            marginBottom: "32px",
            marginTop: "10px",
            fontWeight: "500",
            fontFamily: "'Outfit', sans-serif",
            fontStyle: "italic"
          }}
        >
          Choose from a diverse menu featuring a delectable array of dishes.
          Our mission is to satisfy your cravings and elevate your dining
          experience, one delicious meal at a time.
        </p>

        {/* CATEGORY ROW */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            overflowX: "auto",
            paddingBottom: "12px",
            paddingTop: "4px",
            alignItems: "flex-start",
            justifyContent: "center",
            scrollbarWidth: "none",
          }}
        >

          {data.map((cat) => (

            <div
              key={cat.id}
              className="fade-up food-card"
              onClick={() => handleCategoryClick(cat.id, cat.name)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "160px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.85";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >

              {/* CIRCLE IMAGE */}
              <div
                style={{
                  width: "160px",
                  height: "160px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "5px solid #fff",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                  background: "#fff",
                  marginBottom: "14px",
                  flexShrink: 0,
                }}
              >

                {cat.image ? (

                  <img
                    src={cat.image}
                    alt={cat.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block"
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
                      background: "#eee",
                      color: "#777",
                      fontSize: "12px"
                    }}
                  >
                    No Image
                  </div>

                )}

              </div>

              {/* CATEGORY NAME */}
              <p
                style={{
                  fontWeight: "700",
                  fontSize: "clamp(13px, 2vw, 18px)",
                  color: "#111",
                  textAlign: "center",
                  lineHeight: "1.3"
                }}
              >
                {cat.name}
              </p>

            </div>

          ))}

        </div>

      </div>

    </section>
  );
};

export default Categories;