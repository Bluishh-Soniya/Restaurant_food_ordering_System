import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await adminApi.get('category/');
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName) return;
        try {
            await adminApi.post('category/', { name: newCategoryName });
            setNewCategoryName('');
            fetchCategories();
        } catch (error) {
            console.error("Error adding category", error);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;
        try {
            await adminApi.delete(`category/${id}/`);
            fetchCategories();
        } catch (error) {
            console.error("Error deleting category", error);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>Loading Categories...</div>;

    const tableHeaderStyle = { padding: '15px 20px', textAlign: 'left', borderBottom: '2px solid #e9ecef', backgroundColor: '#f8f9fa', color: '#495057', fontWeight: '600', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' };
    const tableCellStyle = { padding: '15px 20px', borderBottom: '1px solid #e9ecef', color: '#212529', verticalAlign: 'middle' };

    return (
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 25px 0', color: '#212529', fontSize: '20px', fontWeight: '600' }}>Manage Categories</h3>
            
            <form onSubmit={handleAddCategory} style={{ marginBottom: '30px', display: 'flex', gap: '15px' }}>
                <input 
                    type="text" 
                    placeholder="New Category Name" 
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    style={{ padding: '12px 15px', flex: 1, border: '1px solid #ced4da', borderRadius: '8px', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
                />
                <button type="submit" style={{ padding: '12px 25px', backgroundColor: '#0ba360', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', transition: 'background-color 0.2s', boxShadow: '0 4px 6px rgba(11,163,96,0.2)' }}>
                    + Add Category
                </button>
            </form>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>ID</th>
                            <th style={tableHeaderStyle}>Name</th>
                            <th style={tableHeaderStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id} style={{ transition: 'background-color 0.2s', ':hover': { backgroundColor: '#f8f9fa' } }}>
                                <td style={{...tableCellStyle, fontWeight: '600', color: '#6c757d', width: '100px'}}>{cat.id}</td>
                                <td style={{...tableCellStyle, fontWeight: '500'}}>{cat.name}</td>
                                <td style={{...tableCellStyle, width: '150px'}}>
                                    <button onClick={() => handleDeleteCategory(cat.id)} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'background-color 0.2s' }}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>No categories found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCategories;
