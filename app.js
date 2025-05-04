// API Configuration
const apiKey = "bcf4c801acf86d9eedd307a521d20d8e"; // Replace with your real API key
const baseUrl = "https://api.openweathermap.org/data/2.5";

// DOM Elements
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const weatherDisplay = document.getElementById("weatherDisplay");
const forecastContainer = document.getElementById("forecastContainer");
const additionalInfo = document.getElementById("additionalInfo");
const lastUpdated = document.getElementById("lastUpdated");

// Event Listeners
searchBtn.addEventListener("click", getWeatherByCity);
locationBtn.addEventListener("click", getWeatherByLocation);
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") getWeatherByCity();
});

// Get weather by city name
async function getWeatherByCity() {
  const city = cityInput.value.trim();
  
  if (!city) {
    showError("Please enter a city name");
    return;
  }
  
  showLoading();
  
  try {
    const currentWeather = await fetchWeather(city);
    const forecast = await fetchForecast(city);
    displayWeather(currentWeather, forecast);
  } catch (error) {
    showError("City not found. Please try another location.");
    console.error("Error fetching weather data:", error);
  }
}

// Get weather by user's location
async function getWeatherByLocation() {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser");
    return;
  }
  
  showLoading();
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const currentWeather = await fetchWeatherByCoords(latitude, longitude);
        const forecast = await fetchForecastByCoords(latitude, longitude);
        displayWeather(currentWeather, forecast);
      } catch (error) {
        showError("Unable to retrieve weather data for your location");
        console.error("Error fetching weather data:", error);
      }
    },
    (error) => {
      showError("Unable to retrieve your location. Please enable location services.");
      console.error("Geolocation error:", error);
    }
  );
}

// Fetch current weather data
async function fetchWeather(city) {
  const response = await fetch(
    `${baseUrl}/weather?q=${city}&appid=${apiKey}&units=metric`
  );
  if (!response.ok) throw new Error("City not found");
  return await response.json();
}

// Fetch weather forecast data
async function fetchForecast(city) {
  const response = await fetch(
    `${baseUrl}/forecast?q=${city}&appid=${apiKey}&units=metric`
  );
  if (!response.ok) throw new Error("Forecast not available");
  return await response.json();
}

// Fetch weather by coordinates
async function fetchWeatherByCoords(lat, lon) {
  const response = await fetch(
    `${baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );
  if (!response.ok) throw new Error("Weather data not available");
  return await response.json();
}

// Fetch forecast by coordinates
async function fetchForecastByCoords(lat, lon) {
  const response = await fetch(
    `${baseUrl}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
  );
  if (!response.ok) throw new Error("Forecast not available");
  return await response.json();
}

// Display weather data
function displayWeather(current, forecast) {
  // Update last updated time
  const now = new Date();
  lastUpdated.textContent = `Last updated: ${now.toLocaleString()}`;
  
  // Display current weather
  weatherDisplay.innerHTML = `
    <div class="current-weather">
      <h2>${current.name}, ${current.sys.country}</h2>
      <div class="weather-main">
        <img class="weather-icon" src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" alt="${current.weather[0].description}">
        <div>
          <div class="temperature">${Math.round(current.main.temp)}°C</div>
          <div>${current.weather[0].description}</div>
          <div>Feels like: ${Math.round(current.main.feels_like)}°C</div>
        </div>
      </div>
      <div class="weather-details">
        <div class="weather-detail">
          <i class="fas fa-tint"></i>
          <div>Humidity</div>
          <div>${current.main.humidity}%</div>
        </div>
        <div class="weather-detail">
          <i class="fas fa-wind"></i>
          <div>Wind</div>
          <div>${current.wind.speed} m/s</div>
        </div>
        <div class="weather-detail">
          <i class="fas fa-arrow-up"></i>
          <div>Pressure</div>
          <div>${current.main.pressure} hPa</div>
        </div>
        <div class="weather-detail">
          <i class="fas fa-eye"></i>
          <div>Visibility</div>
          <div>${current.visibility / 1000} km</div>
        </div>
      </div>
    </div>
  `;
  
  // Display 5-day forecast
  forecastContainer.innerHTML = "<h3>5-Day Forecast</h3>";
  const dailyForecasts = filterDailyForecast(forecast.list);
  
  dailyForecasts.forEach(day => {
    const date = new Date(day.dt * 1000);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    
    forecastContainer.innerHTML += `
      <div class="forecast-day">
        <div>${dayName}</div>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
        <div>${Math.round(day.main.temp_max)}° / ${Math.round(day.main.temp_min)}°</div>
        <div>${day.weather[0].main}</div>
      </div>
    `;
  });
  
  // Display additional info
  additionalInfo.innerHTML = `
    <h3>Additional Information</h3>
    <p>Sunrise: ${new Date(current.sys.sunrise * 1000).toLocaleTimeString()}</p>
    <p>Sunset: ${new Date(current.sys.sunset * 1000).toLocaleTimeString()}</p>
    <p>Cloudiness: ${current.clouds.all}%</p>
  `;
}

// Filter forecast to get one entry per day
function filterDailyForecast(forecastList) {
  const dailyForecasts = [];
  const days = new Set();
  
  forecastList.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!days.has(date) && item.dt_txt.includes("12:00:00")) {
      days.add(date);
      dailyForecasts.push(item);
    }
  });
  
  return dailyForecasts.slice(0, 5);
}

// Show loading state
function showLoading() {
  weatherDisplay.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
    </div>
  `;
  forecastContainer.innerHTML = "";
  additionalInfo.innerHTML = "";
}

// Show error message
function showError(message) {
  weatherDisplay.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <p>${message}</p>
    </div>
  `;
  forecastContainer.innerHTML = "";
  additionalInfo.innerHTML = "";
}