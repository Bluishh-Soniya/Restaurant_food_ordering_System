import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LayoutDashboard, ClipboardList, Utensils, FolderOpen, IndianRupee, TrendingUp, Clock, LogOut } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { key: "finance", label: "Finance", icon: <IndianRupee size={18} /> },
  { key: "orders", label: "Orders", icon: <ClipboardList size={18} /> },
  { key: "menu-items", label: "Menu Items", icon: <Utensils size={18} /> },
  { key: "categories", label: "Categories", icon: <FolderOpen size={18} /> },
];

const STATUS_COLORS = {
  pending: "#f59e0b",
  preparing: "#3b82f6",
  ready: "#10b981",
  delivered: "#6b7280",
  success: "#10b981",
  failed: "#ef4444",
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [data, setData] = useState([]);
  
  // Menu Item CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "", price: "", category: "", description: "", image: "",
    is_available: true, is_recommended: false, is_trending: false
  });

  // Category CRUD State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: "", image: "" });
  
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const api = useCallback(() => {
    return axios.create({
      baseURL: `${API_URL}admin/`,
      headers: { Authorization: `Token ${token}` },
    });
  }, [token]);

  const fetchData = useCallback((tab = activeTab) => {
    if (!token) return;
    if (tab === "dashboard") {
      api().get("stats/").then(res => setStats(res.data)).catch(handleAuthError);
    } else if (tab === "finance") {
      api().get("finance/").then(res => setData(res.data)).catch(handleAuthError);
    } else {
      api().get(`${tab}/`).then(res => setData(res.data)).catch(handleAuthError);
    }
  }, [api, activeTab, token]);

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }
    fetchData();
    
    // Fetch categories for the Menu Item dropdown
    if (activeTab === "menu-items") {
      api().get("categories/").then(res => setCategories(res.data)).catch(console.error);
    }
  }, [activeTab, token, fetchData, api]);

  const handleAuthError = useCallback((err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("adminToken");
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api().patch(`orders/${orderId}/`, { status: newStatus });
      fetchData("orders");
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (endpoint, id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api().delete(`${endpoint}/${id}/`);
      fetchData(endpoint);
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  // CRUD HANDLERS
  const openMenuModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData({
        name: item.name || "", price: item.price || "", description: item.description || "",
        image: item.image || "", category: item.category || (categories[0]?.id || ""),
        is_available: item.is_available, is_trending: item.is_trending, is_recommended: item.is_recommended
      });
    } else {
      setFormData({
        name: "", price: "", description: "", image: "", category: categories[0]?.id || "",
        is_available: true, is_trending: false, is_recommended: false
      });
    }
    setIsModalOpen(true);
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, restaurant: 1 };
      if (editingItem) {
        await api().patch(`menu-items/${editingItem.id}/`, payload);
      } else {
        await api().post(`menu-items/`, payload);
      }
      setIsModalOpen(false);
      fetchData("menu-items");
    } catch (err) {
      alert("Failed to save menu item. Check your inputs.");
      console.error(err);
    }
  };

  const openCategoryModal = (cat = null) => {
    setEditingCategory(cat);
    setCategoryFormData(cat ? { name: cat.name, image: cat.image || "" } : { name: "", image: "" });
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api().patch(`categories/${editingCategory.id}/`, categoryFormData);
      } else {
        await api().post(`categories/`, categoryFormData);
      }
      setIsCategoryModalOpen(false);
      fetchData("categories");
    } catch (err) {
      alert("Failed to save category");
      console.error(err);
    }
  };

  // DASHBOARD TAB
  const renderDashboard = () => {
    if (!stats) return <p>Loading...</p>;
    const s = stats.stats;
    const cards = [
      { label: "Total Orders", value: s.total_orders, color: "#3b82f6", icon: <ClipboardList size={18} /> },
      { label: "Today's Orders", value: s.today_orders, color: "#8b5cf6", icon: <ClipboardList size={18} /> },
      { label: "Total Revenue", value: `₹${s.total_revenue.toFixed(2)}`, color: "#10b981", icon: <IndianRupee size={18} /> },
      { label: "Today's Revenue", value: `₹${s.today_revenue.toFixed(2)}`, color: "#f59e0b", icon: <TrendingUp size={18} /> },
      { label: "Pending Orders", value: s.pending_orders, color: "#ef4444", icon: <Clock size={18} /> },
      { label: "Menu Items", value: s.menu_items, color: "#06b6d4", icon: <Utensils size={18} /> },
    ];

    return (
      <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          {cards.map((c, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: "14px", padding: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${c.color}`,
            }}>
              <p style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#6b7280", margin: "0 0 8px" }}>{c.icon} {c.label}</p>
              <p style={{ fontSize: "28px", fontWeight: "700", color: "#1f2937", margin: 0 }}>{c.value}</p>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Recent Orders</h3>
        <div style={{ background: "#fff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["ID", "Type", "Total", "Status", "Payment", "Date"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(stats.recent_orders || []).map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "14px 16px", fontWeight: "600" }}>#{o.id}</td>
                  <td style={{ padding: "14px 16px", textTransform: "capitalize" }}>{o.order_type?.replace("_", " ")}</td>
                  <td style={{ padding: "14px 16px", fontWeight: "600" }}>₹{o.total_price}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: `${STATUS_COLORS[o.status]}20`, color: STATUS_COLORS[o.status] }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: `${STATUS_COLORS[o.payment_status]}20`, color: STATUS_COLORS[o.payment_status] }}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#6b7280", fontSize: "13px" }}>{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  // ORDERS TAB
  const renderOrders = () => (
    <div style={{ background: "#fff", borderRadius: "12px", overflow: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
        <thead>
          <tr style={{ background: "#f9fafb" }}>
            {["ID", "Type", "Table", "Items", "Total", "Status", "Payment", "Razorpay ID", "Date"].map(h => (
              <th key={h} style={{ padding: "14px 12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280", borderBottom: "1px solid #e5e7eb", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(Array.isArray(data) ? data : []).map(o => (
            <tr key={o.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: "12px", fontWeight: "600" }}>#{o.id}</td>
              <td style={{ padding: "12px", textTransform: "capitalize" }}>{o.order_type?.replace("_", " ")}</td>
              <td style={{ padding: "12px" }}>{o.table_number || "—"}</td>
              <td style={{ padding: "12px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "300px" }}>
                  {o.items && o.items.length > 0 ? o.items.map((it, idx) => (
                    <span key={idx} style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", padding: "3px 8px", borderRadius: "6px", fontSize: "12px", color: "#374151", whiteSpace: "nowrap" }}>
                      {it.item_name || it.menu_item_name} <span style={{ color: "#f97316", fontWeight: "700", marginLeft: "2px" }}>x{it.quantity}</span>
                    </span>
                  )) : <span style={{ color: "#9ca3af", fontStyle: "italic", fontSize: "12px" }}>No items</span>}
                </div>
              </td>
              <td style={{ padding: "12px", fontWeight: "600" }}>₹{o.total_price}</td>
              <td style={{ padding: "12px" }}>
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}
                  style={{
                    padding: "6px 10px", borderRadius: "6px", border: "1px solid #d1d5db",
                    fontSize: "13px", fontWeight: "500", cursor: "pointer",
                    background: `${STATUS_COLORS[o.status]}15`, color: STATUS_COLORS[o.status],
                  }}
                >
                  {["pending", "preparing", "ready", "delivered"].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td style={{ padding: "12px" }}>
                <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: `${STATUS_COLORS[o.payment_status]}20`, color: STATUS_COLORS[o.payment_status] }}>
                  {o.payment_status}
                </span>
              </td>
              <td style={{ padding: "12px", fontSize: "12px", color: "#6b7280", fontFamily: "monospace" }}>{o.razorpay_payment_id || "—"}</td>
              <td style={{ padding: "12px", color: "#6b7280", fontSize: "13px", whiteSpace: "nowrap" }}>{new Date(o.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(!Array.isArray(data) || data.length === 0) && <p style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>No orders yet</p>}
    </div>
  );

  // FINANCE TAB
  const renderFinance = () => {
    if (!data || Array.isArray(data)) return <p>Loading finance data...</p>;
    
    // Max revenue for scaling the bar chart
    const maxRev = Math.max(...(data.trend?.map(d => d.revenue) || [0]), 1);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", borderLeft: "5px solid #22c55e", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "1px" }}>Total Revenue</h3>
            <p style={{ fontSize: "28px", fontWeight: "800", color: "#111", margin: 0 }}>₹{data.total_revenue}</p>
          </div>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", borderLeft: "5px solid #3b82f6", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "1px" }}>Today's Revenue</h3>
            <p style={{ fontSize: "28px", fontWeight: "800", color: "#111", margin: 0 }}>₹{data.today_revenue}</p>
          </div>
          <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", borderLeft: "5px solid #f59e0b", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "1px" }}>Avg Order Value</h3>
            <p style={{ fontSize: "28px", fontWeight: "800", color: "#111", margin: 0 }}>₹{data.aov}</p>
          </div>
        </div>

        {/* CSS Chart */}
        <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>7-Day Revenue Trend</h3>
          <div style={{ display: "flex", alignItems: "flex-end", height: "200px", gap: "2%", paddingBottom: "30px", position: "relative", borderBottom: "1px solid #e5e7eb" }}>
            {data.trend?.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", position: "relative" }}>
                <div style={{ width: "60%", height: `${(d.revenue / maxRev) * 100}%`, background: "linear-gradient(to top, #3b82f6, #60a5fa)", borderRadius: "4px 4px 0 0", minHeight: "2px", transition: "height 0.5s ease" }} title={`₹${d.revenue}`}></div>
                <span style={{ fontSize: "11px", color: "#6b7280", position: "absolute", bottom: "-25px", whiteSpace: "nowrap" }}>{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Ledger */}
        <div style={{ background: "#fff", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>Recent Transactions</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Order ID</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Items</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Date</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Amount</th>
                  <th style={{ padding: "14px 24px", textAlign: "left", fontSize: "13px", color: "#6b7280", fontWeight: "600" }}>Razorpay Ref</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions?.map((tx, idx) => (
                  <tr key={idx} style={{ borderBottom: idx === data.transactions.length - 1 ? "none" : "1px solid #f3f4f6" }}>
                    <td style={{ padding: "16px 24px", fontWeight: "600", color: "#111" }}>#{tx.id}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "350px" }}>
                        {tx.items && tx.items.length > 0 ? tx.items.map((it, i) => (
                          <span key={i} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", color: "#334155", whiteSpace: "nowrap" }}>
                            {it.name} <span style={{ color: "#f97316", fontWeight: "700", marginLeft: "2px" }}>x{it.quantity}</span>
                          </span>
                        )) : <span style={{ color: "#9ca3af", fontStyle: "italic", fontSize: "13px" }}>No items</span>}
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", color: "#4b5563", fontSize: "14px" }}>{tx.date}</td>
                    <td style={{ padding: "16px 24px", fontWeight: "700", color: "#059669" }}>₹{tx.amount}</td>
                    <td style={{ padding: "16px 24px", fontFamily: "monospace", fontSize: "12px", color: "#9ca3af" }}>{tx.razorpay_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // GENERIC TABLE (Menu Items / Categories)
  const renderGenericTable = (endpoint) => {
    const isMenu = endpoint === "menu-items";
    const isCategory = endpoint === "categories";
    
    return (
      <div>
        {(isMenu || isCategory) && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <button 
              onClick={() => isMenu ? openMenuModal() : openCategoryModal()}
              style={{
                padding: "10px 20px", background: "#f97316", color: "white",
                border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer",
                boxShadow: "0 4px 6px rgba(249, 115, 22, 0.2)"
              }}
            >
              {isMenu ? "+ Add Menu Item" : "+ Add Category"}
            </button>
          </div>
        )}
        
        {data.length === 0 ? (
          <p style={{ textAlign: "center", padding: "40px", color: "#9ca3af", background: "#fff", borderRadius: "12px" }}>No records</p>
        ) : (
          <div style={{ background: "#fff", borderRadius: "12px", overflow: "auto", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {Object.keys(data[0]).filter(k => typeof data[0][k] !== "object" && !["image", "banner", "qr_code"].includes(k)).map(k => (
                    <th key={k} style={{ padding: "14px 12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280", borderBottom: "1px solid #e5e7eb", textTransform: "capitalize" }}>
                      {k.replace(/_/g, " ")}
                    </th>
                  ))}
                  <th style={{ padding: "14px 12px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#6b7280", borderBottom: "1px solid #e5e7eb" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(data) ? data : []).map(row => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    {Object.keys(row).filter(k => typeof row[k] !== "object" && !["image", "banner", "qr_code"].includes(k)).map(k => (
                      <td key={k} style={{ padding: "12px", fontSize: "14px" }}>
                        {typeof row[k] === 'boolean' ? (row[k] ? "Yes" : "No") : String(row[k] ?? "")}
                      </td>
                    ))}
                    <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                      {(isMenu || isCategory) && (
                        <button onClick={() => isMenu ? openMenuModal(row) : openCategoryModal(row)} style={{
                          padding: "6px 14px", background: "#eff6ff", color: "#2563eb",
                          border: "1px solid #bfdbfe", borderRadius: "6px", cursor: "pointer",
                          fontSize: "13px", fontWeight: "500",
                        }}>Edit</button>
                      )}
                      <button onClick={() => handleDelete(endpoint, row.id)} style={{
                        padding: "6px 14px", background: "#fef2f2", color: "#dc2626",
                        border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer",
                        fontSize: "13px", fontWeight: "500",
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "finance": return renderFinance();
      case "orders": return renderOrders();
      case "menu-items": return renderGenericTable("menu-items");
      case "categories": return renderGenericTable("categories");
      default: return null;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter', sans-serif" }}>
      {/* SIDEBAR */}
      <div style={{
        width: "200px", background: "#111827", color: "#fff",
        display: "flex", flexDirection: "column",
        overflow: "hidden", flexShrink: 0,
      }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #1f2937" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}><Utensils size={18} /> RestroScan</h2>
          <p style={{ fontSize: "11px", color: "#9ca3af", margin: "4px 0 0" }}>Admin Dashboard</p>
        </div>

        <nav style={{ flex: 1, padding: "12px 0" }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: "flex", width: "100%", padding: "12px 16px",
                background: activeTab === tab.key ? "#1f2937" : "transparent",
                color: activeTab === tab.key ? "#fff" : "#9ca3af",
                border: "none", textAlign: "left", cursor: "pointer",
                fontSize: "13px", fontWeight: activeTab === tab.key ? "600" : "400",
                borderLeft: activeTab === tab.key ? "3px solid #ff5722" : "3px solid transparent",
                transition: "all 0.2s",
                alignItems: "center", gap: "10px",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} style={{
          padding: "12px 16px", background: "#dc2626", color: "#fff",
          border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
        }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, background: "#f3f4f6", overflow: "auto" }}>
        <div style={{
          padding: "20px 28px", background: "#fff", borderBottom: "1px solid #e5e7eb",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: "700", margin: 0, textTransform: "capitalize" }}>
              {activeTab.replace("-", " ")}
            </h1>
          </div>
          <p style={{ color: "#6b7280", fontSize: "14px", margin: 0 }}>
            Welcome, <strong>{localStorage.getItem("adminUser") || "Admin"}</strong>
          </p>
        </div>

        <div style={{ padding: "28px" }}>
          {renderContent()}
        </div>
      </div>

      {/* MENU ITEM CRUD MODAL */}
      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff", width: "500px", borderRadius: "16px", padding: "32px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            maxHeight: "90vh", overflowY: "auto"
          }}>
            <h2 style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: "700" }}>
              {editingItem ? "Edit Menu Item" : "Add Menu Item"}
            </h2>
            <form onSubmit={handleMenuSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4b5563", marginBottom: "6px" }}>Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }} />
              </div>
              
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4b5563", marginBottom: "6px" }}>Price (₹)</label>
                  <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4b5563", marginBottom: "6px" }}>Category</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", background: "#fff" }}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4b5563", marginBottom: "6px" }}>Image URL (Online Link Only)</label>
                <input type="url" placeholder="https://images.unsplash.com/..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4b5563", marginBottom: "6px" }}>Description</label>
                <textarea required rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px", resize: "vertical" }} />
              </div>

              <div style={{ display: "flex", gap: "24px", padding: "8px 0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                  <input type="checkbox" checked={formData.is_available} onChange={e => setFormData({...formData, is_available: e.target.checked})} />
                  Available
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                  <input type="checkbox" checked={formData.is_recommended} onChange={e => setFormData({...formData, is_recommended: e.target.checked})} />
                  Recommended
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                  <input type="checkbox" checked={formData.is_trending} onChange={e => setFormData({...formData, is_trending: e.target.checked})} />
                  Trending
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{
                  padding: "10px 20px", background: "#f3f4f6", color: "#4b5563",
                  border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer"
                }}>Cancel</button>
                <button type="submit" style={{
                  padding: "10px 20px", background: "#f97316", color: "#fff",
                  border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer"
                }}>Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY CRUD MODAL */}
      {isCategoryModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff", width: "400px", borderRadius: "16px", padding: "32px",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
          }}>
            <h2 style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: "700", color: "#1f2937" }}>
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>
            <form onSubmit={handleCategorySubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4b5563", marginBottom: "6px" }}>Category Name</label>
                <input required type="text" value={categoryFormData.name} onChange={e => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }} />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#4b5563", marginBottom: "6px" }}>Image URL (Online Link Only)</label>
                <input type="url" placeholder="https://images.unsplash.com/..." value={categoryFormData.image} onChange={e => setCategoryFormData({...categoryFormData, image: e.target.value})}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", fontSize: "14px" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} style={{ padding: "10px 16px", background: "#f3f4f6", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", color: "#4b5563" }}>Cancel</button>
                <button type="submit" style={{ padding: "10px 16px", background: "#f97316", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
