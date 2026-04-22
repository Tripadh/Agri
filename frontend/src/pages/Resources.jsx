import { useEffect, useState, useCallback } from 'react';
import { createResource, deleteResource, getMyResources, updateResource } from '../services/resourceService';
import AddResourceForm from '../components/resources/AddResourceForm';
import EditResourceModal from '../components/resources/EditResourceModal';
import ResourceList from '../components/resources/ResourceList';
import Pagination from '../components/Pagination/Pagination';
import FilterPanel from '../components/Filters/FilterPanel';
import SortDropdown from '../components/Filters/SortDropdown';
import './Forms.css';
import './Cards.css';
import './Resources.css';
import './ResourceForm.css';
import './Tables.css';

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const [currentSort, setCurrentSort] = useState('latest');
  const [currentFilters, setCurrentFilters] = useState({});

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 5,
        sort: currentSort,
        search: currentFilters.search || '',
        resourceType: currentFilters.resourceType || '',
      };
      
      const data = await getMyResources(params);
      setResources(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
      setHasNextPage(data.hasNextPage || false);
      setHasPrevPage(data.hasPrevPage || false);
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  }, [page, currentSort, currentFilters]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleAdd = async (payload) => {
    setSaving(true);
    setMessage('');
    try {
      await createResource(payload);
      setMessage('Resource added successfully');
      setMessageType('success');
      setPage(1);
      await loadResources();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add resource');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (resource) => setEditingResource(resource);

  const handleUpdate = async (resourceId, payload) => {
    setSaving(true);
    try {
      await updateResource(resourceId, payload);
      setEditingResource(null);
      await loadResources();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Delete this resource?')) return;
    await deleteResource(resourceId);
    if (resources.length === 1 && page > 1) {
      setPage(page - 1);
    } else {
      await loadResources();
    }
  };

  const handleFilterChange = (id, value) => {
    setCurrentFilters(prev => ({ ...prev, [id]: value }));
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setCurrentFilters(prev => ({ ...prev, search: value }));
    setPage(1);
  };

  const resourceFiltersConfig = [
    {
      id: 'resourceType',
      label: 'Type',
      options: [
        { value: 'water', label: 'Water' },
        { value: 'fertilizer', label: 'Fertilizer' },
        { value: 'pesticide', label: 'Pesticide' },
        { value: 'seeds', label: 'Seeds' },
        { value: 'labor', label: 'Labor' },
        { value: 'equipment', label: 'Equipment' }
      ]
    }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'cost-desc', label: 'Highest Cost' },
    { value: 'cost-asc', label: 'Lowest Cost' },
  ];

  return (
    <section className="card resource-page">
      <div className="page-head">
        <div>
          <h1>Resources</h1>
          <p>Track farm inputs, costs, and usage history. Total: {totalItems}</p>
        </div>
      </div>

      <AddResourceForm onSubmit={handleAdd} loading={saving} />

      {message && <div className={`form-message ${messageType}`}>{message}</div>}

      <div className="filters-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
        <FilterPanel 
          filters={resourceFiltersConfig} 
          currentFilters={currentFilters} 
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />
        <SortDropdown 
          sortOptions={sortOptions} 
          currentSort={currentSort} 
          onSortChange={(val) => { setCurrentSort(val); setPage(1); }} 
        />
      </div>

      <ResourceList resources={resources} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
      
      {!loading && resources.length > 0 && (
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
          hasNextPage={hasNextPage} 
          hasPrevPage={hasPrevPage} 
        />
      )}

      <EditResourceModal
        resource={editingResource}
        onClose={() => setEditingResource(null)}
        onSubmit={handleUpdate}
        loading={saving}
      />
    </section>
  );
}

export default Resources;
