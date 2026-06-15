import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LayoutDashboard, ClipboardList, Utensils, FolderOpen, IndianRupee, TrendingUp, Clock, LogOut } from "lucide-react";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
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
  const [formData, setFormData] = useState({});
  
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const api = useCallback(() => {
    return axios.create({
      baseURL: `${API_URL}admin/`,
      headers: { Authorization: `Token ${token}` },
    });
  }, [token]);

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }
  }, [token, navigate]);

  const handleAuthError = useCallback((err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("adminToken");
      navigate("/admin/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!token) return;
    if (activeTab === "dashboard") {
      api().get("stats/").then(res => setStats(res.data)).catch(handleAuthError);
    } else {
      api().get(`${activeTab}/`).then(res => setData(res.data)).catch(handleAuthError);
    }
    
    // Fetch categories for the Menu Item dropdown
    if (activeTab === "menu-items") {
      api().get("categories/").then(res => setCategories(res.data)).catch(console.error);
    }
  }, [activeTab, token, api, handleAuthError]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api().patch(`orders/${orderId}/`, { status: newStatus });
      // Refresh
      api().get("orders/").then(res => setData(res.data));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (endpoint, id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api().delete(`${endpoint}/${id}/`);
      api().get(`${endpoint}/`).then(res => setData(res.data));
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
      api().get("menu-items/").then(res => setData(res.data));
    } catch (err) {
      alert("Failed to save menu item. Check your inputs.");
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
          {data.map(o => (
            <tr key={o.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: "12px", fontWeight: "600" }}>#{o.id}</td>
              <td style={{ padding: "12px", textTransform: "capitalize" }}>{o.order_type?.replace("_", " ")}</td>
              <td style={{ padding: "12px" }}>{o.table_number || "—"}</td>
              <td style={{ padding: "12px", fontSize: "13px" }}>
                {(o.items || []).map(i => `${i.item_name || i.menu_item_name} x${i.quantity}`).join(", ")}
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
      {data.length === 0 && <p style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>No orders yet</p>}
    </div>
  );

  // GENERIC TABLE (Menu Items / Categories)
  const renderGenericTable = (endpoint) => {
    const isMenu = endpoint === "menu-items";
    
    return (
      <div>
        {isMenu && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
            <button 
              onClick={() => openMenuModal()}
              style={{
                padding: "10px 20px", background: "#f97316", color: "white",
                border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer",
                boxShadow: "0 4px 6px rgba(249, 115, 22, 0.2)"
              }}
            >
              + Add Menu Item
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
                {data.map(row => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    {Object.keys(row).filter(k => typeof row[k] !== "object" && !["image", "banner", "qr_code"].includes(k)).map(k => (
                      <td key={k} style={{ padding: "12px", fontSize: "14px" }}>
                        {typeof row[k] === 'boolean' ? (row[k] ? "Yes" : "No") : String(row[k] ?? "")}
                      </td>
                    ))}
                    <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                      {isMenu && (
                        <button onClick={() => openMenuModal(row)} style={{
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
    </div>
  );
};

export default AdminDashboard;
