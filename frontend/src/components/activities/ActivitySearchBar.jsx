function ActivitySearchBar({ search, setSearch, statusFilter, setStatusFilter, priorityFilter, setPriorityFilter }) {
  return (
    <div className="search-bar-panel">
      <input
        type="text"
        placeholder="Search activities by title, type, notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="all">All Status</option>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
      <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
        <option value="all">All Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>
  );
}

export default ActivitySearchBar;
