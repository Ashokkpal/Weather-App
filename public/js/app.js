let currentUnit = 'c';
let musicPlaying = false;
let bgMusic;
const weatherImages = {
    sunny: 'https://images.unsplash.com/photo-1560258018-c7db7645254e',
    rainy: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0',
    snowy: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5',
    default: 'https://images.unsplash.com/photo-1601134467661-3d775b999c8b'
};

// Initialize city list
async function initCityList() {
    try {
        const response = await fetch('/cities');
        const cities = await response.json();
        const datalist = document.getElementById('city-list');
        
        datalist.innerHTML = '';
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            datalist.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load city list:', error);
    }
}

// Music control
function toggleMusic() {
    if (!bgMusic) {
        bgMusic = new Audio('https://assets.mixkit.co/music/preview/mixkit-forest-flow-1507.mp3');
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
    }
    
    musicPlaying = !musicPlaying;
    const musicBtn = document.getElementById('music-toggle');
    
    if (musicPlaying) {
        bgMusic.play().catch(e => {
            console.log("Playback prevented:", e);
            musicPlaying = false;
            musicBtn.textContent = '🔇';
        });
        musicBtn.textContent = '🔊';
    } else {
        bgMusic.pause();
        musicBtn.textContent = '🔇';
    }
}

// Update background based on weather
function updateBackground(weatherType) {
    const bg = document.querySelector('.background-image');
    bg.style.backgroundImage = `url(${weatherImages[weatherType]})`;
}

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    initCityList();
    
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
    
    document.getElementById('music-toggle').addEventListener('click', toggleMusic);
    
    // Enable music after first interaction
    document.body.addEventListener('click', () => {
        if (musicPlaying && bgMusic) {
            bgMusic.play().catch(e => console.log("Autoplay prevented:", e));
        }
    }, { once: true });
});

// Fetch weather data
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

// Display weather
function displayWeather(data) {
    const weatherInfo = document.getElementById('weather-info');
    const location = data.location;
    const current = data.current;
    
    updateBackground(current.weatherType);
    
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