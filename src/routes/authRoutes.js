import { Router } from 'express';
import { login } from '../controllers/authController.js';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Autentica o usuário e retorna um token JWT
 * @access Público
 */
router.post('/login', login);

export default router;