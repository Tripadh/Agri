import { useEffect, useMemo, useState } from 'react';
import { getCurrentWeather, getWeatherForecast, getWeatherRecommendations } from '../services/weatherService';
import WeatherSearchBar from '../components/weather/WeatherSearchBar';
import WeatherCard from '../components/weather/WeatherCard';
import ForecastList from '../components/weather/ForecastList';
import RecommendationPanel from '../components/weather/RecommendationPanel';
import './Weather.css';
import './WeatherCard.css';
import './Forecast.css';
import './Recommendations.css';
import './SearchBar.css';
import './Cards.css';

function Weather() {
  const [city, setCity] = useState('Vijayawada');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const loadWeather = async () => {
    const normalizedCity = city.trim();
    if (!normalizedCity) {
      setError('Please enter a city name.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [currentData, forecastData, recommendationData] = await Promise.all([
        getCurrentWeather(normalizedCity),
        getWeatherForecast(normalizedCity),
        getWeatherRecommendations(normalizedCity),
      ]);

      setWeather(currentData.weather);
      setForecast(forecastData.forecast || []);
      setRecommendations(recommendationData.recommendations || []);
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const rainAlert = useMemo(() => {
    const tomorrow = forecast?.[1];
    return tomorrow?.rainChance >= 60 ? 'Rain expected tomorrow. Delay irrigation.' : 'No heavy rain expected tomorrow.';
  }, [forecast]);

  return (
    <section className="card weather-page-shell">
      <div className="page-head">
        <div>
          <h1>Weather & Smart Farming Insights</h1>
          <p>Track current conditions, forecast, and actionable farm advice.</p>
        </div>
      </div>

      <WeatherSearchBar city={city} setCity={setCity} onSearch={loadWeather} loading={loading} />

      {error && <div className="form-message error">{error}</div>}

      {loading ? (
        <div className="weather-loading">
          <span className="weather-spinner" aria-hidden="true" />
          <span>Loading weather data...</span>
        </div>
      ) : (
        <>
          <WeatherCard weather={weather} />
          <div className="alert-banner">{rainAlert}</div>
          <RecommendationPanel recommendations={recommendations} />
          <ForecastList forecast={forecast} />
        </>
      )}
    </section>
  );
}

export default Weather;
