import { useEffect, useMemo, useState } from 'react';
import { deleteResource, getAllResources, updateResource } from '../services/resourceService';
import ResourceSearchBar from '../components/resources/ResourceSearchBar';
import ResourceList from '../components/resources/ResourceList';
import EditResourceModal from '../components/resources/EditResourceModal';
import './Forms.css';
import './Cards.css';
import './Resources.css';
import './ResourceForm.css';
import './Tables.css';

function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingResource, setEditingResource] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const loadResources = async () => {
    setLoading(true);
    try {
      const data = await getAllResources();
      setResources(data.resources || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch = [resource.resourceType, resource.supplier, resource.notes, resource.fieldLocation, resource.userId?.name]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || resource.resourceType === typeFilter;
      const matchesDate = !dateFilter || new Date(resource.usageDate).toISOString().slice(0, 10) === dateFilter;
      return matchesSearch && matchesType && matchesDate;
    });
  }, [resources, search, typeFilter, dateFilter]);

  const handleEdit = (resource) => setEditingResource(resource);
  const handleUpdate = async (resourceId, payload) => {
    await updateResource(resourceId, payload);
    setEditingResource(null);
    await loadResources();
  };
  const handleDelete = async (resourceId) => {
    if (!window.confirm('Delete this resource?')) return;
    await deleteResource(resourceId);
    await loadResources();
  };

  return (
    <section className="card resource-page">
      <h1>Admin Resources</h1>
      <ResourceSearchBar
        search={search}
        setSearch={setSearch}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />
      <ResourceList resources={filteredResources} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
      <EditResourceModal resource={editingResource} onClose={() => setEditingResource(null)} onSubmit={handleUpdate} loading={false} />
    </section>
  );
}

export default AdminResources;
