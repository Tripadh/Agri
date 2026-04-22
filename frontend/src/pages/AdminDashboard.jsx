import { useEffect, useState } from 'react';
import { getAdminStats } from '../services/adminService';
import AdminCharts from '../components/Dashboard/AdminCharts';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <section className="card">Loading admin dashboard...</section>;
  }

  return (
    <section className="card admin-dashboard-shell">
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card"><span>Total Users</span><strong>{stats?.totalUsers || 0}</strong></div>
        <div className="stat-card"><span>Total Admins</span><strong>{stats?.totalAdmins || 0}</strong></div>
        <div className="stat-card"><span>Total Crops</span><strong>{stats?.totalCrops || 0}</strong></div>
        <div className="stat-card"><span>Total Resources</span><strong>{stats?.totalResources || 0}</strong></div>
        <div className="stat-card"><span>Total Activities</span><strong>{stats?.totalActivities || 0}</strong></div>
        <div className="stat-card"><span>Weather Searches</span><strong>{stats?.totalWeatherSearches || 0}</strong></div>
      </div>

      <AdminCharts />

      <div className="recent-grid weather-admin-grid">
        <div>
          <h2>Most Searched Cities</h2>
          <ul className="list-panel">
            {(stats?.mostSearchedCities || []).map((item) => (
              <li key={item._id}>{item._id} - {item.count} searches</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Recent Weather Searches</h2>
          <ul className="list-panel">
            {(stats?.recentWeatherSearches || []).map((entry) => (
              <li key={entry._id}>{entry.city} - {entry.temperature}°C - {entry.condition}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="recent-grid">
        <div>
          <h2>Recent Users</h2>
          <ul className="list-panel">
            {(stats?.recentUsers || []).map((user) => (
              <li key={user._id}>{user.name} - {user.email} - {user.role}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Recent Crops</h2>
          <ul className="list-panel">
            {(stats?.recentCrops || []).map((crop) => (
              <li key={crop._id}>{crop.name} - {crop.createdBy?.name || 'Unknown'}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Recent Resources</h2>
          <ul className="list-panel">
            {(stats?.recentResources || []).map((resource) => (
              <li key={resource._id}>{resource.resourceType} - {resource.userId?.name || 'Unknown'}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2>Recent Activity</h2>
          <ul className="list-panel">
            {(stats?.recentActivities || []).map((activity) => (
              <li key={activity._id}>{activity.title} - {activity.userId?.name || 'Unknown'}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
