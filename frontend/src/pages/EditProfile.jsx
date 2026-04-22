import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/authService';
import './Forms.css';
import './ProfileSettings.css';

function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setFormData({
          name: data.user?.name || '',
          email: data.user?.email || '',
        });
      } catch {
        setMessage('Unable to load profile. Please login again.');
        setMessageType('error');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setMessageType('');
    setIsSaving(true);

    try {
      const data = await updateProfile(formData);
      const currentLocalUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentLocalUser, ...data.user }));
      setMessage(data.message || 'Profile updated successfully.');
      setMessageType('success');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update profile');
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <section className="form-shell"><div className="form-card">Loading...</div></section>;
  }

  return (
    <section className="form-shell profile-settings-shell">
      <div className="form-card profile-settings-card">
        <h1>Edit Profile</h1>
        <p className="form-description">Update your personal account information.</p>

        {message && <div className={`form-message ${messageType}`}>{message}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="auth-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email address"
              required
            />
          </div>

          <div className="settings-actions">
            <button type="button" className="secondary-btn" onClick={() => navigate('/profile')}>
              Back to Profile
            </button>
            <button type="submit" className="primary-btn" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default EditProfile;
