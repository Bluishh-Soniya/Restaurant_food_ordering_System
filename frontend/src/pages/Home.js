import React, { useEffect, useState } from "react";
import { fetchHomeData } from "../services/api";

import Banner from "../components/Banner";
import Categories from "../components/Categories";
import Offers from "../components/Offers";
import Trending from "../components/Trending";
import MenuSection from "../components/MenuSection";

const Home = ({ searchTerm = "" }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const restaurantId = 1;   // ✅ controlled (scalable later)

    fetchHomeData(restaurantId)
      .then(res => {
        console.log("API DATA:", res.data);
        setData(res.data);
        setError(null);
      })
      .catch(err => {
        console.error("Home data fetch error:", err.message);
        setError(err.message);
      });
  }, []);

  if (error) return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <h2 style={{ color: "red" }}>⚠️ Error: {error}</h2>
    </div>
  );

  if (!data) return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        color: "#999",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid #f0f0f0",
          borderTop: "4px solid #ff6b00",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ fontSize: "15px", fontWeight: "500" }}>Loading...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {/* BANNER */}
      <Banner data={data?.banner} />

      {/* CATEGORIES */}
      <Categories data={data?.categories || []} />

      {/* OFFERS */}
      <div id="offers">
        <Offers data={data?.offers || []} />
      </div>

      {/* TRENDING */}
      <div id="trending">
        <Trending data={data?.trending || []} />
      </div>

      {/* MENU */}
      <div id="menu">
        <MenuSection
          data={data?.menu || []}
          searchTerm={searchTerm}
        />
      </div>

    </div>
  );
};

export default Home;