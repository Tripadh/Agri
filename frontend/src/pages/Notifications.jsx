import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Forms.css';
import './ProfileSettings.css';

const STORAGE_KEY = 'notificationSettings';

const getDefaultSettings = () => ({
  weatherAlerts: true,
  cropReminders: true,
  activityDigest: true,
  marketUpdates: false,
  securityAlerts: true,
});

function Notifications() {
  const navigate = useNavigate();
  const initialSettings = useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return saved ? { ...getDefaultSettings(), ...saved } : getDefaultSettings();
    } catch {
      return getDefaultSettings();
    }
  }, []);

  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState('');

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setMessage('Notification settings saved successfully.');
  };

  return (
    <section className="form-shell profile-settings-shell">
      <div className="form-card profile-settings-card">
        <h1>Notifications</h1>
        <p className="form-description">Choose what updates you want to receive from the platform.</p>

        {message && <div className="form-message success">{message}</div>}

        <div className="notification-list">
          <label className="notification-item" htmlFor="weatherAlerts">
            <div>
              <h3>Weather Alerts</h3>
              <p>Severe weather updates and forecast warnings.</p>
            </div>
            <input
              id="weatherAlerts"
              type="checkbox"
              checked={settings.weatherAlerts}
              onChange={() => handleToggle('weatherAlerts')}
            />
          </label>

          <label className="notification-item" htmlFor="cropReminders">
            <div>
              <h3>Crop Reminders</h3>
              <p>Timely reminders for crop care tasks and schedules.</p>
            </div>
            <input
              id="cropReminders"
              type="checkbox"
              checked={settings.cropReminders}
              onChange={() => handleToggle('cropReminders')}
            />
          </label>

          <label className="notification-item" htmlFor="activityDigest">
            <div>
              <h3>Activity Digest</h3>
              <p>Daily summary of farm activities and updates.</p>
            </div>
            <input
              id="activityDigest"
              type="checkbox"
              checked={settings.activityDigest}
              onChange={() => handleToggle('activityDigest')}
            />
          </label>

          <label className="notification-item" htmlFor="marketUpdates">
            <div>
              <h3>Market Updates</h3>
              <p>Price trends and local market opportunities.</p>
            </div>
            <input
              id="marketUpdates"
              type="checkbox"
              checked={settings.marketUpdates}
              onChange={() => handleToggle('marketUpdates')}
            />
          </label>

          <label className="notification-item" htmlFor="securityAlerts">
            <div>
              <h3>Security Alerts</h3>
              <p>Critical account and login notifications.</p>
            </div>
            <input
              id="securityAlerts"
              type="checkbox"
              checked={settings.securityAlerts}
              onChange={() => handleToggle('securityAlerts')}
            />
          </label>
        </div>

        <div className="settings-actions">
          <button type="button" className="secondary-btn" onClick={() => navigate('/profile')}>
            Back to Profile
          </button>
          <button type="button" className="primary-btn" onClick={handleSave}>
            Save Preferences
          </button>
        </div>
      </div>
    </section>
  );
}

export default Notifications;
