require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Weather API endpoint with image type
app.get('/weather', async (req, res) => {
    try {
        const { location, unit = 'c' } = req.query;

        if (!location) {
            return res.status(400).json({ message: 'Location is required' });
        }

        const response = await axios.get(
            `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${location}`
        );

        const weatherData = response.data;
        const weatherCode = weatherData.current.condition.code;

        // Determine weather type for background image
        let weatherType = 'default';
        if (weatherCode >= 1000 && weatherCode <= 1030) weatherType = 'sunny';
        else if (weatherCode >= 1063 && weatherCode <= 1201) weatherType = 'rainy';
        else if (weatherCode >= 1210 && weatherCode <= 1225) weatherType = 'snowy';

        const processedData = {
            location: weatherData.location,
            current: {
                ...weatherData.current,
                temp: unit === 'c' ? weatherData.current.temp_c : weatherData.current.temp_f,
                feelslike: unit === 'c' ? weatherData.current.feelslike_c : weatherData.current.feelslike_f,
                weatherType
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

// City list endpoint
app.get('/cities', (req, res) => {
    const cities = [
        "Kolkata", "Delhi", "Mumbai", "New York", "London", "Tokyo",
        "Paris", "Berlin", "Sydney", "Moscow", "Dubai", "Singapore",
        "Toronto", "Chicago", "Los Angeles", "Beijing", "Hong Kong",
        "Seoul", "Bangkok","Rome", "Madrid", "Amsterdam"
    ];
    res.json(cities);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});