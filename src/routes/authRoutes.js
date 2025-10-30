import { Router } from 'express';
import { login, register, changePassword, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Autentica o usuário e retorna um token JWT
 * @access Público
 */
router.post('/login', login);
router.post('/register', register);
router.post('/change-password', authMiddleware, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
