import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/authService';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data.user);
      } catch {
        setError('Unable to load profile. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  if (loading) {
    return <div className="profile-container"><div className="loader">Loading profile...</div></div>;
  }

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Mock farm data for demonstration
  const farmData = {
    totalLand: 25.5,
    activeCrops: 5,
    totalHarvests: 12,
    avgYield: 4.8,
    farmName: 'Green Valley Farm',
    location: 'Agricultural Region, State',
    soilType: 'Fertile Loam',
    waterSource: 'Well + Rainwater Harvesting',
    farmingType: 'Mixed Farming',
    recentActivity: [
      { action: 'Planted Wheat', date: '2 days ago', status: 'Success' },
      { action: 'Applied Fertilizer', date: '5 days ago', status: 'Success' },
      { action: 'Harvested Rice', date: '10 days ago', status: 'Success' }
    ]
  };

  return (
    <div className="profile-container">
      {error && <div className="profile-error">{error}</div>}
      
      {user && (
        <>
          {/* Header Section with User Info */}
          <div className="profile-header">
            <div className="profile-header-bg"></div>
            <div className="profile-content">
              <div className="profile-avatar">
                <div className="avatar-circle">{user.name.charAt(0).toUpperCase()}</div>
              </div>
              <div className="profile-info">
                <h1 className="profile-name">{user.name}</h1>
                <p className="profile-email">{user.email}</p>
                <div className="profile-badges">
                  <span className="badge badge-role">{(user.role || 'user').toUpperCase()}</span>
                  <span className="badge badge-member">Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="profile-main">
            {/* Left Column - Farm Details */}
            <div className="profile-left">
              {/* Farm Overview Card */}
              <div className="profile-card farm-overview">
                <div className="card-header">
                  <h2 className="card-title">🌾 Farm Overview</h2>
                  <button type="button" className="btn-edit" onClick={() => handleNavigate('/crops')}>Edit Farm</button>
                </div>
                <div className="farm-details-grid">
                  <div className="farm-detail-item">
                    <label>Farm Name</label>
                    <p className="detail-value">{farmData.farmName}</p>
                  </div>
                  <div className="farm-detail-item">
                    <label>Location</label>
                    <p className="detail-value">{farmData.location}</p>
                  </div>
                  <div className="farm-detail-item">
                    <label>Farming Type</label>
                    <p className="detail-value">{farmData.farmingType}</p>
                  </div>
                  <div className="farm-detail-item">
                    <label>Soil Type</label>
                    <p className="detail-value">{farmData.soilType}</p>
                  </div>
                  <div className="farm-detail-item">
                    <label>Water Source</label>
                    <p className="detail-value">{farmData.waterSource}</p>
                  </div>
                </div>
              </div>

              {/* Land Statistics */}
              <div className="profile-card land-stats">
                <div className="card-header">
                  <h2 className="card-title">📊 Land Statistics</h2>
                </div>
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-icon">📏</div>
                    <div className="stat-info">
                      <p className="stat-label">Total Land</p>
                      <p className="stat-value">{farmData.totalLand} Hectares</p>
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon">🌱</div>
                    <div className="stat-info">
                      <p className="stat-label">Active Crops</p>
                      <p className="stat-value">{farmData.activeCrops}</p>
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-info">
                      <p className="stat-label">Total Harvests</p>
                      <p className="stat-value">{farmData.totalHarvests}</p>
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                      <p className="stat-label">Avg Yield Rating</p>
                      <p className="stat-value">{farmData.avgYield}/5.0</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="profile-card recent-activity">
                <div className="card-header">
                  <h2 className="card-title">⏱️ Recent Activity</h2>
                </div>
                <div className="activity-list">
                  {farmData.recentActivity.map((activity, idx) => (
                    <div key={idx} className="activity-item">
                      <div className="activity-marker"></div>
                      <div className="activity-content">
                        <p className="activity-action">{activity.action}</p>
                        <p className="activity-date">{activity.date}</p>
                      </div>
                      <span className={`activity-status status-${activity.status.toLowerCase()}`}>
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Quick Actions & Account */}
            <div className="profile-right">
              {/* Quick Actions */}
              <div className="profile-card quick-actions">
                <h2 className="card-title">⚡ Quick Actions</h2>
                <div className="actions-list">
                  <button type="button" className="action-btn" onClick={() => handleNavigate('/crops')}>
                    <span className="action-icon">🌾</span>
                    <span className="action-text">Add New Crop</span>
                  </button>
                  <button type="button" className="action-btn" onClick={() => handleNavigate('/activities')}>
                    <span className="action-icon">📝</span>
                    <span className="action-text">Log Activity</span>
                  </button>
                  <button type="button" className="action-btn" onClick={() => handleNavigate('/dashboard')}>
                    <span className="action-icon">📊</span>
                    <span className="action-text">View Analytics</span>
                  </button>
                  <button type="button" className="action-btn" onClick={() => handleNavigate('/weather')}>
                    <span className="action-icon">🎯</span>
                    <span className="action-text">My Recommendations</span>
                  </button>
                </div>
              </div>

              {/* Account Information */}
              <div className="profile-card account-info">
                <h2 className="card-title">👤 Account Information</h2>
                <div className="account-details">
                  <div className="detail-row">
                    <span className="detail-label">Name</span>
                    <span className="detail-val">{user.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Email</span>
                    <span className="detail-val">{user.email}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">User Role</span>
                    <span className="detail-val">{(user.role || 'user').toUpperCase()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Member Since</span>
                    <span className="detail-val">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Account Status</span>
                    <span className="detail-val"><span className="status-badge">Active</span></span>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="profile-card settings-section">
                <h2 className="card-title">⚙️ Settings</h2>
                <div className="settings-list">
                  <button type="button" className="setting-btn" onClick={() => handleNavigate('/profile/edit')}>
                    <span>Edit Profile</span>
                    <span className="arrow">→</span>
                  </button>
                  <button type="button" className="setting-btn" onClick={() => handleNavigate('/profile/change-password')}>
                    <span>Change Password</span>
                    <span className="arrow">→</span>
                  </button>
                  <button type="button" className="setting-btn" onClick={() => handleNavigate('/profile/notifications')}>
                    <span>Notifications</span>
                    <span className="arrow">→</span>
                  </button>
                  <button type="button" className="setting-btn danger" onClick={handleLogout}>
                    <span>Logout</span>
                    <span className="arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
