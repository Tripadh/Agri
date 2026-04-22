import { Router } from 'express';
import {
  createActivity,
  deleteActivity,
  getAllActivitiesForAdmin,
  getActivityById,
  getMyActivities,
  updateActivity,
} from '../controllers/activityController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/', authMiddleware, allowRoles('user', 'admin'), createActivity);
router.get('/my', authMiddleware, allowRoles('user', 'admin'), getMyActivities);
router.get('/admin/all', authMiddleware, allowRoles('admin'), getAllActivitiesForAdmin);
router.get('/:id', authMiddleware, allowRoles('user', 'admin'), getActivityById);
router.put('/:id', authMiddleware, allowRoles('user', 'admin'), updateActivity);
router.delete('/:id', authMiddleware, allowRoles('user', 'admin'), deleteActivity);

export default router;
