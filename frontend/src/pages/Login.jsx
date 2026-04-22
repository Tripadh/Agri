import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import './Forms.css';
import './Login.css';

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const emailValid = /^\S+@\S+\.\S+$/.test(formData.email.trim());
  const passwordStrength =
    formData.password.length >= 10 && /[A-Z]/.test(formData.password) && /\d/.test(formData.password)
      ? 'Strong'
      : formData.password.length >= 6
        ? 'Medium'
        : formData.password.length > 0
          ? 'Weak'
          : '';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setMessageType('');

    setTouched({ email: true, password: true });

    if (!emailValid) {
      setMessage('Please enter a valid email format.');
      setMessageType('error');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);

    try {
      const data = await loginUser(formData);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setMessage('Login successful. Redirecting...');
      setMessageType('success');

      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="form-shell auth-shell login-shell">
      <div className="form-card auth-card login-card">
        <h1>Welcome Back</h1>
        <p className="form-description">
          Login to access your <span className="login-highlight">farm dashboard</span>.
        </p>

        {message && (
          <div className={`form-message ${messageType}`}>
            {messageType === 'success' && <span className="success-icon" aria-hidden="true">✓</span>}
            {message}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your email"
              required
            />
            <small className={`field-hint ${touched.email && !emailValid ? 'invalid' : emailValid ? 'valid' : ''}`}>
              {touched.email && !emailValid ? 'Use format like farmer@example.com' : 'Use your registered email address'}
            </small>
          </div>

          <div className="auth-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <small className={`field-hint ${passwordStrength ? passwordStrength.toLowerCase() : ''}`}>
              {passwordStrength ? `Password strength: ${passwordStrength}` : 'Minimum 6 characters'}
            </small>
          </div>

          <button
            type="submit"
            className={`primary-btn submit-btn ${messageType === 'success' ? 'submit-success' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : messageType === 'success' ? '✓ Success' : 'Login'}
          </button>

          <div className="admin-login-side">
            <span>Are you the admin?</span>
            <Link to="/admin-login" className="admin-login-link">Admin Login</Link>
          </div>

          <p className="auth-footnote">
            New to Smart Agriculture? <Link to="/register">Create your account</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Login;
