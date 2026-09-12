import { Router } from 'express';
import {
  getPublicProduct,
  listPublicProducts,
  listRelated,
  searchFacets,
  searchProducts,
} from '../controllers/product.controller.js';
import { createReview, listReviews } from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { publicApiLimiter, writeLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { reviewCreateSchema } from '../validators/review.validator.js';

const router = Router();

router.get('/', listPublicProducts);
// Both must be declared before '/:slug', or the slug route swallows them.
router.get('/search', publicApiLimiter, searchProducts);
router.get('/search/facets', searchFacets);
router.get('/:slug', getPublicProduct);
router.get('/:slug/related', listRelated);
router
  .route('/:slug/reviews')
  .get(listReviews)
  .post(writeLimiter, requireAuth, validate(reviewCreateSchema), createReview);

export default router;
