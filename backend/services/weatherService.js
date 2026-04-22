const GEOCODE_BASE_URL = process.env.WEATHER_GEOCODE_BASE_URL || 'https://geocoding-api.open-meteo.com/v1';
const WEATHER_BASE_URL = process.env.WEATHER_API_BASE_URL || 'https://api.open-meteo.com/v1';

const createWeatherError = (message, status = 500) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getWeatherDetails = (weatherCode) => {
  const normalizedCode = Number.isFinite(weatherCode) ? weatherCode : -1;

  const weatherMap = {
    0: { label: 'Clear Sky', icon: '☀️' },
    1: { label: 'Mainly Clear', icon: '🌤️' },
    2: { label: 'Partly Cloudy', icon: '⛅' },
    3: { label: 'Overcast', icon: '☁️' },
    45: { label: 'Fog', icon: '🌫️' },
    48: { label: 'Depositing Rime Fog', icon: '🌫️' },
    51: { label: 'Light Drizzle', icon: '🌦️' },
    53: { label: 'Moderate Drizzle', icon: '🌦️' },
    55: { label: 'Dense Drizzle', icon: '🌧️' },
    61: { label: 'Slight Rain', icon: '🌦️' },
    63: { label: 'Moderate Rain', icon: '🌧️' },
    65: { label: 'Heavy Rain', icon: '🌧️' },
    66: { label: 'Freezing Rain', icon: '🌧️' },
    67: { label: 'Heavy Freezing Rain', icon: '🌧️' },
    71: { label: 'Slight Snow Fall', icon: '🌨️' },
    73: { label: 'Moderate Snow Fall', icon: '🌨️' },
    75: { label: 'Heavy Snow Fall', icon: '❄️' },
    77: { label: 'Snow Grains', icon: '❄️' },
    80: { label: 'Slight Rain Showers', icon: '🌦️' },
    81: { label: 'Moderate Rain Showers', icon: '🌧️' },
    82: { label: 'Violent Rain Showers', icon: '⛈️' },
    85: { label: 'Slight Snow Showers', icon: '🌨️' },
    86: { label: 'Heavy Snow Showers', icon: '❄️' },
    95: { label: 'Thunderstorm', icon: '⛈️' },
    96: { label: 'Thunderstorm with Hail', icon: '⛈️' },
    99: { label: 'Heavy Thunderstorm with Hail', icon: '⛈️' },
  };

  return weatherMap[normalizedCode] || { label: 'Unknown', icon: '🌤️' };
};

const resolveCity = async (city) => {
  const geocodeParams = new URLSearchParams({
    name: city,
    count: '1',
    language: 'en',
    format: 'json',
  });

  const geocodeResponse = await fetch(`${GEOCODE_BASE_URL}/search?${geocodeParams.toString()}`);

  if (!geocodeResponse.ok) {
    throw createWeatherError('Unable to resolve city coordinates', 502);
  }

  const geocodeData = await geocodeResponse.json();
  const cityData = geocodeData?.results?.[0];

  if (!cityData) {
    throw createWeatherError('City not found. Please enter a valid city name.', 404);
  }

  return cityData;
};

const fetchOpenMeteoForecast = async (city) => {
  const cityData = await resolveCity(city);

  const forecastParams = new URLSearchParams({
    latitude: String(cityData.latitude),
    longitude: String(cityData.longitude),
    timezone: 'auto',
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,relative_humidity_2m_mean,sunrise,sunset',
    wind_speed_unit: 'ms',
  });

  const forecastResponse = await fetch(`${WEATHER_BASE_URL}/forecast?${forecastParams.toString()}`);

  if (!forecastResponse.ok) {
    throw createWeatherError('Unable to fetch weather details from provider', 502);
  }

  const forecastData = await forecastResponse.json();

  if (!forecastData?.current || !forecastData?.daily) {
    throw createWeatherError('Incomplete weather data received from provider', 502);
  }

  return { cityData, forecastData };
};

export const fetchCurrentWeather = async (city) => {
  const { cityData, forecastData } = await fetchOpenMeteoForecast(city);
  const current = forecastData.current;
  const details = getWeatherDetails(current.weather_code);

  return {
    city: cityData.name,
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Number(current.wind_speed_10m?.toFixed(1) || 0),
    pressure: Math.round(current.pressure_msl),
    weatherCondition: details.label,
    icon: details.icon,
    sunrise: forecastData.daily.sunrise?.[0] ? new Date(forecastData.daily.sunrise[0]).toISOString() : null,
    sunset: forecastData.daily.sunset?.[0] ? new Date(forecastData.daily.sunset[0]).toISOString() : null,
    rainChance: Math.round(forecastData.daily.precipitation_probability_max?.[0] || 0),
    raw: forecastData,
  };
};

export const fetchForecast = async (city) => {
  const { forecastData } = await fetchOpenMeteoForecast(city);
  const daily = forecastData.daily;

  const forecast = (daily.time || []).slice(0, 5).map((date, index) => {
    const details = getWeatherDetails(daily.weather_code?.[index]);

    return {
      date,
      minTemp: Math.round(daily.temperature_2m_min?.[index]),
      maxTemp: Math.round(daily.temperature_2m_max?.[index]),
      humidity: Math.round(daily.relative_humidity_2m_mean?.[index]),
      rainChance: Math.round(daily.precipitation_probability_max?.[index] || 0),
      condition: details.label,
      icon: details.icon,
    };
  });

  return forecast;
};

export const buildRecommendation = (currentWeather, forecast) => {
  const recommendations = [];
  const rainTomorrow = forecast?.[1]?.rainChance >= 60;

  if (rainTomorrow) {
    recommendations.push('Rain expected tomorrow - delay irrigation and schedule field work carefully.');
  }

  if ((currentWeather?.temperature || 0) >= 35) {
    recommendations.push('High temperature detected - increase watering frequency and monitor crop stress.');
  }

  if ((currentWeather?.windSpeed || 0) >= 8) {
    recommendations.push('Strong wind conditions - avoid pesticide spraying to reduce drift.');
  }

  if ((currentWeather?.humidity || 0) >= 80) {
    recommendations.push('High humidity - watch closely for fungal diseases and improve ventilation where possible.');
  }

  if (!recommendations.length && (currentWeather?.weatherCondition || '').toLowerCase().includes('clear')) {
    recommendations.push('Good weather - suitable for planting, spraying, and general field operations.');
  }

  if (!recommendations.length) {
    recommendations.push('Weather looks stable - continue routine farm operations and monitor the forecast regularly.');
  }

  return recommendations;
};
