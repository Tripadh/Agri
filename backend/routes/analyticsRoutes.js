import { Router } from 'express';
import {
  getAdminOverview,
  getAdminSystemData,
  getAdminTopUsers,
  getAdminUsersGrowth,
  getUserActivitiesAnalytics,
  getUserCropsAnalytics,
  getUserOverview,
  getUserResourcesAnalytics,
} from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowAdmin, allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.get('/user/overview', authMiddleware, allowRoles('user', 'admin'), getUserOverview);
router.get('/user/crops', authMiddleware, allowRoles('user', 'admin'), getUserCropsAnalytics);
router.get('/user/resources', authMiddleware, allowRoles('user', 'admin'), getUserResourcesAnalytics);
router.get('/user/activities', authMiddleware, allowRoles('user', 'admin'), getUserActivitiesAnalytics);

router.get('/admin/overview', authMiddleware, allowAdmin, getAdminOverview);
router.get('/admin/users-growth', authMiddleware, allowAdmin, getAdminUsersGrowth);
router.get('/admin/system-data', authMiddleware, allowAdmin, getAdminSystemData);
router.get('/admin/top-users', authMiddleware, allowAdmin, getAdminTopUsers);

export default router;
