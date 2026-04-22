import ResourceCard from './ResourceCard';

function ResourceList({ resources, onEdit, onDelete, loading }) {
  if (loading) {
    return <p>Loading resources...</p>;
  }

  if (!resources.length) {
    return <p>No resources found.</p>;
  }

  return (
    <div className="cards-grid">
      {resources.map((resource) => (
        <ResourceCard key={resource._id} resource={resource} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default ResourceList;
