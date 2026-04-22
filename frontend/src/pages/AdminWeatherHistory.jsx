import { useEffect, useState } from 'react';
import { deleteWeatherHistory, getWeatherHistory } from '../services/weatherService';
import WeatherHistory from '../components/weather/WeatherHistory';
import './Weather.css';
import './Cards.css';
import './Tables.css';

function AdminWeatherHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getWeatherHistory();
      setHistory(data.history || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (historyId) => {
    if (!window.confirm('Delete this weather history record?')) return;
    await deleteWeatherHistory(historyId);
    await loadHistory();
  };

  return (
    <section className="card weather-page-shell">
      <h1>Weather History</h1>
      {loading ? <p>Loading history...</p> : <WeatherHistory history={history} onDelete={handleDelete} />}
    </section>
  );
}

export default AdminWeatherHistory;
