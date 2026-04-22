import ActivityCard from './ActivityCard';

function ActivityList({ activities, onEdit, onDelete, onComplete, loading }) {
  if (loading) {
    return <p>Loading activities...</p>;
  }

  if (!activities.length) {
    return <p>No activities found.</p>;
  }

  return (
    <div className="cards-grid">
      {activities.map((activity) => (
        <ActivityCard
          key={activity._id}
          activity={activity}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
}

export default ActivityList;
