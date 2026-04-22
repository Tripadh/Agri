import { useEffect, useState, useCallback } from 'react';
import { createCrop, deleteCrop, getMyCrops, updateCrop } from '../services/cropService';
import Pagination from '../components/Pagination/Pagination';
import FilterPanel from '../components/Filters/FilterPanel';
import SortDropdown from '../components/Filters/SortDropdown';
import paddyImage from '../assets/crops/paddy.svg';
import wheatImage from '../assets/crops/wheat.svg';
import cornImage from '../assets/crops/corn.svg';
import cottonImage from '../assets/crops/cotton.svg';
import './Crops.css';
import './Forms.css';

const initialForm = {
  name: '',
  type: '',
  stage: '',
  plantedDate: '',
  notes: '',
};

const cropTemplates = [
  {
    id: 'paddy',
    title: 'Paddy',
    type: 'Rice',
    stage: 'Seedling',
    notes: 'Suitable for water-rich fields. Monitor irrigation weekly.',
    image: paddyImage,
  },
  {
    id: 'wheat',
    title: 'Wheat',
    type: 'Wheat',
    stage: 'Vegetative',
    notes: 'Use balanced fertilizer and monitor leaf health.',
    image: wheatImage,
  },
  {
    id: 'corn',
    title: 'Corn',
    type: 'Corn',
    stage: 'Growing',
    notes: 'Keep spacing consistent for better airflow and sunlight.',
    image: cornImage,
  },
  {
    id: 'cotton',
    title: 'Cotton',
    type: 'Cotton',
    stage: 'Flowering',
    notes: 'Track pest activity closely during flowering stage.',
    image: cottonImage,
  },
];

function Crops() {
  const [crops, setCrops] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  
  const [currentSort, setCurrentSort] = useState('latest');
  const [currentFilters, setCurrentFilters] = useState({});

  const loadCrops = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 5,
        sort: currentSort,
        ...currentFilters
      };
      const data = await getMyCrops(params);
      setCrops(data.data || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
      setHasNextPage(data.hasNextPage || false);
      setHasPrevPage(data.hasPrevPage || false);
    } catch (error) {
      console.error('Error loading crops:', error);
    } finally {
      setLoading(false);
    }
  }, [page, currentSort, currentFilters]);

  useEffect(() => {
    loadCrops();
  }, [loadCrops]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemplateSelect = (template) => {
    setEditingId('');
    setFormData((prev) => ({
      ...prev,
      name: template.title,
      type: template.type,
      stage: template.stage,
      notes: prev.notes || template.notes,
    }));
    localStorage.setItem(
      'selectedCropTemplate',
      JSON.stringify({
        id: template.id,
        title: template.title,
        type: template.type,
        stage: template.stage,
      })
    );
    setMessage(`Selected ${template.title} template. You can now adjust details if needed.`);
    setMessageType('success');
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setMessageType('');

    try {
      if (editingId) {
        await updateCrop(editingId, formData);
        setMessage('Crop updated successfully');
      } else {
        await createCrop(formData);
        setMessage('Crop added successfully');
      }
      setMessageType('success');
      resetForm();
      setPage(1); // Reset to page 1 after add/update
      await loadCrops();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to save crop');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (crop) => {
    setEditingId(crop._id);
    setFormData({
      name: crop.name || '',
      type: crop.type || '',
      stage: crop.stage || '',
      plantedDate: crop.plantedDate ? crop.plantedDate.slice(0, 10) : '',
      notes: crop.notes || '',
    });
  };

  const handleDelete = async (cropId) => {
    if (!window.confirm('Delete this crop?')) return;
    await deleteCrop(cropId);
    if (crops.length === 1 && page > 1) {
      setPage(page - 1);
    } else {
      await loadCrops();
    }
  };

  const handleFilterChange = (id, value) => {
    setCurrentFilters(prev => ({ ...prev, [id]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleSearchChange = (value) => {
    setCurrentFilters(prev => ({ ...prev, search: value }));
    setPage(1);
  };

  const cropFiltersConfig = [
    {
      id: 'cropType',
      label: 'Type',
      options: [
        { value: 'Rice', label: 'Rice' },
        { value: 'Wheat', label: 'Wheat' },
        { value: 'Corn', label: 'Corn' },
        { value: 'Vegetable', label: 'Vegetable' },
        { value: 'Fruit', label: 'Fruit' },
      ]
    },
    {
      id: 'growthStage',
      label: 'Stage',
      options: [
        { value: 'Seedling', label: 'Seedling' },
        { value: 'Vegetative', label: 'Vegetative' },
        { value: 'Flowering', label: 'Flowering' },
        { value: 'Fruiting', label: 'Fruiting' },
        { value: 'Harvesting', label: 'Harvesting' },
      ]
    }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name-asc', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
  ];

  return (
    <section className="card crops-shell">
      <div className="page-head">
        <div>
          <h1>My Crops</h1>
          <p>Manage your own crop records. Total crops: {totalItems}</p>
        </div>
      </div>

      <form className="form-panel" onSubmit={handleSubmit}>
        <div className="crop-template-section">
          <h2>Quick Select by Image</h2>
          <p>Click a crop card to auto-fill crop type and stage.</p>
          <div className="crop-template-grid">
            {cropTemplates.map((template) => {
              const isSelected = formData.name === template.title && formData.type === template.type;
              return (
                <button
                  key={template.id}
                  type="button"
                  className={`crop-template-card${isSelected ? ' selected' : ''}`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <img src={template.image} alt={`${template.title} crop`} className="crop-template-image" />
                  <div className="crop-template-meta">
                    <strong>{template.title}</strong>
                    <span>{template.stage}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-grid">
          <label>
            Crop Name
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>
          <label>
            Type
            <input name="type" value={formData.type} onChange={handleChange} required />
          </label>
          <label>
            Stage
            <input name="stage" value={formData.stage} onChange={handleChange} required />
          </label>
          <label>
            Planted Date
            <input name="plantedDate" type="date" value={formData.plantedDate} onChange={handleChange} />
          </label>
        </div>
        <label>
          Notes
          <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} />
        </label>

        {message && <div className={`form-message ${messageType}`}>{message}</div>}

        <div className="form-actions">
          <button type="submit" className="auth-submit-btn" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Crop' : 'Add Crop'}
          </button>
          {editingId && (
            <button type="button" className="secondary-btn" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="filters-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
        <FilterPanel 
          filters={cropFiltersConfig} 
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

      <div className="table-wrap">
        {loading ? (
          <p>Loading crops...</p>
        ) : crops.length === 0 ? (
          <p>No crops found matching your filters.</p>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Stage</th>
                  <th>Planted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {crops.map((crop) => (
                  <tr key={crop._id}>
                    <td>{crop.name}</td>
                    <td>{crop.type}</td>
                    <td>{crop.stage}</td>
                    <td>{crop.plantedDate ? new Date(crop.plantedDate).toLocaleDateString() : '-'}</td>
                    <td className="actions-cell">
                      <button type="button" className="link-btn" onClick={() => handleEdit(crop)}>Edit</button>
                      <button type="button" className="danger-btn" onClick={() => handleDelete(crop._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <Pagination 
              currentPage={page} 
              totalPages={totalPages} 
              onPageChange={setPage} 
              hasNextPage={hasNextPage} 
              hasPrevPage={hasPrevPage} 
            />
          </>
        )}
      </div>
    </section>
  );
}

export default Crops;
