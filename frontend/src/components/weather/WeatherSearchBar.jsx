function WeatherSearchBar({ city, setCity, onSearch, loading }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form className="search-bar-panel weather-search" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter city name"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? 'Loading...' : 'Search Weather'}
      </button>
    </form>
  );
}

export default WeatherSearchBar;
