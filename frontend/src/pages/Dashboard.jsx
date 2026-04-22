import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/authService';
import { getMyCrops } from '../services/cropService';
import { getMyResources } from '../services/resourceService';
import { getMyActivities } from '../services/activityService';
import { getCurrentWeather, getWeatherForecast } from '../services/weatherService';
import UserCharts from '../components/Dashboard/UserCharts';
import './Forms.css';
import './Dashboard.css';

const DASHBOARD_CORE_CACHE_KEY = 'dashboard_core_cache_v1';
const DASHBOARD_WEATHER_CACHE_KEY = 'dashboard_weather_cache_v1';
let coreDashboardPromise = null;
let weatherDashboardPromise = null;

const readSessionCache = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeSessionCache = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore cache write failures.
  }
};

const buildDashboardRecommendation = (weatherData, forecastData) => {
  const messages = [];
  const rainTomorrow = (forecastData?.[1]?.rainChance || 0) >= 60;

  if (rainTomorrow) {
    messages.push('Rain expected tomorrow - delay irrigation and plan field operations carefully.');
  }

  if ((weatherData?.temperature || 0) >= 35) {
    messages.push('High temperature - increase watering frequency and monitor crop stress.');
  }

  if ((weatherData?.windSpeed || 0) >= 8) {
    messages.push('Strong winds - avoid pesticide spraying to reduce drift.');
  }

  if ((weatherData?.humidity || 0) >= 80) {
    messages.push('High humidity - monitor crops for fungal disease risk.');
  }

  if (!messages.length) {
    messages.push('Weather looks stable - continue routine farm operations.');
  }

  return messages;
};

const buildActionNotifications = ({ crops, activities, weather, recommendations }) => {
  const alerts = [];
  const pendingActivities = activities.filter((activity) => activity.status === 'pending');
  const hasFertilizeTask = pendingActivities.some((activity) => activity.activityType === 'fertilizing');
  const seedlingCount = crops.filter((crop) => (crop.stage || '').toLowerCase() === 'seedling').length;

  if (crops.length > 0 && !hasFertilizeTask) {
    alerts.push('Add a fertilizing task for today to keep nutrient schedule on track.');
  }

  if (pendingActivities.length > 0) {
    alerts.push(`You have ${pendingActivities.length} pending activities. Complete high-priority tasks first.`);
  }

  if ((weather?.temperature || 0) >= 34) {
    alerts.push('High temperature detected. Plan watering for early morning or late evening.');
  }

  if (seedlingCount > 0) {
    alerts.push(`${seedlingCount} crop plot(s) are at seedling stage. Check moisture levels today.`);
  }

  if (recommendations?.[0]) {
    alerts.push(recommendations[0]);
  }

  return alerts.slice(0, 4);
};

