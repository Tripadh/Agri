import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import './Forms.css';
import './Register.css';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

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

    setTouched({ name: true, email: true, password: true });

    if (formData.name.trim().length < 2) {
      setMessage('Name should be at least 2 characters.');
      setMessageType('error');
      return;
    }

    if (!emailValid) {
      setMessage('Please enter a valid email format.');
      setMessageType('error');
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      setMessageType('error');
      return;
    }

    setIsLoading(true);

    try {
      const data = await registerUser(formData);
      setMessage(data.message || 'Registration successful. Redirecting to login...');
      setMessageType('success');

      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="form-shell auth-shell register-shell">
      <div className="form-card auth-card register-card">
        <h1>Create Account</h1>
        <p className="form-description">
          Start with a <span className="register-highlight">secure farmer profile</span>.
        </p>

        {message && (
          <div className={`form-message ${messageType}`}>
            {messageType === 'success' && <span className="success-icon" aria-hidden="true">✓</span>}
            {message}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              required
            />
            <small className={`field-hint ${touched.name && formData.name.trim().length < 2 ? 'invalid' : formData.name.trim().length >= 2 ? 'valid' : ''}`}>
              {touched.name && formData.name.trim().length < 2 ? 'Please enter at least 2 characters' : 'Use your real name'}
            </small>
          </div>

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
              {touched.email && !emailValid ? 'Use format like farmer@example.com' : 'Use an active email for account access'}
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
                placeholder="At least 6 characters"
                minLength={6}
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
              {passwordStrength
                ? `Password strength: ${passwordStrength}`
                : 'Add uppercase letters and numbers for stronger security'}
            </small>
          </div>

          <button
            type="submit"
            className={`primary-btn submit-btn ${messageType === 'success' ? 'submit-success' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : messageType === 'success' ? '✓ Success' : 'Register'}
          </button>

          <p className="auth-footnote">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </form>
      </div>
    </section>
  );
}

export default Register;
