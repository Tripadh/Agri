import api from './api';

export const getUserOverviewAnalytics = async () => {
  const response = await api.get('/analytics/user/overview');
  return response.data;
};

export const getUserCropsAnalytics = async () => {
  const response = await api.get('/analytics/user/crops');
  return response.data;
};

export const getUserResourcesAnalytics = async () => {
  const response = await api.get('/analytics/user/resources');
  return response.data;
};

export const getUserActivitiesAnalytics = async () => {
  const response = await api.get('/analytics/user/activities');
  return response.data;
};

export const getAdminOverviewAnalytics = async () => {
  const response = await api.get('/analytics/admin/overview');
  return response.data;
};

export const getAdminUsersGrowthAnalytics = async () => {
  const response = await api.get('/analytics/admin/users-growth');
  return response.data;
};

export const getAdminSystemDataAnalytics = async () => {
  const response = await api.get('/analytics/admin/system-data');
  return response.data;
};

export const getAdminTopUsersAnalytics = async () => {
  const response = await api.get('/analytics/admin/top-users');
  return response.data;
};
