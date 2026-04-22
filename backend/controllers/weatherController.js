import Weather from '../models/Weather.js';
import { buildRecommendation, fetchCurrentWeather, fetchForecast } from '../services/weatherService.js';

const isAdmin = (req) => req.user?.role === 'admin';

const getCity = (req) => (req.query.city || '').trim();

const storeWeatherHistory = async (userId, weatherData) => {
  try {
    await Weather.create({
      userId,
      city: weatherData.city,
      temperature: weatherData.temperature,
      condition: weatherData.weatherCondition,
      searchedAt: new Date(),
    });
  } catch {
    // Non-blocking cache/history write. Weather response should still succeed.
  }
};

export const getCurrentWeather = async (req, res) => {
  try {
    const city = getCity(req);

    if (!city) {
      return res.status(400).json({ message: 'City is required' });
    }

    const weather = await fetchCurrentWeather(city);
    await storeWeatherHistory(req.user.userId, weather);

    return res.status(200).json({ weather });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Failed to fetch current weather' });
  }
};

export const getWeatherForecast = async (req, res) => {
  try {
    const city = getCity(req);

    if (!city) {
      return res.status(400).json({ message: 'City is required' });
    }

    const forecast = await fetchForecast(city);
    return res.status(200).json({ city, forecast });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Failed to fetch weather forecast' });
  }
};

export const getWeatherRecommendations = async (req, res) => {
  try {
    const city = getCity(req);

    if (!city) {
      return res.status(400).json({ message: 'City is required' });
    }

    const currentWeather = await fetchCurrentWeather(city);
    const forecast = await fetchForecast(city);
    const recommendations = buildRecommendation(currentWeather, forecast);

    return res.status(200).json({
      city,
      currentWeather,
      forecast,
      recommendations,
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || 'Failed to generate recommendations' });
  }
};

export const getWeatherHistory = async (req, res) => {
  try {
    const history = await Weather.find()
      .populate('userId', 'name email role')
      .sort({ searchedAt: -1, createdAt: -1 });

    return res.status(200).json({ history });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch weather history' });
  }
};

export const deleteWeatherHistory = async (req, res) => {
  try {
    const entry = await Weather.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ message: 'Weather history entry not found' });
    }

    if (!isAdmin(req)) {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }

    await Weather.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Weather history deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete weather history entry' });
  }
};
