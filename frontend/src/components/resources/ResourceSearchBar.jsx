function ResourceSearchBar({ search, setSearch, typeFilter, setTypeFilter, dateFilter, setDateFilter }) {
  return (
    <div className="search-bar-panel">
      <input
        type="text"
        placeholder="Search resources by type, supplier, notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
        <option value="all">All Types</option>
        <option value="water">Water</option>
        <option value="fertilizer">Fertilizer</option>
        <option value="pesticide">Pesticide</option>
        <option value="seeds">Seeds</option>
        <option value="labor">Labor</option>
        <option value="equipment">Equipment</option>
      </select>
      <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
    </div>
  );
}

export default ResourceSearchBar;
