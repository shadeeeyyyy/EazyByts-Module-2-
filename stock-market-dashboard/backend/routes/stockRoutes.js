const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler'); // Don't forget this import
const { getRealtimeStockQuote, getMultipleStocksData } = require('../utils/stockApi');

// @desc    Get real-time stock quote for a single symbol
// @route   GET /api/stocks/:symbol
// @access  Public (for now)
router.get('/:symbol', asyncHandler(async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const stockData = await getRealtimeStockQuote(symbol);

        if (stockData) {
            res.json(stockData);
        } else {
            res.status(404).json({ message: `Stock data not found for symbol: ${symbol}` });
        }
    } catch (error) {
        console.error('Error in /api/stocks/:symbol route:', error.message);
        res.status(500).json({ message: error.message || 'Server Error fetching stock data' });
    }
}));

// @desc    Get real-time data for multiple stock symbols with trendlines
// @route   GET /api/stocks/quotes/multiple
// @access  Public (for now, can be restricted later if needed)
router.get('/quotes/multiple', asyncHandler(async (req, res) => {
    // Expects a comma-separated list of symbols in the query parameter, e.g., ?symbols=AAPL,MSFT,GOOGL
    const symbolsParam = req.query.symbols;

    if (!symbolsParam) {
        res.status(400).json({ message: 'Please provide symbols as a comma-separated query parameter (e.g., ?symbols=AAPL,MSFT)' });
        return;
    }

    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());

    try {
        // This will make multiple API calls internally, subject to Alpha Vantage rate limits.
        const stocksData = await getMultipleStocksData(symbols);
        res.json(stocksData);
    } catch (error) {
        console.error('Error in /api/stocks/quotes/multiple route:', error.message);
        res.status(500).json({ message: error.message || 'Server Error fetching multiple stock data' });
    }
}));


module.exports = router;