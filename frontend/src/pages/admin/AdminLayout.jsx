import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { AdminContext } from '../../context/AdminContext';
import adminApi from '../../services/adminApi';

const AdminLayout = () => {
    const { adminUser, logout } = useContext(AdminContext);
    const location = useLocation();
    
    // Notification Bell State
    const [pendingOrders, setPendingOrders] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (adminUser) {
            fetchPendingOrders();
            // Since real-time polling was rejected, we fetch once on mount.
            // If we want it to feel somewhat functional, we can fetch periodically.
            const interval = setInterval(fetchPendingOrders, 10000); // 10 seconds
            return () => clearInterval(interval);
        }
    }, [adminUser]);

    const fetchPendingOrders = async () => {
        try {
            const response = await adminApi.get('orders/');
            const newOrders = response.data.filter(order => order.status === 'pending');
            setPendingOrders(newOrders);
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    if (!adminUser) {
        return <Navigate to="/admin/login" replace />;
    }

    const isActive = (path) => location.pathname === path;

    // Light Theme Colors
    const primaryColor = '#ffffff';
    const sidebarBg = '#f8f9fa';
    const sidebarText = '#495057';
    const activeSidebarBg = '#e9ecef';
    const activeSidebarBorder = '#0d6efd';
    const headerBg = '#ffffff';
    const mainBg = '#f4f6f9';

    const navItemStyle = (active) => ({
        padding: '15px 20px',
        color: active ? '#0d6efd' : sidebarText,
        fontWeight: active ? '600' : '500',
        textDecoration: 'none',
        display: 'block',
        backgroundColor: active ? activeSidebarBg : 'transparent',
        borderLeft: active ? `4px solid ${activeSidebarBorder}` : '4px solid transparent',
        transition: 'all 0.3s ease'
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", backgroundColor: mainBg }}>
            {/* Sidebar */}
            <div style={{ width: '250px', backgroundColor: sidebarBg, color: sidebarText, display: 'flex', flexDirection: 'column', boxShadow: '2px 0 10px rgba(0,0,0,0.05)', zIndex: 10 }}>
                <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid #e9ecef' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#0d6efd', color: 'white', margin: '0 auto 10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(13,110,253,0.3)' }}>A</div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#212529' }}>Admin Panel</h3>
                </div>
                <nav style={{ flex: 1, marginTop: '20px' }}>
                    <Link to="/admin" style={navItemStyle(isActive('/admin'))}>Dashboard</Link>
                    <Link to="/admin/orders" style={navItemStyle(isActive('/admin/orders'))}>Orders</Link>
                    <Link to="/admin/menu" style={navItemStyle(isActive('/admin/menu'))}>Food Menu</Link>
                    <Link to="/admin/categories" style={navItemStyle(isActive('/admin/categories'))}>Food Category</Link>
                </nav>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <header style={{ backgroundColor: headerBg, padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', zIndex: 5 }}>
                    <h2 style={{ margin: 0, fontSize: '22px', color: '#212529', fontWeight: '600' }}>Dashboard Overview</h2>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                        {/* Notification Bell */}
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', position: 'relative', padding: '5px' }}
                            >
                                🔔
                                {pendingOrders.length > 0 && (
                                    <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: '#dc3545', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px', fontWeight: 'bold' }}>
                                        {pendingOrders.length}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div style={{ position: 'absolute', top: '45px', right: '-10px', width: '300px', backgroundColor: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e9ecef' }}>
                                    <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef', fontWeight: '600' }}>
                                        Notifications
                                    </div>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {pendingOrders.length === 0 ? (
                                            <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>No new orders</div>
                                        ) : (
                                            pendingOrders.map(order => (
                                                <div key={order.id} style={{ padding: '15px', borderBottom: '1px solid #f1f3f5', transition: 'background-color 0.2s' }}>
                                                    <div style={{ fontWeight: '600', color: '#0d6efd', marginBottom: '5px' }}>New Order #{order.id}</div>
                                                    <div style={{ fontSize: '14px', color: '#495057' }}>Table: <span style={{fontWeight: 'bold'}}>{order.table_number || 'N/A'}</span></div>
                                                    <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>Items: {order.item_names}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div style={{ padding: '10px', textAlign: 'center', backgroundColor: '#f8f9fa', borderTop: '1px solid #e9ecef' }}>
                                        <Link to="/admin/orders" onClick={() => setShowNotifications(false)} style={{ color: '#0d6efd', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>View All Orders</Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={logout} style={{ padding: '8px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'background-color 0.2s', boxShadow: '0 2px 4px rgba(220,53,69,0.2)' }}>
                            Logout
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main style={{ padding: '30px', flex: 1, overflowY: 'auto' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
