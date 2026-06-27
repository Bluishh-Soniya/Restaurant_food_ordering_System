import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await adminApi.get('orders/');
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching orders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await adminApi.put(`orders/${orderId}/`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            console.error("Error updating status", error);
            alert("Failed to update status");
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>Loading Orders...</div>;

    const tableHeaderStyle = { padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #e9ecef', backgroundColor: '#f8f9fa', color: '#495057', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' };
    const tableCellStyle = { padding: '15px 20px', borderBottom: '1px solid #e9ecef', color: '#212529', verticalAlign: 'middle' };

    return (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, color: '#212529', fontSize: '20px', fontWeight: '600' }}>Order Management</h3>
                <span style={{ backgroundColor: '#e9ecef', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', color: '#495057', fontWeight: '500' }}>Total: {orders.length}</span>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Order ID</th>
                            <th style={tableHeaderStyle}>Table No.</th>
                            <th style={tableHeaderStyle}>Items</th>
                            <th style={tableHeaderStyle}>Total Price</th>
                            <th style={tableHeaderStyle}>Payment</th>
                            <th style={tableHeaderStyle}>Date</th>
                            <th style={tableHeaderStyle}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} style={{ transition: 'background-color 0.2s', ':hover': { backgroundColor: '#f8f9fa' } }}>
                                <td style={{...tableCellStyle, fontWeight: '600', color: '#0d6efd'}}>#{order.id}</td>
                                <td style={tableCellStyle}>
                                    <span style={{ backgroundColor: '#e9ecef', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
                                        {order.table_number || 'N/A'}
                                    </span>
                                </td>
                                <td style={{...tableCellStyle, maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} title={order.item_names}>{order.item_names}</td>
                                <td style={{...tableCellStyle, fontWeight: '600'}}>₹{order.total_price}</td>
                                <td style={tableCellStyle}>
                                    <span style={{ 
                                        padding: '5px 10px', 
                                        borderRadius: '20px', 
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        backgroundColor: order.payment_status === 'success' ? '#d1e7dd' : '#f8d7da',
                                        color: order.payment_status === 'success' ? '#0f5132' : '#842029'
                                    }}>
                                        {order.payment_status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{...tableCellStyle, color: '#6c757d', fontSize: '14px'}}>{new Date(order.created_at).toLocaleDateString()}</td>
                                <td style={tableCellStyle}>
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        style={{ 
                                            padding: '8px 12px', 
                                            borderRadius: '6px', 
                                            border: '1px solid #ced4da',
                                            backgroundColor: order.status === 'pending' ? '#fff3cd' : order.status === 'delivered' ? '#d1e7dd' : '#f8f9fa',
                                            color: order.status === 'pending' ? '#664d03' : order.status === 'delivered' ? '#0f5132' : '#212529',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            outline: 'none'
                                        }}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="preparing">Preparing</option>
                                        <option value="ready">Ready</option>
                                        <option value="delivered">Delivered</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#6c757d', fontSize: '16px' }}>No orders found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
