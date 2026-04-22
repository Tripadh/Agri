import { useEffect, useMemo, useState } from 'react';
import { deleteActivity, getAllActivities, updateActivity } from '../services/activityService';
import ActivitySearchBar from '../components/activities/ActivitySearchBar';
import ActivityList from '../components/activities/ActivityList';
import EditActivityModal from '../components/activities/EditActivityModal';
import { getAllCrops } from '../services/cropService';
import './Forms.css';
import './Cards.css';
import './Activities.css';
import './ActivityForm.css';
import './Tables.css';

function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingActivity, setEditingActivity] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [activitiesData, cropsData] = await Promise.all([getAllActivities(), getAllCrops()]);
      setActivities(activitiesData.activities || []);
      setCrops(cropsData.crops || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch = [activity.title, activity.description, activity.activityType, activity.fieldLocation, activity.userId?.name]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || activity.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [activities, search, statusFilter, priorityFilter]);

  const handleEdit = (activity) => setEditingActivity(activity);
  const handleUpdate = async (activityId, payload) => {
    await updateActivity(activityId, payload);
    setEditingActivity(null);
    await loadData();
  };
  const handleDelete = async (activityId) => {
    if (!window.confirm('Delete this activity?')) return;
    await deleteActivity(activityId);
    await loadData();
  };
  const handleComplete = async (activityId) => {
    await updateActivity(activityId, { status: 'completed' });
    await loadData();
  };

  return (
    <section className="card activity-page">
      <h1>Admin Activities</h1>
      <ActivitySearchBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
      />
      <ActivityList
        activities={filteredActivities}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onComplete={handleComplete}
        loading={loading}
      />
      <EditActivityModal activity={editingActivity} crops={crops} onClose={() => setEditingActivity(null)} onSubmit={handleUpdate} loading={false} />
    </section>
  );
}

export default AdminActivities;
