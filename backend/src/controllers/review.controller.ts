import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { Review } from '../models/review.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Recomputes the denormalised rating summary stored on the product. */
async function refreshProductRating(productId: string) {
  const [summary] = await Review.aggregate<{ average: number; count: number }>([
    { $match: { product: new (await import('mongoose')).default.Types.ObjectId(productId) } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Product.updateOne(
    { _id: productId },
    {
      rating: {
        average: summary ? Math.round(summary.average * 10) / 10 : 0,
        count: summary?.count ?? 0,
      },
    },
  );
}

/** GET /api/v1/products/:slug/reviews */
export const listReviews = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).select('_id rating');
  if (!product) throw ApiError.notFound('Product not found');

  const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 }).limit(50);

  // Bar chart on the product page needs the per-star split.
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((review) => review.rating === stars).length,
  }));

  res.status(200).json({
    success: true,
    data: {
      reviews: reviews.map((review) => review.toJSON()),
      summary: { ...product.rating, distribution },
    },
  });
});

/** POST /api/v1/products/:slug/reviews — signed-in customers only. */
export const createReview = asyncHandler(async (req, res) => {
  const { rating, title, body } = req.body as { rating: number; title?: string; body: string };

  const product = await Product.findOne({ slug: req.params.slug }).select('_id');
  if (!product) throw ApiError.notFound('Product not found');

  const user = await User.findById(req.user!.id).select('name');
  if (!user) throw ApiError.unauthorized();

  const existing = await Review.findOne({ product: product._id, user: user._id });
  if (existing) throw ApiError.conflict('You have already reviewed this fragrance');

  // A review counts as verified when the customer has a delivered order for it.
  const delivered = await Order.exists({
    user: user._id,
    status: 'delivered',
    'items.product': product._id,
  });

  const review = await Review.create({
    product: product._id,
    user: user._id,
    authorName: user.name,
    rating,
    title,
    body,
    isVerifiedPurchase: Boolean(delivered),
  });

  await refreshProductRating(String(product._id));

  res.status(201).json({
    success: true,
    message: 'Thank you for your review',
    data: { review: review.toJSON() },
  });
});
