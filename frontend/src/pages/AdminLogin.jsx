import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/authService';
import './Forms.css';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();
  const [adminAccessPassword, setAdminAccessPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setMessageType('');
    setIsLoading(true);

    try {
      const data = await adminLogin({ adminAccessPassword });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setMessage('Admin login successful. Redirecting...');
      setMessageType('success');

      setTimeout(() => {
        navigate('/admin');
      }, 600);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Admin login failed');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="form-shell">
      <div className="form-card admin-login-card">
        <h1>Admin Login</h1>
        <p className="form-description">
          Enter the admin access password to open the admin panel.
        </p>

        {message && <div className={`form-message ${messageType}`}>{message}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-group">
            <label htmlFor="adminAccessPassword">Admin Access Password</label>
            <input
              id="adminAccessPassword"
              name="adminAccessPassword"
              type="password"
              value={adminAccessPassword}
              onChange={(e) => setAdminAccessPassword(e.target.value)}
              placeholder="Enter admin access password"
              required
            />
          </div>

          <button type="submit" className="primary-btn" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Login as Admin'}
          </button>

          <div className="admin-login-side">
            <span>Not admin?</span>
            <Link to="/login" className="admin-login-link">Go to User Login</Link>
          </div>
        </form>
      </div>
    </section>
  );
}

export default AdminLogin;
