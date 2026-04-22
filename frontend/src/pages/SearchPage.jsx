import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../components/Search/Search.css';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults(null);
        return;
      }
      
      setLoading(true);
      setError('');
      
      try {
        const response = await api.get(`/search?query=${encodeURIComponent(query)}`);
        setResults(response.data);
        setActiveTab('all');
      } catch (err) {
        setError(err.response?.data?.message || 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleManualSearch = (e) => {
    e.preventDefault();
    const newQuery = new FormData(e.target).get('q');
    if (newQuery && newQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(newQuery.trim())}`);
    }
  };

  const renderTabContent = () => {
    if (!results) return null;

    let displayData = [];
    let titleBase = '';

    if (activeTab === 'all') {
      return (
        <div className="search-summary">
          <p>Found results in:</p>
          <ul className="search-summary-list">
            <li><button type="button" onClick={() => setActiveTab('crops')}>Crops ({results.totals.crops})</button></li>
            <li><button type="button" onClick={() => setActiveTab('resources')}>Resources ({results.totals.resources})</button></li>
            <li><button type="button" onClick={() => setActiveTab('activities')}>Activities ({results.totals.activities})</button></li>
            {results.totals.users > 0 && <li><button type="button" onClick={() => setActiveTab('users')}>Users ({results.totals.users})</button></li>}
          </ul>
        </div>
      );
    } else if (activeTab === 'crops') {
      displayData = results.crops;
      titleBase = 'Crop';
    } else if (activeTab === 'resources') {
      displayData = results.resources;
      titleBase = 'Resource';
    } else if (activeTab === 'activities') {
      displayData = results.activities;
      titleBase = 'Activity';
    } else if (activeTab === 'users') {
      displayData = results.users;
      titleBase = 'User';
    }

    if (displayData.length === 0) {
      return <p className="empty-state">No {activeTab} found for "{query}"</p>;
    }

    return (
      <div className="search-results-list">
        {displayData.map((item) => (
          <div key={item._id} className="search-result-card">
            <h4>{item.name || item.title || item.resourceType}</h4>
            <p className="search-result-meta">
              {item.type && <span>Type: {item.type}</span>}
              {item.stage && <span> • Stage: {item.stage}</span>}
              {item.status && <span>Status: {item.status}</span>}
              {item.quantity && <span>{item.quantity} {item.unit}</span>}
              {item.email && <span>Email: {item.email}</span>}
              {item.role && <span> • Role: {item.role}</span>}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <section className="card search-page">
      <h1>Global Search</h1>
      
      <form onSubmit={handleManualSearch} className="search-page-form">
        <input 
          name="q" 
          type="search" 
          defaultValue={query} 
          placeholder="Search for crops, resources..." 
          className="search-page-input"
        />
        <button type="submit" className="primary-btn">Search</button>
      </form>

      {loading && <p>Searching...</p>}
      {error && <p className="form-message error">{error}</p>}

      {!loading && !error && results && (
        <div className="search-results-container">
          <div className="search-tabs">
            <button type="button" className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              All Results
            </button>
            <button type="button" className={`tab-btn ${activeTab === 'crops' ? 'active' : ''}`} onClick={() => setActiveTab('crops')}>
              Crops ({results.totals.crops})
            </button>
            <button type="button" className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>
              Resources ({results.totals.resources})
            </button>
            <button type="button" className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`} onClick={() => setActiveTab('activities')}>
              Activities ({results.totals.activities})
            </button>
            {results.totals.users > 0 && (
              <button type="button" className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                Users ({results.totals.users})
              </button>
            )}
          </div>
          
          <div className="tab-content">
            {renderTabContent()}
          </div>
        </div>
      )}

      {!query && !loading && (
        <p className="empty-state">Enter a query above to start searching</p>
      )}
    </section>
  );
}

export default SearchPage;
