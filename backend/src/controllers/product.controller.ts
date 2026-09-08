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

/**
 * GET /api/v1/products/:slug/related
 * Ranks by shared accords first, so "you may also like" reflects how the
 * fragrance actually smells rather than an arbitrary ordering.
 */
export const listRelated = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, status: 'active' });
  if (!product) throw ApiError.notFound('Product not found');

  const others = await Product.find({ status: 'active', _id: { $ne: product._id } });
  const accords = new Set(product.accords.map((accord) => accord.name.toLowerCase()));

  const ranked = others
    .map((candidate) => ({
      product: candidate,
      score: candidate.accords.filter((accord) => accords.has(accord.name.toLowerCase())).length,
    }))
    .sort((a, b) => b.score - a.score || Number(b.product.isFeatured) - Number(a.product.isFeatured))
    .slice(0, 4)
    .map((entry) => entry.product.toJSON());

  res.status(200).json({ success: true, data: { products: ranked } });
});
