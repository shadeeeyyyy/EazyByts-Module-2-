import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // To manage initial auth check

    // Function to store token (in local storage for persistence across sessions)
    // NOTE: While localStorage is convenient, it's not the most secure.
    // For production, consider HttpOnly cookies or more robust token management.
    const setAuthToken = (token) => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    };

    const login = (userData, token) => {
        setIsAuthenticated(true);
        setUser(userData);
        setAuthToken(token);
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        setAuthToken(null);
    };

    const checkAuthStatus = useCallback(async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Send request to backend to verify token and get user profile
                const response = await fetch('http://localhost:5000/api/users/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(true);
                    setUser(data.user);
                } else {
                    // Token invalid or expired, log out
                    console.error('Token verification failed:', response.statusText);
                    logout();
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                logout();
            }
        }
        setLoading(false);
    }, []); // Empty dependency array means this function is stable and won't re-create

    useEffect(() => {
        checkAuthStatus(); // Run on component mount
    }, [checkAuthStatus]); // Rerun if checkAuthStatus ever changes (though it's useCallback'd)

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout, checkAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);