function WeatherHistory({ history, onDelete }) {
  if (!history?.length) {
    return <p>No weather history found.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>User</th>
            <th>City</th>
            <th>Temperature</th>
            <th>Condition</th>
            <th>Searched At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry._id}>
              <td>{entry.userId?.name || 'Unknown'}</td>
              <td>{entry.city}</td>
              <td>{entry.temperature}°C</td>
              <td>{entry.condition}</td>
              <td>{new Date(entry.searchedAt).toLocaleString()}</td>
              <td>
                <button type="button" className="danger-btn" onClick={() => onDelete(entry._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WeatherHistory;
