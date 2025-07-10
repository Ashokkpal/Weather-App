require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Weather API endpoint
app.get('/weather', async (req, res) => {
    try {
        const { location, unit } = req.query;
        
        if (!location) {
            return res.status(400).json({ message: 'Location is required' });
        }
        
        const response = await axios.get(
            `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${location}`
        );
        
        const weatherData = response.data;
        const processedData = {
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
        if (error.response) {
            res.status(error.response.status).json({ 
                message: error.response.data.error?.message || 'Weather API error' 
            });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});