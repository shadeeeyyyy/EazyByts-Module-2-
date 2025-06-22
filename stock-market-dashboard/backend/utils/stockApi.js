const axios = require('axios');

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.STOCK_API_KEY;

if (!API_KEY) {
    console.error('CRITICAL ERROR: Alpha Vantage API Key not found in .env file!');
    // In a production app, you might exit or throw here, or use a default
}

/**
 * Fetches real-time stock quote for a single stock symbol.
 * Alpha Vantage's GLOBAL_QUOTE provides the latest price and change.
 * @param {string} symbol - The stock ticker symbol (e.g., 'IBM', 'AAPL').
 * @returns {Object} - An object containing stock quote data, or null if not found.
 */
const getRealtimeStockQuote = async (symbol) => {
    try {
        const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
            params: {
                function: 'GLOBAL_QUOTE',
                symbol: symbol,
                apikey: API_KEY
            }
        });

        const quoteData = response.data['Global Quote'];

        if (quoteData && Object.keys(quoteData).length > 0 && quoteData['01. symbol']) {
            // Ensure the symbol key exists, as Alpha Vantage returns empty obj for invalid symbols
            return {
                symbol: quoteData['01. symbol'],
                open: parseFloat(quoteData['02. open']),
                high: parseFloat(quoteData['03. high']),
                low: parseFloat(quoteData['04. low']),
                price: parseFloat(quoteData['05. price']),
                volume: parseInt(quoteData['06. volume']),
                latestTradingDay: quoteData['07. latest trading day'],
                previousClose: parseFloat(quoteData['08. previous close']),
                change: parseFloat(quoteData['09. change']),
                changePercent: parseFloat(quoteData['10. change percent'].replace('%', ''))
            };
        } else {
            // console.warn(`No quote data or invalid symbol found for: ${symbol}. Response:`, response.data);
            return null;
        }

    } catch (error) {
        console.error(`Error fetching real-time stock quote for ${symbol}:`, error.message);
        // Re-throw or return null based on desired error handling strategy
        throw new Error(`Failed to fetch real-time data for ${symbol}.`);
    }
};

/**
 * Fetches historical intraday time series data for a stock symbol.
 * Used for sparklines. We'll fetch 60 minutes interval for a recent short trend.
 * Alpha Vantage free tier often limits to 5 calls per minute. Be mindful.
 * @param {string} symbol - The stock ticker symbol.
 * @param {string} interval - The interval for the time series (e.g., '1min', '5min', '15min', '60min').
 * @returns {Array<number>} - An array of closing prices for the sparkline.
 */
const getIntradayTimeSeries = async (symbol, interval = '60min', outputsize = 'compact') => {
    try {
        const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
            params: {
                function: `TIME_SERIES_INTRADAY`,
                symbol: symbol,
                interval: interval,
                outputsize: outputsize, // 'compact' for last 100 points, 'full' for full-length
                apikey: API_KEY
            }
        });

        const timeSeriesKey = `Time Series (${interval})`;
        const rawTimeSeries = response.data[timeSeriesKey];

        if (rawTimeSeries) {
            // Get the last 20-30 data points for a smooth sparkline
            const dataPoints = Object.values(rawTimeSeries)
                                    .map(entry => parseFloat(entry['4. close']))
                                    .slice(0, 30) // Get the most recent 30 points
                                    .reverse(); // Reverse to get chronological order for sparkline

            return dataPoints;
        } else {
            console.warn(`No intraday time series data found for ${symbol} with interval ${interval}. Response:`, response.data);
            return [];
        }
    } catch (error) {
        console.error(`Error fetching intraday time series for ${symbol}:`, error.message);
        throw new Error(`Failed to fetch trend data for ${symbol}.`);
    }
};


// Helper function to introduce a small delay between API calls to respect rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches real-time data and intraday history for a list of stock symbols.
 * This will make multiple individual calls to Alpha Vantage, so it's rate-limited.
 * @param {Array<string>} symbols - An array of stock ticker symbols.
 * @returns {Array<Object>} - An array of stock data objects with trendlines.
 */
const getMultipleStocksData = async (symbols) => {
    const stockDataPromises = symbols.map(async (symbol, index) => {
        // Introduce a delay to respect Alpha Vantage's 5 calls/minute limit on the free tier.
        // For 12-15 stocks, this might still hit limits. Consider batch APIs or higher tiers for production.
        await delay(index * 12000); // 12 seconds delay between each call

        try {
            const quote = await getRealtimeStockQuote(symbol);
            if (!quote) {
                console.warn(`Skipping ${symbol} due to no real-time quote data.`);
                return null; // Skip invalid or unfound symbols
            }
            const trendline = await getIntradayTimeSeries(symbol);

            return {
                ...quote,
                trendline // Attach the trendline data
            };
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error.message);
            return null; // Return null for failed fetches
        }
    });

    // Filter out any null results from failed API calls
    const results = await Promise.all(stockDataPromises);
    return results.filter(stock => stock !== null);
};


module.exports = {
    getRealtimeStockQuote, // Keep for individual search
    getMultipleStocksData, // For dashboard overview
    // getIntradayTimeSeries // Could be exposed if needed elsewhere
};