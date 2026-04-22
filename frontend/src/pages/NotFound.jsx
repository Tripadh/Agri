import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="card">
      <h1>404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/" className="btn-primary">
        Go to Home
      </Link>
    </section>
  );
}

export default NotFound;
