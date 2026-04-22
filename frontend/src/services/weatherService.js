import api from './api';

export const getCurrentWeather = async (city) => {
  const response = await api.get('/weather/current', { params: { city } });
  return response.data;
};

export const getWeatherForecast = async (city) => {
  const response = await api.get('/weather/forecast', { params: { city } });
  return response.data;
};

export const getWeatherRecommendations = async (city) => {
  const response = await api.get('/weather/recommendations', { params: { city } });
  return response.data;
};

export const getWeatherHistory = async () => {
  const response = await api.get('/weather/history');
  return response.data;
};

export const deleteWeatherHistory = async (historyId) => {
  const response = await api.delete(`/weather/history/${historyId}`);
  return response.data;
};
