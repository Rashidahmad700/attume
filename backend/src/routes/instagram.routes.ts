import { Router } from 'express';
import { getInstagramFeed } from '../services/instagram.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/feed',
  asyncHandler(async (req, res) => {
    const limit = Math.min(12, Math.max(1, Number(req.query.limit) || 6));
    const feed = await getInstagramFeed(limit);
    res.status(200).json({ success: true, data: feed });
  }),
);

export default router;
