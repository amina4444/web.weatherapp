async function getCityCoords(city) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.length) return null;

    return {
        name: data[0].display_name.split(',')[0],
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
    };
}

async function getWeather(lat, lon) {
    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current_weather=true` +
        `&hourly=temperature_2m,weathercode,relativehumidity_2m,surface_pressure` +
        `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
        `&timezone=auto`;

    const res = await fetch(url);
    return await res.json();
}
function getDescription(code) {
    const map = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Cloudy",
        45: "Fog",
        48: "Freezing fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Light freezing drizzle",
        57: "Dense freezing drizzle",
        61: "Slight rain",
        63: "Rain",
        65: "Heavy rain",
        66: "Freezing rain",
        67: "Heavy freezing rain",
        71: "Light snow",
        73: "Snow",
        75: "Heavy snow",
        77: "Snow grains",
        80: "Rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Heavy hailstorm"
    };
    return map[code] || "Unknown";
}



 function getIcon(weathercode) {
    let icon = "☁"; 
    if (weathercode === 0) icon = "☀";
    else if ([1, 2, 3].includes(weathercode)) icon = "🌤";
    else if ([45, 48].includes(weathercode)) icon = "🌫";
    else if ([51, 53, 55, 56, 57].includes(weathercode)) icon = "🌦";
    else if ([61, 63, 65, 66, 67].includes(weathercode)) icon = "🌧";
    else if ([71, 73, 75, 77].includes(weathercode)) icon = "❄";
    else if ([80, 81, 82].includes(weathercode)) icon = "🌧";
    else if ([95, 96, 99].includes(weathercode)) icon = "⛈";

    return `<span class="weather-emoji">${icon}</span>`;
}

let weatherData = null;
let cityName = "City";

function updateCurrentWeather() {
    const current = weatherData.current_weather;

    const humidityNow = weatherData.hourly.relativehumidity_2m[0];
    const pressureNow = weatherData.hourly.surface_pressure[0];

    document.getElementById("cityName").textContent = cityName;


    document.getElementById("weatherIcon").innerHTML = getIcon(current.weathercode);



    document.getElementById("currentTemp").textContent =`${Math.round(current.temperature)}°C`;

    document.getElementById("condition").textContent = getDescription(current.weathercode);

    document.getElementById("feelsLike").textContent = "";

    document.getElementById("windSpeed").textContent =
        `${Math.round(current.windspeed)} m/s`;

    document.getElementById("humidity").textContent =
        `${humidityNow}%`;

    document.getElementById("pressure").textContent =
        `${Math.round(pressureNow)} hPa`;
}
function updateHourlyForecast() {
    const container = document.getElementById("hourlyForecast");
    container.innerHTML = "";

    const timeArr = weatherData.hourly.time;
    const temps = weatherData.hourly.temperature_2m;
    const codes = weatherData.hourly.weathercode;

    for (let i = 0; i < 12; i++) {
        const time = new Date(timeArr[i]);

        const card = document.createElement("div");
        card.className = "hourly-card";

        card.innerHTML = `
            <p class="hourly-time">${time.getHours()}:00</p>
            <div class="hourly-icon">${getIcon(codes[i])}</div>
            <p class="hourly-temp">${Math.round(temps[i])}°C</p>
        `;

        container.appendChild(card);
    }
}
 function updateForecast() {
    const grid = document.getElementById("forecastGrid");
    grid.innerHTML = "";

     const d = weatherData.daily;
     const count = Math.min(d.time.length, 7);

     for (let i = 0; i < count; i++) {
         const date = new Date(d.time[i]);

        const card = document.createElement("div");
        card.className = "forecast-card";

         card.innerHTML = `
            <p class="forecast-day">${date.toLocaleDateString("en-US", { weekday: "long" })}</p>
            <div class="forecast-icon">${getIcon(d.weathercode[i])}</div>
             <div class="forecast-temps">
                 <span class="temp-high">${Math.round(d.temperature_2m_max[i])}°C</span>
                 <span class="temp-low">${Math.round(d.temperature_2m_min[i])}°C</span>
             </div>
             <p class="forecast-condition">${getDescription(d.weathercode[i])}</p>
        `;

        grid.appendChild(card);
    }
 }




// ===============================
//  MAIN LOAD
// ===============================
async function loadWeather(city) {
    try {
        const coords = await getCityCoords(city);
        if (!coords) {
            alert("City not found");
            return;
        }

        cityName = coords.name;
        weatherData = await getWeather(coords.lat, coords.lon);

        updateCurrentWeather();
        updateHourlyForecast();
        updateForecast();

    } catch (err) {
        console.error(err);
        alert("Error loading weather data");
    }
}

// ===============================
//  SEARCH FORM
// ===============================
document.getElementById("searchForm").addEventListener("submit", e => {
    e.preventDefault();
    const city = document.getElementById("searchInput").value.trim();
    if (!city) return;
    loadWeather(city);
});

// ===============================
//  DEFAULT
// ===============================
loadWeather("Bishkek");

