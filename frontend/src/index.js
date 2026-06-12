import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { CartProvider } from './context/CartContext';
import { FooterProvider } from "./context/FooterContext";
import "./styles/variables.css";
import "./styles/global.css";
import "./styles/utilities.css";
import "./styles/animations.css";

// ✅ Disable browser scroll restoration BEFORE first render
// Prevents footer flash on page refresh — browser won't auto-scroll to last position
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <CartProvider>
    <FooterProvider>
    <App />
  </FooterProvider>
    </CartProvider>
  </React.StrictMode>
);