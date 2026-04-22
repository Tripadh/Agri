import { useEffect, useState } from 'react';

function EditResourceModal({ resource, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState(resource || {});

  useEffect(() => {
    setFormData(resource || {});
  }, [resource]);

  if (!resource) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(resource._id, formData);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2>Edit Resource</h2>
        <form className="form-panel" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Type
              <input name="resourceType" value={formData.resourceType || ''} onChange={handleChange} />
            </label>
            <label>
              Quantity
              <input name="quantity" type="number" value={formData.quantity || ''} onChange={handleChange} />
            </label>
            <label>
              Unit
              <input name="unit" value={formData.unit || ''} onChange={handleChange} />
            </label>
            <label>
              Cost
              <input name="cost" type="number" value={formData.cost || ''} onChange={handleChange} />
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

export default EditResourceModal;
