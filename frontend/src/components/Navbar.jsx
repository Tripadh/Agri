import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getCurrentRole, getCurrentUser } from '../services/authService';
import SearchBar from './Search/SearchBar';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = getCurrentRole();
  const user = getCurrentUser();

  const authLinks = !token
    ? [
        { label: 'Home', to: '/' },
        { label: 'Login', to: '/login' },
        { label: 'Register', to: '/register' },
      ]
    : role === 'admin'
      ? [
          { label: 'Admin', to: '/admin' },
          { label: 'Users', to: '/admin/users' },
          { label: 'Crops', to: '/admin/crops' },
          { label: 'Resources', to: '/admin/resources' },
          { label: 'Activities', to: '/admin/activities' },
          { label: 'Weather History', to: '/admin/weather-history' },
          { label: 'Profile', to: '/profile' },
        ]
      : [
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Crops', to: '/crops' },
          { label: 'Resources', to: '/resources' },
          { label: 'Activities', to: '/activities' },
          { label: 'Weather', to: '/weather' },
          { label: 'Profile', to: '/profile' },
        ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-content">
        <div className="navbar-brand-zone">
          <Link to={token ? '/dashboard' : '/'} className="brand" aria-label="Smart Agriculture home">
            <span className="brand-logo" aria-hidden="true">SA</span>
            <span className="brand-text">Smart Agriculture</span>
          </Link>
        </div>

        <nav className="nav-links" aria-label="Main navigation">
          {authLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                isActive ? 'nav-link nav-link-active' : 'nav-link'
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {token && (
          <div className="nav-user-area" aria-label="User actions">
            <SearchBar />
            <span className="nav-user-chip">{user?.name || role}</span>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
