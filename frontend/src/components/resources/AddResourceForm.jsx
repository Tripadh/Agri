import { useState } from 'react';

const initialForm = {
  resourceType: 'water',
  quantity: '',
  unit: 'liters',
  cost: '',
  usageDate: '',
  fieldLocation: '',
  supplier: '',
  notes: '',
};

function AddResourceForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState(initialForm);

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
    <form className="form-panel resource-form" onSubmit={handleSubmit}>
      <h2>Add Resource</h2>
      <div className="form-grid">
        <label>
          Resource Type
          <select name="resourceType" value={formData.resourceType} onChange={handleChange}>
            <option value="water">Water</option>
            <option value="fertilizer">Fertilizer</option>
            <option value="pesticide">Pesticide</option>
            <option value="seeds">Seeds</option>
            <option value="labor">Labor</option>
            <option value="equipment">Equipment</option>
          </select>
        </label>
        <label>
          Quantity
          <input name="quantity" type="number" value={formData.quantity} onChange={handleChange} required />
        </label>
        <label>
          Unit
          <input name="unit" value={formData.unit} onChange={handleChange} required />
        </label>
        <label>
          Cost
          <input name="cost" type="number" value={formData.cost} onChange={handleChange} required />
        </label>
        <label>
          Usage Date
          <input name="usageDate" type="date" value={formData.usageDate} onChange={handleChange} required />
        </label>
        <label>
          Field Location
          <input name="fieldLocation" value={formData.fieldLocation} onChange={handleChange} />
        </label>
        <label>
          Supplier
          <input name="supplier" value={formData.supplier} onChange={handleChange} />
        </label>
      </div>
      <label>
        Notes
        <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} />
      </label>
      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? 'Saving...' : 'Save Resource'}
      </button>
    </form>
  );
}

export default AddResourceForm;
