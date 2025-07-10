let currentUnit = 'c';

document.getElementById('search-btn').addEventListener('click', fetchWeather);
document.getElementById('location-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        fetchWeather();
    }
});

document.getElementById('celsius-btn').addEventListener('click', function() {
    if (currentUnit !== 'c') {
        currentUnit = 'c';
        this.classList.add('active');
        document.getElementById('fahrenheit-btn').classList.remove('active');
        const currentLocation = document.getElementById('location-input').value;
        if (currentLocation) {
            fetchWeather();
        }
    }
});

document.getElementById('fahrenheit-btn').addEventListener('click', function() {
    if (currentUnit !== 'f') {
        currentUnit = 'f';
        this.classList.add('active');
        document.getElementById('celsius-btn').classList.remove('active');
        const currentLocation = document.getElementById('location-input').value;
        if (currentLocation) {
            fetchWeather();
        }
    }
});

async function fetchWeather() {
    const location = document.getElementById('location-input').value.trim();
    
    if (!location) {
        showError('Please enter a location');
        return;
    }
    
    try {
        const response = await fetch(`/weather?location=${encodeURIComponent(location)}&unit=${currentUnit}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch weather data');
        }
        
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        showError(error.message);
    }
}

function displayWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    const location = data.location;
    const current = data.current;
    
    weatherInfo.innerHTML = `
        <div class="location">${location.name}, ${location.country}</div>
        <div class="date">${new Date(location.localtime).toLocaleString()}</div>
        <img class="weather-icon" src="${current.condition.icon}" alt="${current.condition.text}">
        <div class="temp">${current.temp}°${currentUnit.toUpperCase()}</div>
        <div class="condition">${current.condition.text}</div>
        <div class="details">
            <div class="detail-item">
                <div>Humidity</div>
                <div>${current.humidity}%</div>
            </div>
            <div class="detail-item">
                <div>Wind</div>
                <div>${current.wind_kph} km/h</div>
            </div>
            <div class="detail-item">
                <div>Feels Like</div>
                <div>${current.feelslike}°${currentUnit.toUpperCase()}</div>
            </div>
            <div class="detail-item">
                <div>Pressure</div>
                <div>${current.pressure_mb} mb</div>
            </div>
        </div>
    `;
}

function showError(message) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = `<div class="error">${message}</div>`;
}