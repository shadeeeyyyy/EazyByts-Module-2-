import React from 'react';
import StockSearch from '../StockSearch';
import MarketDashboard from './MarketDashboard';
import { useAuth } from '../../context/AuthContext';
import './DashboardOverview.css';
import './StockCard.css'; // Ensure StockCard.css is imported for button styles

const StatCard = ({ title, value, change, isMoney = false, symbol, onWatchlistAdd, onWatchlistRemove }) => {
    const { user, isAuthenticated } = useAuth();
    const changeClass = change >= 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
    const formattedChange = change !== undefined ? (change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2)) : 'N/A';
    const displayValue = isMoney ? `$${value.toFixed(2)}` : value.toLocaleString();

    const isInWatchlist = user?.watchlist?.some(item => item.symbol === symbol) || false;

    const handleBuyClick = () => {
        console.log(`Buy initiated for <span class="math-inline">{title} (${symbol})</span>`);
    };

    const handleWatchlistClick = () => {
        if (isInWatchlist) {
            onWatchlistRemove(symbol);
        } else {
            onWatchlistAdd(symbol);
        }
    };

    return (
        <div className="stat-card">
            <h4 className="card-title">{title}</h4>
            <p className="card-value">{displayValue}</p>
            {change !== undefined && (
                <p className={`card-change ${changeClass}`}>{formattedChange}</p>
            )}
            <div className="card-actions stat-card-actions">
                <button className="buy-btn" onClick={handleBuyClick}>Buy</button>
                {isAuthenticated ? (
                    <button
                        className={`watchlist-btn ${isInWatchlist ? 'remove' : 'add'}`}
                        onClick={handleWatchlistClick}
                    >
                        {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    </button>
                ) : (
                    <button className="watchlist-btn disabled" disabled>Login to Watchlist</button>
                )}
            </div>
        </div>
    );
};

const DashboardOverview = () => {
    const { isAuthenticated, checkAuthStatus } = useAuth();

    const handleWatchlistAction = async (symbol, action) => {
        if (!isAuthenticated) {
            alert('Please log in to manage your watchlist.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users/watchlist', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ symbol, action })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Failed to ${action} stock from watchlist.`);
            }

            checkAuthStatus();
            console.log(data.message);
        } catch (err) {
            console.error('Error updating watchlist:', err);
        }
    };

    const onWatchlistAdd = (symbol) => handleWatchlistAction(symbol, 'add');
    const onWatchlistRemove = (symbol) => handleWatchlistAction(symbol, 'remove');

    const marketStats = [
        { title: "S&P 500", value: 5200.75, change: 12.30, symbol: "^GSPC" },
        { title: "NASDAQ", value: 16300.20, change: -25.50, symbol: "^IXIC" },
        { title: "Dow Jones", value: 39500.15, change: 80.75, symbol: "^DJI" },
    ];

    return (
        <div className="dashboard-overview-container">
            {/* 1. Search Individual Stock section */}
            {/* <h2 className="dashboard-heading">Search Individual Stock</h2> */}
            <StockSearch />

            {/* 3. Major Market Indices section */}
            <h2 className="dashboard-heading" style={{ marginTop: '50px' }}>Major Market Indices</h2>
            <div className="market-stats-grid">
                {marketStats.map((stat, index) => (
                    <StatCard
                        key={index}
                        {...stat}
                        onWatchlistAdd={onWatchlistAdd}
                        onWatchlistRemove={onWatchlistRemove}
                    />
                ))}
            </div>

            {/* 2. Live Market Data Dashboard */}
            <MarketDashboard />

        </div>
    );
};

export default DashboardOverview;