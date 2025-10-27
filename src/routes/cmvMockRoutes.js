import express from 'express';
import { getCMVMock } from '../controllers/cmvMockController.js';
const router = express.Router();
router.get('/', getCMVMock);
export default router;