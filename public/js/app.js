let currentUnit = 'c';
let bgMusic;
const popularCities = [
    "Kolkata", "New York", "London", "Tokyo", "Paris", "Berlin",
    "Sydney", "Moscow", "Dubai", "Singapore", "Toronto",
    "Chicago", "Los Angeles", "Beijing", "Hong Kong", "Seoul",
    "Bangkok", "Mumbai", "Rome", "Madrid", "Amsterdam"
];

// Weather-specific music
const weatherMusic = {
    sunny: 'https://assets.mixkit.co/music/preview/mixkit-summer-beach-party-1290.mp3',
    rainy: 'https://assets.mixkit.co/music/preview/mixkit-rainy-day-1168.mp3',
    snowy: 'https://assets.mixkit.co/music/preview/mixkit-winter-snow-1293.mp3',
    default: 'https://assets.mixkit.co/music/preview/mixkit-relaxing-guitar-melody-1240.mp3'
};

// Display cities as clickable buttons
function displayCities() {
    const citiesContainer = document.createElement('div');
    citiesContainer.className = 'cities-container';
    
    // Add heading
    const heading = document.createElement('h3');
    heading.textContent = 'Popular Cities:';
    citiesContainer.appendChild(heading);
    
    // Add city buttons
    const citiesList = document.createElement('div');
    citiesList.className = 'cities-list';
    
    popularCities.forEach(city => {
        const cityBtn = document.createElement('button');
        cityBtn.className = 'city-btn';
        cityBtn.textContent = city;
        cityBtn.addEventListener('click', () => {
            document.getElementById('location-input').value = city;
            fetchWeather();
        });
        citiesList.appendChild(cityBtn);
    });
    
    citiesContainer.appendChild(citiesList);
    document.querySelector('.container').insertBefore(
        citiesContainer,
        document.querySelector('.weather-info')
    );
}

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    displayCities();
    
    // Event listeners
    document.getElementById('search-btn').addEventListener('click', fetchWeather);
    document.getElementById('location-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchWeather();
    });
    
    document.getElementById('celsius-btn').addEventListener('click', () => {
        currentUnit = 'c';
        document.getElementById('celsius-btn').classList.add('active');
        document.getElementById('fahrenheit-btn').classList.remove('active');
        if (document.getElementById('location-input').value) fetchWeather();
    });
    
    document.getElementById('fahrenheit-btn').addEventListener('click', () => {
        currentUnit = 'f';
        document.getElementById('fahrenheit-btn').classList.add('active');
        document.getElementById('celsius-btn').classList.remove('active');
        if (document.getElementById('location-input').value) fetchWeather();
    });
    
    // Enable music after first interaction
    document.body.addEventListener('click', initMusic, { once: true });
});

// Music control
function initMusic() {
    const musicIndicator = document.getElementById('music-indicator');
    musicIndicator.style.display = 'flex';
    
    musicIndicator.addEventListener('click', () => {
        if (bgMusic) {
            if (bgMusic.paused) {
                bgMusic.play();
                musicIndicator.textContent = '♪';
            } else {
                bgMusic.pause();
                musicIndicator.textContent = '🔇';
            }
        }
    });
}

function playWeatherMusic(weatherType) {
    if (bgMusic) {
        bgMusic.pause();
    }
    
    bgMusic = new Audio(weatherMusic[weatherType]);
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    
    // Try to autoplay (works after user interaction)
    const playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log('Autoplay prevented - will play after user interaction');
        });
    }
}

// Fetch and display weather
async function fetchWeather() {
    const location = document.getElementById('location-input').value.trim();
    const weatherInfo = document.getElementById('weather-info');
    
    if (!location) {
        showError('Please enter a location');
        return;
    }
    
    weatherInfo.innerHTML = '<div class="loading">Loading weather...</div>';
    
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
    
    // Play weather-appropriate music
    playWeatherMusic(current.weatherType);
    
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