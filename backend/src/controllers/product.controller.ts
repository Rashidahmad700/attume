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

/**
 * GET /api/v1/products/search?q=
 *
 * Matches the query against name, tagline, accords and every note layer, so
 * "citrus", "sandalwood" and "atolis" all find something. With no query it
 * returns the catalogue unfiltered, which is what the overlay shows on open.
 */
export const searchProducts = asyncHandler(async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 8));

  const filter: Record<string, unknown> = { status: 'active' };
  if (query) {
    const rx = { $regex: query, $options: 'i' };
    filter.$or = [
      { name: rx },
      { tagline: rx },
      { description: rx },
      { sku: rx },
      { 'accords.name': rx },
      { 'notes.top': rx },
      { 'notes.middle': rx },
      { 'notes.base': rx },
      { 'wear.seasons': rx },
      { concentration: rx },
    ];
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ isFeatured: -1, createdAt: -1 }).limit(limit),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      query,
      total,
      products: products.map((product) => product.toJSON()),
    },
  });
});

/**
 * GET /api/v1/products/search/facets
 * Suggestion terms for an empty search box, built from what is actually in
 * the catalogue rather than a hardcoded list that can drift out of date.
 */
export const searchFacets = asyncHandler(async (_req, res) => {
  const products = await Product.find({ status: 'active' }).select('accords wear notes name');

  const collect = (values: string[]) =>
    [...new Set(values.map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );

  res.status(200).json({
    success: true,
    data: {
      accords: collect(products.flatMap((p) => p.accords.map((a) => a.name.toLowerCase()))),
      notes: collect(
        products.flatMap((p) => [...p.notes.top, ...p.notes.middle, ...p.notes.base]),
      ).slice(0, 14),
      seasons: collect(products.flatMap((p) => p.wear.seasons)),
      fragrances: products.map((p) => p.name),
    },
  });
});
