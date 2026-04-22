function WeatherCard({ weather }) {
  if (!weather) {
    return null;
  }

  return (
    <article className="weather-card glass-card">
      <div className="weather-card-head">
        <div>
          <span className="section-label">Current Weather</span>
          <h2>{weather.city}</h2>
        </div>
        <div className="weather-icon-wrap">
          <span className="weather-emoji" aria-hidden="true">{weather.icon || '🌤️'}</span>
        </div>
      </div>

      <div className="weather-main-value">
        <strong>{weather.temperature}°C</strong>
        <span>Feels like {weather.feelsLike}°C</span>
      </div>

      <p className="weather-condition">{weather.weatherCondition}</p>

      <div className="weather-meta-grid">
        <div><span>Humidity</span><strong>{weather.humidity}%</strong></div>
        <div><span>Wind</span><strong>{weather.windSpeed} m/s</strong></div>
        <div><span>Pressure</span><strong>{weather.pressure} hPa</strong></div>
        <div><span>Sunrise</span><strong>{weather.sunrise ? new Date(weather.sunrise).toLocaleTimeString() : '-'}</strong></div>
        <div><span>Sunset</span><strong>{weather.sunset ? new Date(weather.sunset).toLocaleTimeString() : '-'}</strong></div>
      </div>
    </article>
  );
}

export default WeatherCard;
