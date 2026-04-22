import api from './api';

export const createResource = async (payload) => {
  const response = await api.post('/resources', payload);
  return response.data;
};

export const getMyResources = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/resources/my${query ? `?${query}` : ''}`);
  return response.data;
};

export const getResourceById = async (resourceId) => {
  const response = await api.get(`/resources/${resourceId}`);
  return response.data;
};

export const updateResource = async (resourceId, payload) => {
  const response = await api.put(`/resources/${resourceId}`, payload);
  return response.data;
};

export const deleteResource = async (resourceId) => {
  const response = await api.delete(`/resources/${resourceId}`);
  return response.data;
};

export const getAllResources = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/resources/admin/all${query ? `?${query}` : ''}`);
  return response.data;
};
