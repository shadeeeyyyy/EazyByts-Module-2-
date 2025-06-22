import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './StockCard.css';

const StockCard = ({ stock, onWatchlistAdd, onWatchlistRemove }) => {
    const { user } = useAuth();
    const isInWatchlist = user?.watchlist?.some(item => item.symbol === stock.symbol) || false;

    const changeClass = stock.change > 0 ? 'positive' : stock.change < 0 ? 'negative' : 'neutral';
    const changeSign = stock.change > 0 ? '+' : '';

    // Simple SVG Sparkline component
    const Sparkline = ({ data, color }) => {
        if (!data || data.length < 2) {
            return <div className="sparkline-placeholder">No trend data</div>;
        }

        const width = 100;
        const height = 30;
        const strokeWidth = 1.5; // Slightly thinner line

        // Find min/max for scaling
        const min = Math.min(...data);
        const max = Math.max(...data);

        // If min and max are the same (flat line), prevent division by zero for scaling
        const scaleFactor = (max - min) === 0 ? 0 : height / (max - min);

        // Create points for the SVG path
        const points = data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            // Scale y-coordinate, invert it for SVG (y=0 is top)
            const y = height - (value - min) * scaleFactor;
            return `<span class="math-inline">\{x\},</span>{y}`;
        }).join(' ');

        return (
            <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    points={points}
                    strokeLinecap="round" // Make line caps round
                    strokeLinejoin="round" // Make line joins round
                />
            </svg>
        );
    };

    const handleBuyClick = () => {
        console.log(`Buy initiated for ${stock.symbol} at $${stock.price.toFixed(2)}`);
    };

    const handleWatchlistClick = () => {
        if (isInWatchlist) {
            onWatchlistRemove(stock.symbol);
        } else {
            onWatchlistAdd(stock.symbol);
        }
    };

    return (
        <div className="stock-card">
            <div className="card-header">
                <h3 className="stock-symbol">{stock.symbol}</h3>
                <div className="stock-price-info">
                    <span className="current-price">${stock.price ? stock.price.toFixed(2) : 'N/A'}</span>
                    <span className={`price-change ${changeClass}`}>
                        {stock.change !== undefined ? `<span class="math-inline">\{changeSign\}</span>{stock.change.toFixed(2)} (<span class="math-inline">\{changeSign\}</span>{stock.changePercent.toFixed(2)}%)` : 'N/A'}
                    </span>
                </div>
            </div>

            <div className="card-body">
                <div className="sparkline-container">
                    <Sparkline
                        data={stock.trendline}
                        color={stock.change >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}
                    />
                </div>
                <div className="stock-details">
                    <p>High: ${stock.high ? stock.high.toFixed(2) : 'N/A'}</p>
                    <p>Low: ${stock.low ? stock.low.toFixed(2) : 'N/A'}</p>
                    <p>Volume: {stock.volume ? stock.volume.toLocaleString() : 'N/A'}</p>
                </div>
            </div>

            <div className="card-actions">
                <button className="buy-btn" onClick={handleBuyClick}>Buy</button>
                {isAuthenticated ? ( // Only show watchlist button if user is logged in
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

export default StockCard;