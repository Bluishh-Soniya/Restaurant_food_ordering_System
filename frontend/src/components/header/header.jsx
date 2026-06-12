import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FooterContext } from "../../context/FooterContext";
import CartIcon from "../CartIcon";
import "./header.css";

const BASE_URL = "http://127.0.0.1:8000";

const Header = ({ searchTerm, setSearchTerm }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { footer } = useContext(FooterContext);

  // 🔹 Mobile menu toggle state
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔹 Scroll logic
  const scrollToSection = (id) => {
    setMenuOpen(false); // close mobile menu on nav click
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 200);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 🔹 Logo URL
  const logoUrl = footer?.logo
    ? footer.logo.startsWith("http")
      ? footer.logo
      : BASE_URL + footer.logo
    : null;

  return (
    <header className="navbar">

      {/* ─── DESKTOP / MAIN ROW ─── */}
      <div className="header-inner">

        {/* 🏷️ LOGO */}
        <div
          className="header-logo"
          onClick={() => { navigate("/"); setMenuOpen(false); }}
        >
          {logoUrl && (
            <img
              src={logoUrl}
              alt="logo"
            />
          )}
          <h2>{footer?.restaurant_name || "RestroScan"}</h2>
        </div>

        {/* 🔗 DESKTOP NAVIGATION */}
        <nav className="header-nav">
          <span className="nav-link" onClick={() => scrollToSection("menu")}>
            Menu
          </span>
          <span className="nav-link" onClick={() => scrollToSection("offers")}>
            Offers
          </span>
          <span className="nav-link" onClick={() => scrollToSection("trending")}>
            Trending
          </span>
        </nav>

        {/* RIGHT SECTION */}
        <div className="header-right">

          {/* 🔍 DESKTOP SEARCH */}
          <input
            type="text"
            placeholder="Search food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="header-search"
          />

          {/* 🛒 CART */}
          <CartIcon />

          {/* ☰ HAMBURGER (mobile only) */}
          <button
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            <span />
            <span />
            <span />
          </button>

        </div>
      </div>

      {/* ─── MOBILE DROPDOWN MENU ─── */}
      <div className={`mobile-nav ${menuOpen ? "open" : ""}`}>

        {/* Mobile Search */}
        <div className="mobile-search-wrap">
          <input
            type="text"
            placeholder="Search food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <span className="nav-link" onClick={() => scrollToSection("menu")}>
          Menu
        </span>
        <span className="nav-link" onClick={() => scrollToSection("offers")}>
          Offers
        </span>
        <span className="nav-link" onClick={() => scrollToSection("trending")}>
          Trending
        </span>

      </div>

    </header>
  );
};

export default Header;