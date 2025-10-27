import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import * as clientesController from '../controllers/clientesController.js';

const router = Router();

/**
 * Rotas de Clientes
 * Todas protegidas por JWT via authMiddleware
 */
router.get('/', authMiddleware, clientesController.listarComFiltros);
router.post('/', authMiddleware, clientesController.criar);
router.get('/:id', authMiddleware, clientesController.obterPorId);
router.put('/:id', authMiddleware, clientesController.atualizarCompleto);
router.patch('/:id', authMiddleware, clientesController.atualizarParcial);
router.delete('/:id', authMiddleware, clientesController.remover);

export default router;
