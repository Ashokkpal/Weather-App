require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');  // Added for cross-origin requests

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced Middleware
app.use(cors());  // Enable CORS for all routes
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',  // Cache static assets
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Weather API endpoint with improved error handling
app.get('/weather', async (req, res) => {
    try {
        const { location, unit = 'c' } = req.query;  // Default to Celsius
        
        if (!location) {
            return res.status(400).json({ 
                success: false,
                message: 'Location is required' 
            });
        }

        // Validate location input
        if (typeof location !== 'string' || location.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Invalid location format'
            });
        }

        const response = await axios.get(
            `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${encodeURIComponent(location)}`,
            { timeout: 5000 }  // 5-second timeout
        );
        
        const weatherData = response.data;
        const processedData = {
            success: true,
            location: weatherData.location,
            current: {
                ...weatherData.current,
                temp: unit === 'c' ? weatherData.current.temp_c : weatherData.current.temp_f,
                feelslike: unit === 'c' ? weatherData.current.feelslike_c : weatherData.current.feelslike_f
            }
        };
        
        res.json(processedData);
    } catch (error) {
        console.error('Weather API error:', error.message);
        
        // Custom error responses
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({
                success: false,
                message: 'Weather API request timed out'
            });
        }
        
        if (error.response) {
            const status = error.response.status;
            let message = 'Weather API error';
            
            if (status === 404) {
                message = 'Location not found';
            } else if (status === 401) {
                message = 'Invalid API key';
            }
            
            return res.status(status).json({ 
                success: false,
                message 
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
});

// Handle client-side routing for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Production error handler
if (process.env.NODE_ENV === 'production') {
    app.use((err, req, res, next) => {
        console.error('Production error:', err);
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred'
        });
    });
}

// Start server with improved logging
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`Access at: http://localhost:${PORT}`);
    if (process.env.WEATHER_API_KEY) {
        console.log('Weather API key loaded successfully');
    } else {
        console.error('WEATHER_API_KEY not found in environment variables');
    }
});