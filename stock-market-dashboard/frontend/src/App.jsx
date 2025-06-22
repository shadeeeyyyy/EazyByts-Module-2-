import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import LoginPage from './pages/LoginPage'; // Will create these pages next
import RegisterPage from './pages/RegisterPage'; // Will create these pages next
import ProfilePage from './pages/ProfilePage'; // Will create these pages next
import './App.css';

// Context for authentication (we'll create this)
import { AuthProvider, useAuth } from './context/AuthContext';

// Component to protect routes
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth(); // Get auth status from context

    if (loading) {
        return <div className="loading-spinner">Loading...</div>; // Simple loading indicator
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};


function AppContent() {
    // Use useAuth to get authentication state in AppContent
    const { isAuthenticated, user, login, logout, checkAuthStatus } = useAuth();
    const [sidebarVisible, setSidebarVisible] = useState(true); // State to control sidebar visibility

    // Effect to check auth status on app load
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);


    return (
        <div className="main-layout">
            <Header isAuthenticated={isAuthenticated} user={user} logout={logout} />
            {isAuthenticated && <Sidebar watchlist={user?.watchlist || []} />} {/* Show sidebar only if logged in */}
            <main className="content-area" style={{
                marginLeft: isAuthenticated ? 'var(--sidebar-width)' : '0', // Adjust margin if sidebar is present
                width: isAuthenticated ? `calc(100% - var(--sidebar-width))` : '100%', // Adjust width if sidebar is present
            }}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage login={login} />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} /> {/* Redirect root to dashboard */}

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={<PrivateRoute><DashboardOverview /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                    {/* Add other protected routes here later */}
                </Routes>
            </main>
        </div>
    );
}

// Main App component that wraps AppContent with AuthProvider
function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;