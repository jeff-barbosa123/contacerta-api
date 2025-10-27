import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import * as relatoriosController from '../controllers/relatoriosController.js';

const router = Router();

/**
 * Rotas de Relatórios
 */
router.get('/cmv', authMiddleware, relatoriosController.cmv);
router.get('/rendimento', authMiddleware, relatoriosController.rendimento);
router.get('/estoque-baixo', authMiddleware, relatoriosController.estoqueBaixo);
router.get('/clientes-fieis', authMiddleware, relatoriosController.clientesFieis);

export default router;