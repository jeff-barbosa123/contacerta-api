import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import * as pedidosController from '../controllers/pedidosController.js';

const router = Router();

/**
 * Rotas de Pedidos
 * Filtros disponíveis:
 * ?cliente=&dataInicio=&dataFim=&status=&page=&limit=
 */
router.get('/', authMiddleware, pedidosController.listarComFiltros);
router.post('/', authMiddleware, pedidosController.criar);
router.get('/:id', authMiddleware, pedidosController.obterPorId);

export default router;