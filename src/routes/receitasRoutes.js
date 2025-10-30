import express from 'express';
import * as controller from '../controllers/receitasController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(auth);

router.get('/:produto_id', controller.obterPorProduto);
router.put('/:produto_id', controller.salvar);
router.delete('/:produto_id', controller.remover);

export default router;

