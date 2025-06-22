import React from 'react';
import { useAuth } from '../context/AuthContext'; // Access user data from context
import './ProfilePage.css'; // Dedicated CSS for profile page

const ProfilePage = () => {
    const { user, loading } = useAuth(); // Get user from auth context

    if (loading) {
        return <div className="profile-container">Loading user data...</div>;
    }

    if (!user) {
        return <div className="profile-container error-message">User data not found. Please log in.</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <h2>👋 Welcome, {user.username}!</h2>
                <div className="profile-details">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Current Balance:</strong> <span className="balance-value">${user.balance.toFixed(2)}</span></p>
                    <p><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="watchlist-section">
                    <h3>My Watchlist ({user.watchlist.length})</h3>
                    {user.watchlist.length === 0 ? (
                        <p className="empty-message">Your watchlist is empty. Add some stocks!</p>
                    ) : (
                        <ul className="watchlist-list-profile">
                            {user.watchlist.map((item, index) => (
                                <li key={index} className="watchlist-item-profile">
                                    <span>{item.symbol}</span>
                                    {item.name && <span className="watchlist-item-name">({item.name})</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="stocks-owned-section">
                    <h3>Stocks Owned ({user.stocksOwned.length})</h3>
                    {user.stocksOwned.length === 0 ? (
                        <p className="empty-message">You don't own any stocks yet. Start simulated trading!</p>
                    ) : (
                        <ul className="stocks-owned-list-profile">
                            {user.stocksOwned.map((item, index) => (
                                <li key={index} className="stock-owned-item-profile">
                                    <span>{item.symbol}</span>
                                    <span>Quantity: {item.quantity}</span>
                                    <span>Avg. Price: ${item.purchasePrice.toFixed(2)}</span>
                                    <span className="purchase-date">Purchased: {new Date(item.purchaseDate).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {/* Add buttons for editing profile, adding to watchlist etc. later */}
            </div>
        </div>
    );
};

export default ProfilePage;