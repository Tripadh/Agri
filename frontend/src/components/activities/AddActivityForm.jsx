import { useEffect, useState } from 'react';

const initialForm = {
  cropId: '',
  activityType: 'watering',
  title: '',
  description: '',
  activityDate: '',
  status: 'pending',
  priority: 'medium',
  fieldLocation: '',
};

function AddActivityForm({ crops = [], onSubmit, loading, presetData = null, presetVersion = 0 }) {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (!crops.length) {
      setFormData((prev) => ({ ...prev, cropId: '' }));
    }
  }, [crops]);

  useEffect(() => {
    if (!presetData) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      ...presetData,
    }));
  }, [presetData, presetVersion]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(formData);
    setFormData(initialForm);
  };

  return (
    <form className="form-panel activity-form" onSubmit={handleSubmit}>
      <h2>Add Activity</h2>
      <div className="form-grid">
        <label>
          Crop (Optional)
          <select name="cropId" value={formData.cropId} onChange={handleChange}>
            <option value="">No crop selected</option>
            {crops.map((crop) => (
              <option key={crop._id} value={crop._id}>{crop.name}</option>
            ))}
          </select>
        </label>
        <label>
          Activity Type
          <select name="activityType" value={formData.activityType} onChange={handleChange}>
            <option value="watering">Watering</option>
            <option value="fertilizing">Fertilizing</option>
            <option value="spraying">Spraying</option>
            <option value="harvesting">Harvesting</option>
            <option value="planting">Planting</option>
            <option value="maintenance">Maintenance</option>
            <option value="inspection">Inspection</option>
          </select>
        </label>
        <label>
          Title
          <input name="title" value={formData.title} onChange={handleChange} required />
        </label>
        <label>
          Activity Date
          <input name="activityDate" type="date" value={formData.activityDate} onChange={handleChange} required />
        </label>
        <label>
          Status
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label>
          Priority
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
        <label>
          Field Location
          <input name="fieldLocation" value={formData.fieldLocation} onChange={handleChange} />
        </label>
      </div>
      <label>
        Description
        <textarea name="description" rows="3" value={formData.description} onChange={handleChange} />
      </label>
      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? 'Saving...' : 'Save Activity'}
      </button>
    </form>
  );
}

export default AddActivityForm;
