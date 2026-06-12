import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/footer/footer";
import Home from "./pages/Home";
import Header from "./components/header/header";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import MenuPage from "./pages/MENU/MenuPage";
import Notifications from "./components/Notifications";
import ScrollToTop from "./components/ScrollToTop";

import { CartProvider } from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <BrowserRouter>

      {/* ✅ Resets scroll to top on every route change — prevents footer flash */}
      <ScrollToTop />

      <NotificationProvider>
        
        <CartProvider>

          {/* HEADER - FIXED */}
          <Header
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {/* NOTIFICATIONS */}
          <Notifications />

          {/* MAIN CONTENT WITH TOP MARGIN */}
          <div className="main-content">
            <Routes>

              <Route
                path="/"
                element={<Home searchTerm={searchTerm} />}
              />

              <Route path="/menu/:categoryId" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />

              <Route path="*" element={<h2>Page Not Found</h2>} />

            </Routes>
          </div>

          <Footer />

        </CartProvider>

      </NotificationProvider>

    </BrowserRouter>
  );
}

export default App;