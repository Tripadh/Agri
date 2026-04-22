import api from './api';

export const createActivity = async (payload) => {
  const response = await api.post('/activities', payload);
  return response.data;
};

export const getMyActivities = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/activities/my${query ? `?${query}` : ''}`);
  return response.data;
};

export const getActivityById = async (activityId) => {
  const response = await api.get(`/activities/${activityId}`);
  return response.data;
};

export const updateActivity = async (activityId, payload) => {
  const response = await api.put(`/activities/${activityId}`, payload);
  return response.data;
};

export const deleteActivity = async (activityId) => {
  const response = await api.delete(`/activities/${activityId}`);
  return response.data;
};

export const getAllActivities = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/activities/admin/all${query ? `?${query}` : ''}`);
  return response.data;
};
