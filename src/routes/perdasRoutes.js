import express from 'express';
import * as controller from '../controllers/perdasController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(auth);

router.get('/', controller.listar);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.remover);

export default router;

