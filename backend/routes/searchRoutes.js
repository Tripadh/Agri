import { Router } from 'express';
import {
  globalSearch,
  searchOnlyActivities,
  searchOnlyCrops,
  searchOnlyResources,
  searchOnlyUsers,
} from '../controllers/searchController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, allowRoles('user', 'admin'));

router.get('/', globalSearch);
router.get('/crops', searchOnlyCrops);
router.get('/resources', searchOnlyResources);
router.get('/activities', searchOnlyActivities);
router.get('/users', searchOnlyUsers);

export default router;
