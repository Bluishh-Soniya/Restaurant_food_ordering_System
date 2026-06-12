import React from "react";

const Banner = ({ data }) => {
  console.log("BANNER:", data);

  if (!data || !data.image) return null;

  // ✅ HANDLE BOTH CASES (full URL or relative path)
  const imageUrl = data.image.startsWith("http")
    ? data.image
    : `http://127.0.0.1:8000${data.image}`;

  return (
    <div className="banner">
      {/* ✅ IMAGE */}
      <img
        src={imageUrl}
        alt="banner"
      />
    </div>
  );
};

export default Banner;