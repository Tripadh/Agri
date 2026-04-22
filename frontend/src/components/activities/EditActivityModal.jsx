import { useEffect, useState } from 'react';

function EditActivityModal({ activity, crops = [], onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState(activity || {});

  useEffect(() => {
    setFormData(activity || {});
  }, [activity]);

  if (!activity) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(activity._id, formData);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2>Edit Activity</h2>
        <form className="form-panel" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Crop
              <select name="cropId" value={formData.cropId?._id || formData.cropId || ''} onChange={handleChange}>
                <option value="">No crop selected</option>
                {crops.map((crop) => (
                  <option key={crop._id} value={crop._id}>{crop.name}</option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select name="activityType" value={formData.activityType || ''} onChange={handleChange}>
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
              <input name="title" value={formData.title || ''} onChange={handleChange} />
            </label>
            <label>
              Status
              <select name="status" value={formData.status || 'pending'} onChange={handleChange}>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          </div>
          <div className="modal-actions">
            <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
            <button type="button" className="secondary-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditActivityModal;
