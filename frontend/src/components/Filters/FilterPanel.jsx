import PropTypes from 'prop-types';
import './Filters.css';

function FilterPanel({ filters, currentFilters, onFilterChange, onSearchChange }) {
  return (
    <div className="filters-container">
      <div className="filters-group">
        <div className="filter-item search-filter">
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input-filter"
            value={currentFilters.search || ''}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        {filters.map((filter) => (
          <div key={filter.id} className="filter-item">
            <label htmlFor={`filter-${filter.id}`}>{filter.label}</label>
            <select
              id={`filter-${filter.id}`}
              value={currentFilters[filter.id] || ''}
              onChange={(e) => onFilterChange(filter.id, e.target.value)}
              className="filter-select"
            >
              <option value="">All</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

FilterPanel.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  currentFilters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

export default FilterPanel;
