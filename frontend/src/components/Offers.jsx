import React from "react";

const Offers = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <section
      className="section"
      style={{
        margin: "0 calc(-50vw + 50%)",
        width: "100vw",
        paddingLeft: "0",
        paddingRight: "0",
        overflow: "hidden",
        position: "relative"
      }}
    >
      {/* HEADING inside container for consistent alignment */}
      <div className="container">
        <h2
          className="heading"
          style={{ marginBottom: "20px" }}
        >
          Offers
        </h2>
      </div>

      {/* OFFER BANNERS — full bleed */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0px",
          width: "100%",
        }}
      >
        {data.map((o) => (
          <div
            key={o.id}
            className="fade-up"
            style={{
              position: "relative",
              height: "clamp(180px, 28vw, 300px)",
              width: "100%",
              overflow: "hidden",
              background: "transparent",
            }}
          >

            {/* IMAGE */}
            {o.banner && (
              <img
                src={o.banner}
                alt={o.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
            )}



            {/* TEXT OVERLAY */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "clamp(20px, 5vw, 70px)",
                transform: "translateY(-50%)",
                color: "#ffffff",
                textAlign: "left",
                maxWidth: "min(500px, 60%)",
                zIndex: 2,
              }}
            >

              {/* TITLE */}
              <h2
                style={{
                  fontSize: "clamp(22px, 5vw, 60px)",
                  fontWeight: "700",
                  marginBottom: "8px",
                  lineHeight: "1.1",
                  color: "#ffffff",
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  letterSpacing: "0.5px",
                  textShadow: "0 4px 12px rgba(0,0,0,0.30)",
                }}
              >
                {o.title}
              </h2>

              {/* DESCRIPTION */}
              <p
                style={{
                  fontSize: "clamp(14px, 3vw, 36px)",
                  fontWeight: "600",
                  marginBottom: "16px",
                  color: "#ffffff",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  lineHeight: "1.2",
                  letterSpacing: "0.5px",
                  textShadow: "0 2px 10px rgba(0,0,0,0.25)",
                }}
              >
                {o.description}
              </p>

              {/* DISCOUNT BOX */}
              <span
                style={{
                  background: "#ffffff",
                  color: "#000",
                  padding: "clamp(6px, 1.5vw, 12px) clamp(14px, 3vw, 28px)",
                  borderRadius: "12px",
                  fontWeight: "800",
                  fontSize: "clamp(13px, 2vw, 20px)",
                  display: "inline-block",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                }}
              >
                {o.discount_percentage}% OFF
              </span>

            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Offers;