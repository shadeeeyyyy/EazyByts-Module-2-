import React, { useState, useEffect, useCallback } from 'react';
import StockCard from './StockCard';
import { useAuth } from '../../context/AuthContext';
import './MarketDashboard.css';

const defaultHighVolumeStocks = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'JPM', 'JNJ', 'V', 'MA',
    'BRK.B', 'PG', 'XOM', 'CVX', 'KO'
];

const MarketDashboard = () => {
    const { user, isAuthenticated, checkAuthStatus } = useAuth();
    const [stocksData, setStocksData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null); // New state for last update time

    const fetchMarketData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const symbolsParam = defaultHighVolumeStocks.join(',');
            const response = await fetch(`/api/stocks/quotes/multiple?symbols=${symbolsParam}`);

            if (!response.ok) {
                const errorData = await response.json();
                if (errorData.message && errorData.message.includes("Alpha Vantage API Rate Limit hit")) {
                    setError("API Rate Limit hit. Data updates are limited by the free tier. Please try again later (max 5 API calls per minute and 500 per day per IP).");
                } else {
                    throw new Error(errorData.message || 'Failed to fetch market data.');
                }
                setStocksData([]); // Clear previous data if error occurs
            } else {
                const data = await response.json();
                if (data.length === 0) {
                    setError("No stock data received. This might be due to API limits or invalid symbols.");
                    setStocksData([]);
                } else {
                    setStocksData(data);
                    setLastUpdated(new Date()); // Update last updated time
                }
            }
        } catch (err) {
            console.error('Error fetching market data:', err);
            // Check if the error message indicates rate limit
            if (err.message.includes("Alpha Vantage API Rate Limit hit")) {
                 setError("API Rate Limit hit. Data updates are limited by the free tier. Please try again later (max 5 API calls per minute and 500 per day per IP).");
            } else {
                setError(err.message || 'An unexpected error occurred while fetching market data.');
            }
            setStocksData([]); // Clear previous data on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Fetch immediately on mount
        fetchMarketData();

        // Set up interval for refreshing data every 2 hours
        // 2 hours = 2 * 60 minutes * 60 seconds * 1000 milliseconds
        const TWO_HOURS_IN_MS = 2 * 60 * 60 * 1000;
        const intervalId = setInterval(fetchMarketData, TWO_HOURS_IN_MS);

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, [fetchMarketData]);


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
            setError(err.message || 'Error updating watchlist.');
        }
    };

    const onWatchlistAdd = (symbol) => handleWatchlistAction(symbol, 'add');
    const onWatchlistRemove = (symbol) => handleWatchlistAction(symbol, 'remove');


    // Only show loading spinner if no data has been fetched yet
    if (loading && stocksData.length === 0 && !error) {
        return <div className="market-dashboard-loading">Loading live market data... Please wait up to a few minutes due to free API limitations.</div>;
    }

    return (
        <div className="market-dashboard-container">
            <h2 className="dashboard-heading">Live Market Data</h2>
            {error && <p className="error-message update-info">{error}</p>}
            {!error && lastUpdated && (
                <p className="update-info">Last Updated: {lastUpdated.toLocaleString()}. Data refreshes every 2 hours due to API limits.</p>
            )}
            {!error && !loading && stocksData.length === 0 && (
                 <p className="update-info">No stock data available. Please check back later, or ensure your API key is valid.</p>
            )}
            <div className="stocks-grid">
                {stocksData.map((stock) => (
                    <StockCard
                        key={stock.symbol}
                        stock={stock}
                        onWatchlistAdd={onWatchlistAdd}
                        onWatchlistRemove={onWatchlistRemove}
                    />
                ))}
            </div>
        </div>
    );
};

export default MarketDashboard;