import PropTypes from 'prop-types';
import './Filters.css';

function SortDropdown({ sortOptions, currentSort, onSortChange }) {
  return (
    <div className="sort-dropdown">
      <label htmlFor="sort-select">Sort by:</label>
      <select 
        id="sort-select"
        value={currentSort} 
        onChange={(e) => onSortChange(e.target.value)}
        className="sort-select"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

SortDropdown.propTypes = {
  sortOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  currentSort: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
};

export default SortDropdown;
