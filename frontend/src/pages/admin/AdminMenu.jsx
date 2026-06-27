import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';

const AdminMenu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [menuRes, catRes] = await Promise.all([
                adminApi.get('menu/'),
                adminApi.get('category/')
            ]);
            setMenuItems(menuRes.data);
            setCategories(catRes.data);
            if (catRes.data.length > 0) {
                setCategoryId(catRes.data[0].id);
            }
        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await adminApi.post('menu/', {
                name,
                price,
                description,
                category: categoryId,
                restaurant: 1 // Default restaurant ID
            });
            setName('');
            setPrice('');
            setDescription('');
            fetchData();
        } catch (error) {
            console.error("Error adding item", error);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm("Are you sure you want to delete this menu item?")) return;
        try {
            await adminApi.delete(`menu/${id}/`);
            fetchData();
        } catch (error) {
            console.error("Error deleting item", error);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>Loading Menu...</div>;

    const inputStyle = { padding: '12px 15px', marginBottom: '15px', width: '100%', border: '1px solid #ced4da', borderRadius: '8px', boxSizing: 'border-box', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' };
    const tableHeaderStyle = { padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #e9ecef', backgroundColor: '#f8f9fa', color: '#495057', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' };
    const tableCellStyle = { padding: '15px 20px', borderBottom: '1px solid #e9ecef', color: '#212529', verticalAlign: 'middle' };

    return (
        <div>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)', marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#212529', fontSize: '20px', fontWeight: '600' }}>Add New Menu Item</h3>
                
                <form onSubmit={handleAddItem} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <input style={inputStyle} type="text" placeholder="Item Name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <input style={inputStyle} type="number" step="0.01" placeholder="Price (₹)" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </div>
                    <div>
                        <select style={inputStyle} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <textarea style={{...inputStyle, height: '100px', resize: 'vertical'}} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <button type="submit" style={{ padding: '12px 25px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', transition: 'background-color 0.2s', boxShadow: '0 4px 6px rgba(13,110,253,0.2)' }}>
                            + Add Menu Item
                        </button>
                    </div>
                </form>
            </div>

            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                    <h3 style={{ margin: 0, color: '#212529', fontSize: '20px', fontWeight: '600' }}>Menu Items List</h3>
                    <span style={{ backgroundColor: '#e9ecef', padding: '6px 12px', borderRadius: '20px', fontSize: '14px', color: '#495057', fontWeight: '500' }}>Total: {menuItems.length}</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={tableHeaderStyle}>ID</th>
                                <th style={tableHeaderStyle}>Name</th>
                                <th style={tableHeaderStyle}>Price</th>
                                <th style={tableHeaderStyle}>Category</th>
                                <th style={tableHeaderStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuItems.map((item) => {
                                const catName = categories.find(c => c.id === item.category)?.name || item.category;
                                return (
                                <tr key={item.id} style={{ transition: 'background-color 0.2s', ':hover': { backgroundColor: '#f8f9fa' } }}>
                                    <td style={{...tableCellStyle, fontWeight: '600', color: '#6c757d'}}>{item.id}</td>
                                    <td style={{...tableCellStyle, fontWeight: '500'}}>{item.name}</td>
                                    <td style={{...tableCellStyle, fontWeight: '600', color: '#198754'}}>₹{item.price}</td>
                                    <td style={tableCellStyle}>
                                        <span style={{ backgroundColor: '#e9ecef', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '500' }}>{catName}</span>
                                    </td>
                                    <td style={tableCellStyle}>
                                        <button onClick={() => handleDeleteItem(item.id)} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'background-color 0.2s' }}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            )})}
                            {menuItems.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>No menu items found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminMenu;
