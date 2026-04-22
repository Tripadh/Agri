import { Router } from 'express';
import {
  createCrop,
  deleteCrop,
  getAllCropsForAdmin,
  getCropById,
  getMyCrops,
  updateCrop,
} from '../controllers/cropController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';

const router = Router();

router.post('/', authMiddleware, allowRoles('user', 'admin'), createCrop);
router.get('/my', authMiddleware, allowRoles('user', 'admin'), getMyCrops);
router.get('/admin/all', authMiddleware, allowRoles('admin'), getAllCropsForAdmin);
router.get('/:id', authMiddleware, allowRoles('user', 'admin'), getCropById);
router.put('/:id', authMiddleware, allowRoles('user', 'admin'), updateCrop);
router.delete('/:id', authMiddleware, allowRoles('user', 'admin'), deleteCrop);

export default router;
