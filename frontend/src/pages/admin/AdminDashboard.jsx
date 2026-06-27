import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await adminApi.get('dashboard/');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        // Set up periodic fetching to make tabs "working" like the user requested.
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const Widget = ({ title, value, colorClass, icon, gradient }) => (
        <div style={{ 
            background: gradient, 
            color: '#fff', 
            padding: '25px', 
            borderRadius: '12px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 15px 25px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)';
        }}
        >
            <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '500', opacity: 0.9 }}>{title}</h4>
                <h2 style={{ margin: 0, fontSize: '36px', fontWeight: '700' }}>{value}</h2>
            </div>
            <div style={{ fontSize: '48px', opacity: 0.8, filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))' }}>{icon}</div>
        </div>
    );

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontSize: '18px', color: '#6c757d' }}>Loading Dashboard Data...</div>;
    if (!stats) return <div style={{ color: '#dc3545', textAlign: 'center', marginTop: '50px' }}>Failed to load stats. Ensure backend is running.</div>;

    return (
        <div>
            <h3 style={{ marginBottom: '25px', color: '#495057', fontWeight: '600', fontSize: '1.2rem' }}>Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                <Widget title="Total Orders (Today)" value={stats.total_orders} gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" icon="🛒" />
                <Widget title="New Orders" value={stats.new_orders} gradient="linear-gradient(135deg, #f6d365 0%, #fda085 100%)" icon="🆕" />
                <Widget title="Confirmed Orders" value={stats.confirmed_orders} gradient="linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" icon="✔️" />
                <Widget title="Food Being Prepared" value={stats.ready_orders} gradient="linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)" icon="🍳" />
                
                <Widget title="Food Delivered" value={stats.delivered_orders} gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" icon="🚚" />
                <Widget title="Cancelled Orders" value={stats.cancelled_orders} gradient="linear-gradient(135deg, #ff0844 0%, #ffb199 100%)" icon="❌" />
                <Widget title="Today's Sales" value={`₹${stats.todays_sales}`} gradient="linear-gradient(135deg, #0ba360 0%, #3cba92 100%)" icon="💰" />
                <Widget title="Total Sales (All Time)" value={`₹${stats.total_sales}`} gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" icon="📈" />
            </div>
            
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                <h4 style={{ margin: '0 0 20px 0', color: '#343a40' }}>Quick Actions</h4>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button style={{ padding: '12px 24px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: '#495057', transition: 'all 0.2s' }}>+ Add Menu Item</button>
                    <button style={{ padding: '12px 24px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: '#495057', transition: 'all 0.2s' }}>+ Add Category</button>
                    <button style={{ padding: '12px 24px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: '#495057', transition: 'all 0.2s' }}>View All Orders</button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
