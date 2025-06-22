import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import './Header.css';

const Header = ({ isAuthenticated, user, logout }) => { // Receive props
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // Call the logout function from AuthContext
        navigate('/login'); // Redirect to login page after logout
    };

    return (
        <header className="header-container">
            <div className="logo">
                <Link to="/dashboard" style={{ textDecoration: 'none' }}> {/* Link logo to dashboard */}
                    <h1>NexTrade Stocks</h1>
                </Link>
            </div>
            <nav className="main-nav">
                <Link to="/dashboard" className="nav-item">Dashboard</Link>
                {isAuthenticated && <Link to="/profile" className="nav-item">Profile</Link>}
                <a href="#" className="nav-item">Portfolio</a>
                <a href="#" className="nav-item">Trading Sim</a>
            </nav>
            <div className="user-auth">
                {isAuthenticated ? (
                    <>
                        <span className="welcome-message">{user?.username}</span>
                        <button className="logout-btn" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="login-btn">Login</Link>
                        <Link to="/register" className="signup-btn">Sign Up</Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;