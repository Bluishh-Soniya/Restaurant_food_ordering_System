import React, { createContext, useState, useEffect } from 'react';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(null);

    useEffect(() => {
        // Load credentials from local storage if available
        const credentials = localStorage.getItem('adminCredentials');
        if (credentials) {
            setAdminUser(JSON.parse(credentials));
        }
    }, []);

    const login = (username, password) => {
        const credentials = { username, password };
        localStorage.setItem('adminCredentials', JSON.stringify(credentials));
        setAdminUser(credentials);
    };

    const logout = () => {
        localStorage.removeItem('adminCredentials');
        setAdminUser(null);
    };

    return (
        <AdminContext.Provider value={{ adminUser, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
};
