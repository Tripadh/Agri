import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/authService';
import './Forms.css';
import './ProfileSettings.css';

function ChangePassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setMessageType('');

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New password and confirm password must match.');
      setMessageType('error');
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long.');
      setMessageType('error');
      return;
    }

    setIsSaving(true);
    try {
      const data = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setMessage(data.message || 'Password changed successfully.');
      setMessageType('success');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to change password');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="form-shell profile-settings-shell">
      <div className="form-card profile-settings-card">
        <h1>Change Password</h1>
        <p className="form-description">Keep your account secure by updating your password regularly.</p>

        {message && <div className={`form-message ${messageType}`}>{message}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className="auth-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>

          <div className="settings-actions">
            <button type="button" className="secondary-btn" onClick={() => navigate('/profile')}>
              Back to Profile
            </button>
            <button type="submit" className="primary-btn" disabled={isSaving}>
              {isSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ChangePassword;
