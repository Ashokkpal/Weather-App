let currentUnit = 'c';
let musicPlaying = false;
let bgMusic;
const popularCities = [
    "Kolkata","Delhi","Mumbai","New York", "London", "Tokyo", "Paris", "Berlin",
    "Sydney", "Moscow", "Dubai", "Singapore", "Toronto",
    "Chicago", "Los Angeles", "Beijing", "Hong Kong", "Seoul",
    "Bangkok", "Mumbai", "Rome", "Madrid", "Amsterdam"
];

// Initialize city datalist
function initCityList() {
    const datalist = document.getElementById('city-list');
    popularCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        datalist.appendChild(option);
    });
}

// Music toggle function
function toggleMusic() {
    const musicBtn = document.getElementById('music-toggle');
    
    if (!bgMusic) {
        // Using royalty-free music from Pixabay
        bgMusic = new Audio('https://cdn.pixabay.com/audio/2022/03/23/audio_8a5d81472e.mp3');
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
    }
    
    musicPlaying = !musicPlaying;
    
    if (musicPlaying) {
        bgMusic.play().catch(e => {
            console.log("Playback prevented:", e);
            musicPlaying = false;
            musicBtn.textContent = '🔇';
        });
        musicBtn.textContent = '🔊';
        musicBtn.style.backgroundColor = '#4a90e2';
        musicBtn.style.color = 'white';
    } else {
        bgMusic.pause();
        musicBtn.textContent = '🔇';
        musicBtn.style.backgroundColor = '#ddd';
        musicBtn.style.color = '#333';
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    initCityList();
    
    // Set up event listeners
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
    
    document.getElementById('music-toggle').addEventListener('click', toggleMusic);
    
    // Enable music after first user interaction
    document.body.addEventListener('click', () => {
        if (musicPlaying && bgMusic) {
            bgMusic.play().catch(e => console.log("Autoplay prevented:", e));
        }
    }, { once: true });
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
    
    // Update background based on weather condition
    updateBackground(current.condition.code);
    
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

function updateBackground(weatherCode) {
    const bg = document.querySelector('.background-image');
    let bgImageUrl = '';
    
    // Select background based on weather condition
    if (weatherCode >= 1000 && weatherCode <= 1030) {
        // Sunny/clear
        bgImageUrl = 'https://images.unsplash.com/photo-1560258018-c7db7645254e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
    } else if (weatherCode >= 1063 && weatherCode <= 1201) {
        // Rain
        bgImageUrl = 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
    } else if (weatherCode >= 1210 && weatherCode <= 1225) {
        // Snow
        bgImageUrl = 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
    } else {
        // Default
        bgImageUrl = 'https://images.unsplash.com/photo-1601134467661-3d775b999c8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
    }
    
    bg.style.backgroundImage = `url(${bgImageUrl})`;
}