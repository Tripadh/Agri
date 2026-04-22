import { Router } from 'express';
import {
  createResource,
  deleteResource,
  getAllResourcesForAdmin,
  getMyResources,
  getResourceById,
  updateResource,
} from '../controllers/resourceController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/', authMiddleware, allowRoles('user', 'admin'), createResource);
router.get('/my', authMiddleware, allowRoles('user', 'admin'), getMyResources);
router.get('/admin/all', authMiddleware, allowRoles('admin'), getAllResourcesForAdmin);
router.get('/:id', authMiddleware, allowRoles('user', 'admin'), getResourceById);
router.put('/:id', authMiddleware, allowRoles('user', 'admin'), updateResource);
router.delete('/:id', authMiddleware, allowRoles('user', 'admin'), deleteResource);

export default router;
