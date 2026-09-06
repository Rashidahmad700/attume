import type { FilterQuery } from 'mongoose';
import { Product, type IProduct } from '../../models/product.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type {
  ProductCreateInput,
  ProductQueryInput,
  ProductUpdateInput,
} from '../../validators/product.validator.js';

/** GET /api/v1/admin/products */
export const listProducts = asyncHandler(async (req, res) => {
  const { search, status, stock, page, limit } = req.query as unknown as ProductQueryInput;

  const filter: FilterQuery<IProduct> = {};
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }
  if (stock === 'out') filter.stock = 0;
  if (stock === 'in') filter.stock = { $gt: 0 };
  // "low" compares two fields, so it needs an expression rather than a plain filter.
  if (stock === 'low') {
    filter.$expr = { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockThreshold'] }] };
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      products: products.map((product) => product.toJSON()),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    },
  });
});

/** GET /api/v1/admin/products/:id */
export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  res.status(200).json({ success: true, data: { product: product.toJSON() } });
});

/** POST /api/v1/admin/products */
export const createProduct = asyncHandler(async (req, res) => {
  const payload = req.body as ProductCreateInput;

  const clash = await Product.findOne({ $or: [{ slug: payload.slug }, { sku: payload.sku }] }).lean();
  if (clash) throw ApiError.conflict('A product with this slug or SKU already exists');

  const product = await Product.create(payload);
  res.status(201).json({
    success: true,
    message: 'Product created',
    data: { product: product.toJSON() },
  });
});

/** PATCH /api/v1/admin/products/:id */
export const updateProduct = asyncHandler(async (req, res) => {
  const payload = req.body as ProductUpdateInput;
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  if (payload.slug || payload.sku) {
    const clash = await Product.findOne({
      _id: { $ne: product._id },
      $or: [
        ...(payload.slug ? [{ slug: payload.slug }] : []),
        ...(payload.sku ? [{ sku: payload.sku }] : []),
      ],
    }).lean();
    if (clash) throw ApiError.conflict('Another product already uses this slug or SKU');
  }

  Object.assign(product, payload);
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product updated',
    data: { product: product.toJSON() },
  });
});

/** PATCH /api/v1/admin/products/:id/stock — the out-of-stock switch. */
export const updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body as { stock: number };
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  product.stock = stock;
  await product.save();

  res.status(200).json({
    success: true,
    message: stock === 0 ? 'Marked out of stock' : `Stock set to ${stock}`,
    data: { product: product.toJSON() },
  });
});

/** DELETE /api/v1/admin/products/:id — archives rather than destroys. */
export const archiveProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  // Orders reference products, so a hard delete would orphan history.
  product.status = 'archived';
  product.isFeatured = false;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product archived',
    data: { product: product.toJSON() },
  });
});
