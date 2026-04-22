import { useEffect, useState } from 'react';
import { deleteCrop, getAllCrops, updateCrop } from '../services/cropService';
import './Forms.css';
import './ManageCrops.css';

function ManageCrops() {
  const [crops, setCrops] = useState([]);

  const loadCrops = async () => {
    const data = await getAllCrops();
    setCrops(data.crops || []);
  };

  useEffect(() => {
    loadCrops();
  }, []);

  const handleQuickUpdate = async (crop) => {
    const nextStage = prompt('Enter new stage', crop.stage);
    if (!nextStage) return;
    await updateCrop(crop._id, { stage: nextStage });
    await loadCrops();
  };

  const handleDelete = async (cropId) => {
    if (!window.confirm('Delete this crop?')) return;
    await deleteCrop(cropId);
    await loadCrops();
  };

  return (
    <section className="card manage-users-shell">
      <h1>Manage Crops</h1>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Crop Name</th>
              <th>Owner</th>
              <th>Type</th>
              <th>Stage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {crops.map((crop) => (
              <tr key={crop._id}>
                <td>{crop.name}</td>
                <td>{crop.createdBy?.name || 'Unknown'}</td>
                <td>{crop.type}</td>
                <td>{crop.stage}</td>
                <td className="actions-cell">
                  <button type="button" className="link-btn" onClick={() => handleQuickUpdate(crop)}>Edit</button>
                  <button type="button" className="danger-btn" onClick={() => handleDelete(crop._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ManageCrops;
