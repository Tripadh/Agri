import { Router } from 'express';
import {
  adminPasswordLogin,
  changeUserPassword,
  getUserProfile,
  loginUser,
  registerUser,
  updateUserProfile,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin-login', adminPasswordLogin);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);
router.put('/change-password', authMiddleware, changeUserPassword);

export default router;
