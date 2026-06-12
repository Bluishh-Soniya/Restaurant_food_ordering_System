import React, { useEffect, useState } from "react";
import { fetchHomeData, fetchTrendingData } from "../api";

import Banner from "../components/Banner";
import Categories from "../components/Categories";
import Offers from "../components/Offers";
import Trending from "../components/Trending";
import MenuSection from "../components/MenuSection";

const Home = () => {

  const [data, setData] = useState(null);

  const [trendingData, setTrendingData] = useState([]);

  useEffect(() => {

    // Home API
    fetchHomeData(1)
      .then((res) => {
        console.log("HOME API DATA:", res.data);
        setData(res.data);
      })
      .catch((err) => console.error(err));

    // Trending API
    fetchTrendingData()
      .then((res) => {
        console.log("TRENDING API DATA:", res.data);
        setTrendingData(res.data);
      })
      .catch((err) => console.error(err));

  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <>
      <div className="page-flow">

        {/* ✅ Banner */}
        <Banner data={data.banner} />

        {/* ✅ Categories */}
        <Categories data={data.categories} />

        {/* ✅ Offers */}
        <Offers data={data.offers} />

        {/* ✅ Trending */}
        <Trending data={trendingData} />

      </div>

      {/* ✅ Menu Section */}
      <div
        style={{
          background: "#f5e9dc",
          borderRadius: "20px",
          margin: "20px"
        }}
      >
        <MenuSection data={data.menu} />
      </div>
    </>
  );
};

export default Home;