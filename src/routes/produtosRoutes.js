import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import * as produtosController from '../controllers/produtosController.js';

const router = Router();

/**
 * Rotas de Produtos
 * Todas as rotas são protegidas por JWT via authMiddleware
 */
router.get('/', authMiddleware, produtosController.listarComFiltros);
router.post('/', authMiddleware, produtosController.criar);
router.get('/:id', authMiddleware, produtosController.obterPorId);
router.put('/:id', authMiddleware, produtosController.atualizarCompleto);
router.patch('/:id', authMiddleware, produtosController.atualizarParcial);
router.delete('/:id', authMiddleware, produtosController.remover);

export default router;