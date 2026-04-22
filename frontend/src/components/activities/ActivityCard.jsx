function ActivityCard({ activity, onEdit, onDelete, onComplete }) {
  return (
    <article className="data-card">
      <div className="data-card-top">
        <div>
          <strong>{activity.title}</strong>
          <p>{activity.activityType}</p>
        </div>
        <span className={`pill status-${activity.status}`}>{activity.status}</span>
      </div>
      <p>Date: {new Date(activity.activityDate).toLocaleDateString()}</p>
      <p>Priority: {activity.priority}</p>
      <p>Location: {activity.fieldLocation || 'N/A'}</p>
      {activity.description && <p>{activity.description}</p>}
      {activity.cropId?.name && <p>Crop: {activity.cropId.name}</p>}
      <div className="card-actions">
        <button type="button" className="link-btn" onClick={() => onEdit(activity)}>Edit</button>
        {activity.status !== 'completed' && (
          <button type="button" className="secondary-btn" onClick={() => onComplete(activity._id)}>
            Mark Completed
          </button>
        )}
        <button type="button" className="danger-btn" onClick={() => onDelete(activity._id)}>Delete</button>
      </div>
    </article>
  );
}

export default ActivityCard;
