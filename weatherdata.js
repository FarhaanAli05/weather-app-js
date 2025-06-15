import dayjs from 'https://unpkg.com/dayjs@1.11.13/esm/index.js';

const apiKey = "1106d1e60733433ab20bb81ef17fe34a";
const weatherApi = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const forecastApi = "https://api.openweathermap.org/data/2.5/forecast?units=metric&q=";

const searchBox = document.querySelector('.search input');
const searchBtn = document.querySelector('.search button');
const weatherIcon = document.querySelector('.weather-icon');

async function checkWeather(city) {
  const response = await fetch(weatherApi + city + `&appid=${apiKey}`);
  console.log(response);

  if (response.status === 404) {
    document.querySelector('.error').style.display = 'block';
    document.querySelector('.weather').style.display = 'none';
  } else {
    let data = await response.json();
    console.log(data);

    document.querySelector('.city').innerHTML = data.name;
    document.querySelector('.temp').innerHTML = Math.round(data.main.temp) + "&#176C";
    document.querySelector('.humidity').innerHTML = data.main.humidity + "%";
    document.querySelector('.wind').innerHTML = data.wind.speed + " km/h";

    if (data.weather[0].main === "Clouds") {
      weatherIcon.src = "images/clouds.png";
    } else if (data.weather[0].main === "Clear") {
      weatherIcon.src = "images/clear.png";
    } else if (data.weather[0].main === "Rain") {
      weatherIcon.src = "images/rain.png";
    } else if (data.weather[0].main === "Drizzle") {
      weatherIcon.src = "images/drizzle.png";
    } else if (data.weather[0].main === "Mist") {
      weatherIcon.src = "images/mist.png";
    }

    document.querySelector('.weather').style.display = "block";
    document.querySelector('.error').style.display = 'none';
  }
}

async function checkForecast(city) {
  let forecastHTML = '';

  const response = await fetch(forecastApi + city + `&appid=${apiKey}`);
  console.log(response);

  if (response.status === 404) {
    document.querySelector('.error').style.display = 'block';
    document.querySelectorAll('.forecast').forEach(forecast, () => {
      forecast.style.display = 'none';
    });
  } else {
    let data = await response.json();
    console.log(data);
    const dayData = {};
    // Group forecast entries by date
    data.list.forEach(entry => {
      const dateStr = entry.dt_txt.split(" ")[0];
      const date = dayjs(dateStr).format('ddd');
      if (!dayData[date]) {
        dayData[date] = [];
      }
      dayData[date].push(entry);
    });
    // Process the first 5 days
    const result = Object.entries(dayData).slice(0, 5).map(([date, entries]) => {
      // Average temperature
      const avgTemp = (
        entries.reduce((sum, entry) => sum + entry.main.temp, 0) / entries.length
      ).toFixed(1);

      // Find most common weather.main
      const weatherCounts = {};
      entries.forEach(entry => {
        const main = entry.weather[0].main;
        weatherCounts[main] = (weatherCounts[main] || 0) + 1;
      });
      const mostFrequentWeather = Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0][0];

      return {
        date,
        averageTemp: `${Math.round(avgTemp)}&#176C`,
        weather: mostFrequentWeather
      };
    });
    result.forEach(day => {
      let weatherIcon;
      if (day.weather === "Clouds") {
        weatherIcon = "images/clouds.png";
      } else if (day.weather === "Clear") {
        weatherIcon = "images/clear.png";
      } else if (day.weather === "Rain") {
        weatherIcon = "images/rain.png";
      } else if (day.weather === "Drizzle") {
        weatherIcon = "images/drizzle.png";
      } else if (day.weather === "Mist") {
        weatherIcon = "images/mist.png";
      }
      forecastHTML += `
        <div class="card forecast">
          <div class="forecast">
            <h1>${day.date}</h1>
            <img src="${weatherIcon}" class="forecast-weather-icon">
            <h1 class="forecast-temp">${day.averageTemp}</h1>
          </div>
        </div>
      `;
    });
  }
  document.querySelector('.js-forecast-container').innerHTML = forecastHTML;
}

searchBox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    checkWeather(searchBox.value);
    checkForecast(searchBox.value);
    document.querySelector('.search input').value = '';
  }
});
searchBtn.addEventListener('click', () => {
  checkWeather(searchBox.value);
  checkForecast(searchBox.value);
  document.querySelector('.search input').value = '';
});