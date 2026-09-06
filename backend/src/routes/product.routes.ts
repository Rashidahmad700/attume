import { Router } from 'express';
import { getPublicProduct, listPublicProducts } from '../controllers/product.controller.js';

const router = Router();

router.get('/', listPublicProducts);
router.get('/:slug', getPublicProduct);

export default router;
