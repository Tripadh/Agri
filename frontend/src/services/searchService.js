import api from './api';

export const globalSearch = async (query) => {
  const response = await api.get('/search', { params: { query } });
  return response.data;
};

export const searchCrops = async (query) => {
  const response = await api.get('/search/crops', { params: { query } });
  return response.data;
};

export const searchResources = async (query) => {
  const response = await api.get('/search/resources', { params: { query } });
  return response.data;
};

export const searchActivities = async (query) => {
  const response = await api.get('/search/activities', { params: { query } });
  return response.data;
};

export const searchUsers = async (query) => {
  const response = await api.get('/search/users', { params: { query } });
  return response.data;
};
