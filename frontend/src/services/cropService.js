import api from './api';

export const createCrop = async (payload) => {
  const response = await api.post('/crops', payload);
  return response.data;
};

export const getMyCrops = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/crops/my${query ? `?${query}` : ''}`);
  return response.data;
};

export const getCropById = async (cropId) => {
  const response = await api.get(`/crops/${cropId}`);
  return response.data;
};

export const updateCrop = async (cropId, payload) => {
  const response = await api.put(`/crops/${cropId}`, payload);
  return response.data;
};

export const deleteCrop = async (cropId) => {
  const response = await api.delete(`/crops/${cropId}`);
  return response.data;
};

export const getAllCrops = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/crops/admin/all${query ? `?${query}` : ''}`);
  return response.data;
};
