import React from 'react';
import './Sidebar.css';

// This component will be more sophisticated later, fetching real-time data for watchlist items
// For now, it just displays the symbol from the user's watchlist
const WatchlistItem = ({ symbol }) => {
    // In a real scenario, you'd fetch real-time price, change for this symbol here
    // For MVP, we only display the symbol from the user's stored watchlist
    return (
        <div className="watchlist-item">
            <div className="item-header">
                <span className="item-symbol">{symbol}</span>
                {/* Placeholder for price and change, will fetch real-time later */}
                <span className="item-price">$---.--</span>
            </div>
            <div className="item-details">
                <span className="item-change neutral">--.-- (---%)</span>
            </div>
        </div>
    );
};

const Sidebar = ({ watchlist }) => { // Accept watchlist as prop
    return (
        <aside className="sidebar-container">
            <h3 className="sidebar-title">My Watchlist</h3>
            <div className="watchlist-list">
                {watchlist && watchlist.length > 0 ? (
                    watchlist.map((item, index) => (
                        <WatchlistItem key={index} symbol={item.symbol} />
                    ))
                ) : (
                    <p className="empty-message">Your watchlist is empty.</p>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;