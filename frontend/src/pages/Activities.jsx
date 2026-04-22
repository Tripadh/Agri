import { useEffect, useState, useCallback } from 'react';
import { getCurrentRole } from '../services/authService';
import { createActivity, deleteActivity, getMyActivities, updateActivity } from '../services/activityService';
import { getMyCrops, getAllCrops } from '../services/cropService';
import AddActivityForm from '../components/activities/AddActivityForm';
import ActivityList from '../components/activities/ActivityList';
import EditActivityModal from '../components/activities/EditActivityModal';
import Pagination from '../components/Pagination/Pagination';
import FilterPanel from '../components/Filters/FilterPanel';
import SortDropdown from '../components/Filters/SortDropdown';
import './Forms.css';
import './Cards.css';
import './Activities.css';
import './ActivityForm.css';
import './Tables.css';

const todayDate = () => new Date().toISOString().slice(0, 10);

const cropActivityTemplates = {
  paddy: [
    {
      id: 'paddy-water',
      label: 'Paddy Irrigation Check',
      payload: {
        activityType: 'watering',
        title: 'Paddy field irrigation check',
        description: 'Inspect standing water level and maintain consistent irrigation.',
        priority: 'high',
      },
    },
    {
      id: 'paddy-inspect',
      label: 'Paddy Pest Inspection',
      payload: {
        activityType: 'inspection',
        title: 'Inspect paddy for pests and leaf damage',
        description: 'Check leaves and stem base for early pest signs.',
        priority: 'medium',
      },
    },
  ],
  wheat: [
    {
      id: 'wheat-fertilize',
      label: 'Wheat Nutrient Plan',
      payload: {
        activityType: 'fertilizing',
        title: 'Apply balanced fertilizer to wheat plot',
        description: 'Apply recommended nitrogen-phosphorus dose and monitor response.',
        priority: 'high',
      },
    },
    {
      id: 'wheat-inspect',
      label: 'Wheat Field Inspection',
      payload: {
        activityType: 'inspection',
        title: 'Inspect wheat growth uniformity',
        description: 'Check patchy growth zones and soil moisture consistency.',
        priority: 'medium',
      },
    },
  ],
  corn: [
    {
      id: 'corn-watering',
      label: 'Corn Watering Cycle',
      payload: {
        activityType: 'watering',
        title: 'Corn field watering schedule',
        description: 'Maintain moisture around root zone during active growth.',
        priority: 'medium',
      },
    },
    {
      id: 'corn-maintenance',
      label: 'Corn Plant Maintenance',
      payload: {
        activityType: 'maintenance',
        title: 'Corn row maintenance and cleanup',
        description: 'Remove weeds and ensure clear spacing between rows.',
        priority: 'low',
      },
    },
  ],
  cotton: [
    {
      id: 'cotton-spray',
      label: 'Cotton Spray Plan',
      payload: {
        activityType: 'spraying',
        title: 'Cotton crop protection spray',
        description: 'Apply preventive spray and monitor bollworm activity.',
        priority: 'high',
      },
    },
    {
      id: 'cotton-inspect',
      label: 'Cotton Flowering Check',
      payload: {
        activityType: 'inspection',
        title: 'Inspect cotton flowering stage',
        description: 'Track flowering consistency and stress signs across field.',
        priority: 'medium',
      },
    },
  ],
};

