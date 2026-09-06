import { Product } from '../models/product.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** GET /api/v1/products — active catalogue only; drafts stay private. */
export const listPublicProducts = asyncHandler(async (req, res) => {
  const featuredOnly = req.query.featured === 'true';

  const products = await Product.find({
    status: 'active',
    ...(featuredOnly ? { isFeatured: true } : {}),
  }).sort({ isFeatured: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { products: products.map((product) => product.toJSON()) },
  });
});

/** GET /api/v1/products/:slug */
export const getPublicProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: 'active' });
  if (!product) throw ApiError.notFound('Product not found');

  res.status(200).json({ success: true, data: { product: product.toJSON() } });
});
