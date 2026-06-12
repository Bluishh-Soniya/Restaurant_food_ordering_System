import React, { useState, useContext } from "react";
import "./footer.css";
import API from "../../services/api";
import { FooterContext } from "../../context/FooterContext";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

const BASE_URL = "http://127.0.0.1:8000";

const Footer = () => {

  const { footer } = useContext(FooterContext);

  const [email, setEmail] = useState("");

  // 🔹 Newsletter subscribe
  const handleSubscribe = () => {

    if (!email) {
      alert("Please enter email");
      return;
    }

    API.post("newsletter/", { email })

      .then((res) => {
        alert(res.data.message);
        setEmail("");
      })

      .catch((err) => {
        alert(
          err.response?.data?.message ||
          "Error occurred"
        );
      });
  };

  // 🔹 Loading state
  if (!footer) {

    return (
      <div
        style={{
          background: "#1a1a1a",
          padding: "40px",
          textAlign: "center",
          color: "#999",
        }}
      >
        Loading footer...
      </div>
    );
  }

  // 🔹 Fix image URL
  const logoUrl = footer.logo
    ? footer.logo.startsWith("http")
      ? footer.logo
      : BASE_URL + footer.logo
    : null;

  return (

    <footer className="footer">

      <div className="container">

        {/* ✅ Added grid class only */}
        <div className="footer-container grid">

          {/* 🏷️ Brand */}
          <div className="footer-column fade-up">

            {logoUrl && (
              <img
                src={logoUrl}
                alt="logo"
                className="footer-logo"
              />
            )}

            <h3 className="footer-title">
              {footer.restaurant_name}
            </h3>

            <p className="footer-description">
              {footer.description}
            </p>

          </div>

          {/* 📍 Contact */}
          <div className="footer-column fade-up">

            <h3 className="footer-title">
              CONTACT
            </h3>

            <p>{footer.address}</p>

            <p>
              <strong>{footer.phone}</strong>
            </p>

            <p>{footer.email}</p>

          </div>

          {/* 🕒 Opening Hours */}
          <div className="footer-column fade-up">

            <h3 className="footer-title">
              OPENING HOURS
            </h3>

            <p>{footer.opening_hours}</p>

          </div>

          {/* 🔗 Quick Links */}
          <div className="footer-column fade-up">

            <h3 className="footer-title">
              QUICK LINKS
            </h3>

            <ul className="footer-links">

              <li><a href="/">Home</a></li>

              <li><a href="/menu">Menu</a></li>

              <li><a href="/offers">Offers</a></li>

              <li><a href="/about">About</a></li>

            </ul>

          </div>

          {/* 📧 Newsletter */}
          <div className="footer-column fade-up">

            <h3 className="footer-title">
              SUBSCRIBE
            </h3>

            <p>
              Get latest offers & updates
            </p>

            <div className="footer-newsletter">

              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                className="footer-input"
              />

              <button
                onClick={handleSubscribe}
                className="footer-btn btn"
              >
                Subscribe
              </button>

            </div>

          </div>

        </div>

        {/* Divider */}
        <hr className="footer-divider" />

        {/* Bottom */}
        <div className="footer-bottom">

          <p>
            © 2026 {footer.restaurant_name}.
            All rights reserved.
          </p>

          {/* 🌐 Social */}
          <div className="footer-socials">

            {footer.facebook && (
              <a
                href={footer.facebook}
                target="_blank"
                rel="noreferrer"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
              >
                <FaFacebook size={24} />
                Facebook
              </a>
            )}

            {footer.instagram && (
              <a
                href={footer.instagram}
                target="_blank"
                rel="noreferrer"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
              >
                <FaInstagram size={24} />
                Instagram
              </a>
            )}

            {footer.whatsapp && (
              <a
                href={footer.whatsapp}
                target="_blank"
                rel="noreferrer"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
              >
                <FaWhatsapp size={24} />
                WhatsApp
              </a>
            )}

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;