function Dashboard() {
  const navigate = useNavigate();
  const hasFetchedRef = useRef(false);
  const isAuthError = (apiError) => [401, 403].includes(apiError?.response?.status);

  const [user, setUser] = useState(null);
  const [crops, setCrops] = useState([]);
  const [resources, setResources] = useState([]);
  const [activities, setActivities] = useState([]);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [weatherError, setWeatherError] = useState('');
  const [showNotificationPanel, setShowNotificationPanel] = useState(true);
  const defaultCity = 'Vijayawada';

  const actionNotifications = useMemo(
    () =>
      buildActionNotifications({
        crops,
        activities,
        weather,
        recommendations,
      }),
    [crops, activities, weather, recommendations]
  );

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;

    const fetchCoreDashboardData = async () => {
      const cachedCore = readSessionCache(DASHBOARD_CORE_CACHE_KEY);
      if (cachedCore) {
        setUser(cachedCore.user || null);
        setCrops(cachedCore.crops || []);
        setResources(cachedCore.resources || []);
        setActivities(cachedCore.activities || []);
        setIsLoading(false);
        return;
      }

      try {
        if (!coreDashboardPromise) {
          coreDashboardPromise = Promise.all([
            getProfile(),
            getMyCrops(),
            getMyResources(),
            getMyActivities(),
          ]);
        }

        const [profileData, cropsData, resourcesData, activitiesData] = await coreDashboardPromise;

        const coreData = {
          user: profileData.user || null,
          crops: cropsData.crops || [],
          resources: resourcesData.resources || [],
          activities: activitiesData.activities || [],
        };

        setUser(coreData.user);
        setCrops(coreData.crops);
        setResources(coreData.resources);
        setActivities(coreData.activities);
        writeSessionCache(DASHBOARD_CORE_CACHE_KEY, coreData);
      } catch (apiError) {
        if (isAuthError(apiError)) {
          setError('Session expired. Please login again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          setTimeout(() => {
            navigate('/login');
          }, 900);
        } else {
          setError(apiError.response?.data?.message || 'Failed to load dashboard data');
        }
      } finally {
        coreDashboardPromise = null;
        setIsLoading(false);
      }
    };

    const fetchWeatherData = async () => {
      const cachedWeather = readSessionCache(DASHBOARD_WEATHER_CACHE_KEY);
      if (cachedWeather) {
        setWeather(cachedWeather.weather || null);
        setForecast(cachedWeather.forecast || []);
        setRecommendations(cachedWeather.recommendations || []);
        setWeatherError('');
        return;
      }

      try {
        if (!weatherDashboardPromise) {
          weatherDashboardPromise = Promise.all([
            getCurrentWeather(defaultCity),
            getWeatherForecast(defaultCity),
          ]);
        }

        const [weatherData, forecastData] = await weatherDashboardPromise;

        const currentWeather = weatherData.weather || null;
        const weatherForecast = forecastData.forecast || [];
        const nextRecommendations = buildDashboardRecommendation(currentWeather, weatherForecast);

        setWeather(currentWeather);
        setForecast(weatherForecast);
        setRecommendations(nextRecommendations);
        writeSessionCache(DASHBOARD_WEATHER_CACHE_KEY, {
          weather: currentWeather,
          forecast: weatherForecast,
          recommendations: nextRecommendations,
        });
        setWeatherError('');
      } catch (apiError) {
        setWeatherError(apiError.response?.data?.message || 'Weather data is temporarily unavailable');
      } finally {
        weatherDashboardPromise = null;
      }
    };

    fetchCoreDashboardData();
    fetchWeatherData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <section className="card">
        <h1>Dashboard</h1>
        <p>Loading your profile...</p>
      </section>
    );
  }

  return (
    <section className="card dashboard-shell">
      <div className="dashboard-topbar">
        <div>
          <h1>Welcome, {user?.name || 'Farmer'}</h1>
          <p className="dashboard-subtitle">Your crop overview and quick actions</p>
        </div>
        <button type="button" className="secondary-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <div className="form-message error">{error}</div>}
      {weatherError && <div className="form-message error">{weatherError}</div>}

      {showNotificationPanel && actionNotifications.length > 0 && (
        <aside className="dashboard-side-notification" aria-live="polite">
          <div className="dashboard-side-notification-head">
            <h3>Today Alerts</h3>
            <button
              type="button"
              className="notification-close-btn"
              onClick={() => setShowNotificationPanel(false)}
              aria-label="Close alerts"
            >
              ×
            </button>
          </div>
          <ul>
            {actionNotifications.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </aside>
      )}

      <div className="dashboard-stats">
        <article className="stat-card">
          <span>My Crops</span>
          <strong>{crops.length}</strong>
        </article>
        <article className="stat-card">
          <span>Resources</span>
          <strong>{resources.length}</strong>
        </article>
        <article className="stat-card">
          <span>Activities</span>
          <strong>{activities.length}</strong>
        </article>
        <article className="stat-card">
          <span>Pending Activities</span>
          <strong>{activities.filter((activity) => activity.status === 'pending').length}</strong>
        </article>
        <article className="stat-card">
          <span>Role</span>
          <strong>{user?.role || 'user'}</strong>
        </article>
      </div>

      <UserCharts />

      <div className="dashboard-weather-grid">
        <article className="weather-summary-card">
          <span className="section-label">Current Weather</span>
          <h2>{weather?.city || defaultCity}</h2>
          <strong>{weather?.temperature ?? '--'}°C</strong>
          <p>{weather?.weatherCondition || 'Loading weather data...'}</p>
          <p>Humidity {weather?.humidity ?? '--'}%</p>
          <p>Wind {weather?.windSpeed ?? '--'} m/s</p>
        </article>

        <article className="weather-summary-card insight-card">
          <span className="section-label">Today Recommendation</span>
          <h2>Farm Insight</h2>
          <p>{recommendations[0] || 'Weather recommendation will appear here.'}</p>
          <button type="button" className="secondary-btn" onClick={() => navigate('/weather')}>
            Open Weather Module
          </button>
        </article>

        <article className="weather-summary-card">
          <span className="section-label">Rain Alert</span>
          <h2>{forecast[1]?.rainChance >= 60 ? 'Rain expected tomorrow' : 'No heavy rain expected tomorrow'}</h2>
          <p>Use this to plan irrigation and field activities.</p>
        </article>
      </div>

      <div className="quick-actions">
        <button type="button" className="primary-btn" onClick={() => navigate('/crops')}>
          Manage Crops
        </button>
        <button type="button" className="secondary-btn" onClick={() => navigate('/resources')}>
          Manage Resources
        </button>
        <button type="button" className="secondary-btn" onClick={() => navigate('/activities')}>
          Manage Activities
        </button>
        <button type="button" className="secondary-btn" onClick={() => navigate('/profile')}>
          View Profile
        </button>
      </div>

      <div className="recent-sections">
        <section>
          <h2>Recent Crops</h2>
          <div className="recent-list">
            {crops.slice(0, 3).map((crop) => (
              <div key={crop._id} className="recent-item">
                <strong>{crop.name}</strong>
                <span>{crop.type} • {crop.stage}</span>
              </div>
            ))}
            {crops.length === 0 && <p>No crops added yet.</p>}
          </div>
        </section>

        <section>
          <h2>Recent Resources</h2>
          <div className="recent-list">
            {resources.slice(0, 3).map((resource) => (
              <div key={resource._id} className="recent-item">
                <strong>{resource.resourceType}</strong>
                <span>{resource.quantity} {resource.unit} • {resource.fieldLocation || 'No location'}</span>
              </div>
            ))}
            {resources.length === 0 && <p>No resources logged yet.</p>}
          </div>
        </section>

        <section>
          <h2>Recent Activities</h2>
          <div className="recent-list">
            {activities.slice(0, 3).map((activity) => (
              <div key={activity._id} className="recent-item">
                <strong>{activity.title}</strong>
                <span>{activity.activityType} • {activity.status}</span>
              </div>
            ))}
            {activities.length === 0 && <p>No activities logged yet.</p>}
          </div>
        </section>

        <section>
          <h2>Forecast Preview</h2>
          <div className="recent-list forecast-preview-list">
            {forecast.slice(0, 3).map((day) => (
              <div key={day.date} className="recent-item">
                <strong>{new Date(day.date).toLocaleDateString()}</strong>
                <span>{day.condition} • {day.minTemp}°C - {day.maxTemp}°C • Rain {day.rainChance}%</span>
              </div>
            ))}
            {forecast.length === 0 && <p>Forecast preview not available yet.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}

export default Dashboard;
