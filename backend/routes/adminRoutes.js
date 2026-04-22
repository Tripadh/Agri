import { Router } from 'express';
import {
  deleteUser,
  getAdminStats,
  getAllUsers,
  getUserById,
  updateUserRole,
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowAdmin } from '../middleware/roleMiddleware.js';

const router = Router();

router.use(authMiddleware, allowAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
