function ForecastList({ forecast }) {
  if (!forecast?.length) {
    return null;
  }

  return (
    <section className="forecast-section">
      <div className="section-heading">
        <span className="section-label">5-Day Forecast</span>
      </div>
      <div className="forecast-grid">
        {forecast.map((day) => (
          <article key={day.date} className="forecast-card">
            <span className="forecast-icon" aria-hidden="true">{day.icon || '🌤️'}</span>
            <strong>{new Date(day.date).toLocaleDateString()}</strong>
            <span>{day.condition}</span>
            <span>{day.minTemp}°C - {day.maxTemp}°C</span>
            <span>Humidity {day.humidity}%</span>
            <span>Rain chance {day.rainChance}%</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ForecastList;
