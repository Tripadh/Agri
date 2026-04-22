import { Router } from 'express';
import {
  deleteWeatherHistory,
  getCurrentWeather,
  getWeatherForecast,
  getWeatherHistory,
  getWeatherRecommendations,
} from '../controllers/weatherController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowAdmin, allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/current', authMiddleware, allowRoles('user', 'admin'), getCurrentWeather);
router.get('/forecast', authMiddleware, allowRoles('user', 'admin'), getWeatherForecast);
router.get('/recommendations', authMiddleware, allowRoles('user', 'admin'), getWeatherRecommendations);
router.get('/history', authMiddleware, allowAdmin, getWeatherHistory);
router.delete('/history/:id', authMiddleware, allowAdmin, deleteWeatherHistory);

export default router;
