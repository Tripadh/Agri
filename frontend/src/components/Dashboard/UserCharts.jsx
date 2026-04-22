import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Pie, Bar, Doughnut, Line } from 'react-chartjs-2';
import api from '../../services/api';
import './Charts.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const COLORS = [
  '#2ecc71', '#3498db', '#9b59b6', '#e67e22', '#e74c3c', '#f1c40f', '#1abc9c', '#34495e'
];

const CHARTS_CACHE_KEY = 'dashboard_user_charts_cache_v2';
const CHARTS_CACHE_TTL_MS = 2 * 60 * 1000;
let analyticsDataPromise = null;

const hasMeaningfulChartData = (data) => {
  if (!data) {
    return false;
  }

  return Boolean(
    (data.cropsData || []).length ||
      (data.resourcesData?.labels || []).length ||
      (data.activitiesData || []).some((item) => (item?.value || 0) > 0) ||
      (data.weatherData || []).length
  );
};

const transformAnalyticsData = (cropsRes, resourcesRes, activitiesRes) => {
  const cropsData = cropsRes.data.cropTypeDistribution || [];

  const resourcesMap = {};
  const monthsSet = new Set();
  (resourcesRes.data.monthlyResourceUsage || []).forEach((item) => {
    monthsSet.add(item.month);
    if (!resourcesMap[item.resourceType]) {
      resourcesMap[item.resourceType] = {};
    }
    resourcesMap[item.resourceType][item.month] = item.quantity;
  });

  const sortedMonths = Array.from(monthsSet);
  const resourceDatasets = Object.keys(resourcesMap).map((type, index) => ({
    label: type,
    data: sortedMonths.map((month) => resourcesMap[type][month] || 0),
    backgroundColor: COLORS[index % COLORS.length],
  }));

  return {
    cropsData,
    resourcesData: {
      labels: sortedMonths,
      datasets: resourceDatasets,
    },
    activitiesData: activitiesRes.data.activityStatus || [],
    weatherData: activitiesRes.data.weeklyWeatherTrend || [],
  };
};

const getCachedChartsData = () => {
  try {
    const raw = sessionStorage.getItem(CHARTS_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt || !parsed?.data) {
      return null;
    }

    if (Date.now() - parsed.savedAt > CHARTS_CACHE_TTL_MS) {
      sessionStorage.removeItem(CHARTS_CACHE_KEY);
      return null;
    }

    return hasMeaningfulChartData(parsed.data) ? parsed.data : null;
  } catch {
    return null;
  }
};

const setCachedChartsData = (data) => {
  if (!hasMeaningfulChartData(data)) {
    return;
  }

  try {
    sessionStorage.setItem(
      CHARTS_CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        data,
      })
    );
  } catch {
    // Ignore cache write failures.
  }
};

const fetchAnalyticsData = async () => {
  if (!analyticsDataPromise) {
    analyticsDataPromise = Promise.all([
      api.get('/analytics/user/crops'),
      api.get('/analytics/user/resources'),
      api.get('/analytics/user/activities'),
    ]).then(([cropsRes, resourcesRes, activitiesRes]) => transformAnalyticsData(cropsRes, resourcesRes, activitiesRes));
  }

  try {
    return await analyticsDataPromise;
  } finally {
    analyticsDataPromise = null;
  }
};

function UserCharts() {
  const [cropsData, setCropsData] = useState([]);
  const [resourcesData, setResourcesData] = useState([]);
  const [activitiesData, setActivitiesData] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const cached = getCachedChartsData();
      if (cached) {
        setCropsData(cached.cropsData || []);
        setResourcesData(cached.resourcesData || []);
        setActivitiesData(cached.activitiesData || []);
        setWeatherData(cached.weatherData || []);
        setLoading(false);
        return;
      }

      try {
        const data = await fetchAnalyticsData();
        setCropsData(data.cropsData || []);
        setResourcesData(data.resourcesData || []);
        setActivitiesData(data.activitiesData || []);
        setWeatherData(data.weatherData || []);
        setCachedChartsData(data);
      } catch (error) {
        console.error('Failed to load user analytics', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading charts...</div>;

  const cropChartData = {
    labels: cropsData.map(c => c.name),
    datasets: [{
      data: cropsData.map(c => c.value),
      backgroundColor: COLORS.slice(0, cropsData.length),
      borderWidth: 1
    }]
  };

  const activityChartData = {
    labels: activitiesData.map(a => a.name),
    datasets: [{
      data: activitiesData.map(a => a.value),
      backgroundColor: activitiesData.map(a => a.name === 'completed' ? '#2ecc71' : '#e67e22'),
      borderWidth: 1
    }]
  };

  const weatherLineData = {
    labels: weatherData.map(w => w.day),
    datasets: [{
      label: 'Temperature °C',
      data: weatherData.map(w => w.temperature),
      borderColor: '#3498db',
      backgroundColor: 'rgba(52, 152, 219, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>Crop Types Distribution</h3>
        <div className="chart-container pie-container">
          {cropsData.length > 0 ? <Pie data={cropChartData} /> : <p>No crop data available</p>}
        </div>
      </div>

      <div className="chart-card">
        <h3>Monthly Resource Usage</h3>
        <div className="chart-container bar-container">
          {resourcesData.labels?.length > 0 ? (
            <Bar 
              data={resourcesData} 
              options={{ responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }} 
            />
          ) : <p>No resource data available</p>}
        </div>
      </div>

      <div className="chart-card">
        <h3>Activity Status</h3>
        <div className="chart-container pie-container">
          {activitiesData.length > 0 ? <Doughnut data={activityChartData} /> : <p>No activity data available</p>}
        </div>
      </div>

      <div className="chart-card weather-trend-card">
        <h3>Weekly Weather Trend</h3>
        <div className="chart-container bar-container weather-trend-container">
          {weatherData.length > 0 ? (
            <Line data={weatherLineData} options={{ responsive: true, maintainAspectRatio: false }} />
          ) : <p>No weather data available</p>}
        </div>
      </div>
    </div>
  );
}

export default UserCharts;
