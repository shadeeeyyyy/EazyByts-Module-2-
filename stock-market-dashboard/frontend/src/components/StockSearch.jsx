import React, { useState } from 'react';
import './StockSearch.css'; // We'll create this CSS file next

const StockSearch = () => {
    const [symbol, setSymbol] = useState('');
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStockData = async () => {
        if (!symbol) {
            setError('Please enter a stock symbol.');
            setStockData(null);
            return;
        }

        setLoading(true);
        setError(null); // Clear previous errors

        try {
            // Make sure your backend server is running on port 5000
            const response = await fetch(`/api/stocks/${symbol}`); // Vite proxy will handle the rest!

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch stock data.');
            }

            const data = await response.json();
            setStockData(data);
        } catch (err) {
            console.error('Error fetching stock data:', err);
            setError(err.message || 'An unexpected error occurred.');
            setStockData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setSymbol(e.target.value.toUpperCase()); // Convert to uppercase for consistency
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            fetchStockData();
        }
    };

    return (
        <div className="stock-search-container">
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Search Individual Stock (e.g., AAPL, GOOGL)"
                    value={symbol}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={fetchStockData} disabled={loading}>
                    {loading ? 'Fetching...' : 'Get Stock Data'}
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            {stockData && (
                <div className="stock-data-display">
                    <h2>{stockData.symbol}</h2>
                    <p>Price: <span className="price">${stockData.price.toFixed(2)}</span></p>
                    <p>Change: <span className={stockData.change >= 0 ? 'positive' : 'negative'}>
                        {stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                    </span></p>
                    <p>Open: ${stockData.open.toFixed(2)}</p>
                    <p>High: ${stockData.high.toFixed(2)}</p>
                    <p>Low: ${stockData.low.toFixed(2)}</p>
                    <p>Volume: {stockData.volume.toLocaleString()}</p>
                    <p>Last Trading Day: {stockData.latestTradingDay}</p>
                </div>
            )}
        </div>
    );
};

export default StockSearch;