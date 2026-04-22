function ResourceCard({ resource, onEdit, onDelete }) {
  return (
    <article className="data-card">
      <div className="data-card-top">
        <div>
          <strong>{resource.resourceType}</strong>
          <p>{resource.quantity} {resource.unit}</p>
        </div>
        <span className="pill">{resource.cost}</span>
      </div>
      <p>Date: {new Date(resource.usageDate).toLocaleDateString()}</p>
      <p>Location: {resource.fieldLocation || 'N/A'}</p>
      <p>Supplier: {resource.supplier || 'N/A'}</p>
      {resource.notes && <p>Notes: {resource.notes}</p>}
      <div className="card-actions">
        <button type="button" className="link-btn" onClick={() => onEdit(resource)}>Edit</button>
        <button type="button" className="danger-btn" onClick={() => onDelete(resource._id)}>Delete</button>
      </div>
    </article>
  );
}

export default ResourceCard;
