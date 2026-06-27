import React from "react";

const Banner = ({ data }) => {
  if (!data || !data.image) return null;

  // ✅ HANDLE BOTH CASES (full URL or relative path)
  const imageUrl = data.image.startsWith("http")
    ? data.image
    : `http://127.0.0.1:8000${data.image}`;

  return (
    <div
      className="banner-container"
      style={{
        margin: "0 calc(-50vw + 50%)",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      }}
    >
      <img
        className="banner-img-animate"
        src={imageUrl}
        alt="banner"
        style={{
          width: "100%",
          height: "auto",
          minHeight: "350px",
          maxHeight: "550px",
          objectFit: "cover",
          objectPosition: "bottom",
          display: "block",
        }}
      />
      <style>{`
        .banner-img-animate {
          animation: bannerZoom 15s infinite alternate ease-in-out;
        }
        @keyframes bannerZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
};

export default Banner;