function Activities() {
  const role = getCurrentRole();
  const [activities, setActivities] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [activityPreset, setActivityPreset] = useState(null);
  const [presetVersion, setPresetVersion] = useState(0);
  const [selectedTemplateName, setSelectedTemplateName] = useState('');
  const [suggestedTemplates, setSuggestedTemplates] = useState([]);

  // Pagination & Filters State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  const [currentSort, setCurrentSort] = useState('latest');
  const [currentFilters, setCurrentFilters] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 5,
        sort: currentSort,
        search: currentFilters.search || '',
        status: currentFilters.status || '',
        priority: currentFilters.priority || '',
      };

      const [activitiesData, cropsData] = await Promise.all([
        getMyActivities(params),
        role === 'admin' ? getAllCrops() : getMyCrops(),
      ]);
      
      setActivities(activitiesData.data || []);
      setTotalPages(activitiesData.totalPages || 1);
      setTotalItems(activitiesData.totalItems || 0);
      setHasNextPage(activitiesData.hasNextPage || false);
      setHasPrevPage(activitiesData.hasPrevPage || false);
      
      setCrops(role === 'admin' ? (cropsData.data || cropsData.crops || []) : (cropsData.data || cropsData.crops || []));
    } catch (err) {
      console.error('Failed to load activities', err);
    } finally {
      setLoading(false);
    }
  }, [page, currentSort, currentFilters, role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    try {
      const selected = JSON.parse(localStorage.getItem('selectedCropTemplate') || 'null');
      if (!selected?.id) {
        setSuggestedTemplates([]);
        setSelectedTemplateName('');
        return;
      }

      setSelectedTemplateName(selected.title || selected.id);
      setSuggestedTemplates(cropActivityTemplates[selected.id] || []);
    } catch {
      setSuggestedTemplates([]);
      setSelectedTemplateName('');
    }
  }, []);

  const applyActivityPreset = (template) => {
    setActivityPreset({
      ...template.payload,
      activityDate: todayDate(),
      status: 'pending',
    });
    setPresetVersion((prev) => prev + 1);
    setMessage(`Applied template: ${template.label}`);
    setMessageType('success');
  };

  const handleAdd = async (payload) => {
    setSaving(true);
    setMessage('');
    try {
      await createActivity(payload);
      setMessage('Activity added successfully');
      setMessageType('success');
      setPage(1);
      await loadData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to add activity');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (activity) => setEditingActivity(activity);

  const handleUpdate = async (activityId, payload) => {
    setSaving(true);
    try {
      await updateActivity(activityId, payload);
      setEditingActivity(null);
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (activityId) => {
    await updateActivity(activityId, { status: 'completed' });
    await loadData();
  };

  const handleDelete = async (activityId) => {
    if (!window.confirm('Delete this activity?')) return;
    await deleteActivity(activityId);
    if (activities.length === 1 && page > 1) {
      setPage(page - 1);
    } else {
      await loadData();
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

  const activityFiltersConfig = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
      ]
    },
    {
      id: 'priority',
      label: 'Priority',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
      ]
    }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' },
  ];

  return (
    <section className="card activity-page">
      <div className="page-head">
        <div>
          <h1>Activities</h1>
          <p>Track watering, harvesting, inspections, and more. Total: {totalItems}</p>
        </div>
      </div>

      {suggestedTemplates.length > 0 && (
        <section className="activity-template-section">
          <h2>Suggested Activity Templates</h2>
          <p>Based on selected crop card: {selectedTemplateName}</p>
          <div className="activity-template-grid">
            {suggestedTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                className="activity-template-chip"
                onClick={() => applyActivityPreset(template)}
              >
                {template.label}
              </button>
            ))}
          </div>
        </section>
      )}

      <AddActivityForm
        crops={crops}
        onSubmit={handleAdd}
        loading={saving}
        presetData={activityPreset}
        presetVersion={presetVersion}
      />

      {message && <div className={`form-message ${messageType}`}>{message}</div>}

      <div className="filters-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
        <FilterPanel 
          filters={activityFiltersConfig} 
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

      <ActivityList
        activities={activities}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onComplete={handleComplete}
        loading={loading}
      />

      {!loading && activities.length > 0 && (
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
          hasNextPage={hasNextPage} 
          hasPrevPage={hasPrevPage} 
        />
      )}

      <EditActivityModal
        activity={editingActivity}
        crops={crops}
        onClose={() => setEditingActivity(null)}
        onSubmit={handleUpdate}
        loading={saving}
      />
    </section>
  );
}

export default Activities;
