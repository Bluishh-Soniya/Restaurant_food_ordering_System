import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./components/footer/footer";
import Home from "./pages/Home";
import Header from "./components/header/header";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import MenuPage from "./pages/MENU/MenuPage";
import Notifications from "./components/Notifications";
import ScrollToTop from "./components/ScrollToTop";
import OrderTypeModal from "./components/OrderTypeModal";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OrderSuccess from "./pages/OrderSuccess";

import { CartProvider, useCart } from "./context/CartContext";
import { NotificationProvider } from "./context/NotificationContext";

// Inner component that can access CartContext
const AppContent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { showOrderModal, setShowOrderModal } = useCart();

  useEffect(() => {
    // Ensure tableNumber starts at 1 if not already set by scanning a QR
    if (!localStorage.getItem("tableNumber") || localStorage.getItem("tableNumber") === "undefined" || localStorage.getItem("tableNumber") === "null") {
      localStorage.setItem("tableNumber", "1");
    }
  }, []);

  return (
    <>
      <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <Notifications />
      <OrderTypeModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
      />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home searchTerm={searchTerm} />} />
          <Route path="/menu/:categoryId" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminDashboard />} />

          <Route path="*" element={<h2 style={{textAlign:"center",marginTop:"80px"}}>Page Not Found</h2>} />
        </Routes>
      </div>

      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <NotificationProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;