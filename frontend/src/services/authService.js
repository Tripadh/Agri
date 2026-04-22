import api from './api';

export const registerUser = async (payload) => {
  const response = await api.post('/auth/register', payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await api.post('/auth/login', payload);
  return response.data;
};

export const adminLogin = async (payload) => {
  const response = await api.post('/auth/admin-login', payload);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (payload) => {
  const response = await api.put('/auth/profile', payload);
  return response.data;
};

export const changePassword = async (payload) => {
  const response = await api.put('/auth/change-password', payload);
  return response.data;
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export const getCurrentRole = () => getCurrentUser()?.role || 'user';
