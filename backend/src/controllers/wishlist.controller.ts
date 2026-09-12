import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** GET /api/v1/users/me/wishlist */
export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user!.id).populate({
    path: 'wishlist',
    // An archived product should drop out of the list rather than 404 later.
    match: { status: 'active' },
  });
  if (!user) throw ApiError.unauthorized();

  const products = (user.wishlist as unknown as { toJSON(): unknown }[]).map((product) =>
    product.toJSON(),
  );

  res.status(200).json({ success: true, data: { products, count: products.length } });
});

/** POST /api/v1/users/me/wishlist — body { slug } */
export const addToWishlist = asyncHandler(async (req, res) => {
  const { slug } = req.body as { slug: string };

  const product = await Product.findOne({ slug, status: 'active' }).select('_id');
  if (!product) throw ApiError.notFound('Product not found');

  // $addToSet keeps a double-click from storing the same product twice.
  await User.updateOne({ _id: req.user!.id }, { $addToSet: { wishlist: product._id } });

  const user = await User.findById(req.user!.id).select('wishlist');
  res.status(200).json({
    success: true,
    message: 'Saved to your wishlist',
    data: { count: user?.wishlist.length ?? 0, slugs: await wishlistSlugs(req.user!.id) },
  });
});

/** DELETE /api/v1/users/me/wishlist/:slug */
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).select('_id');
  if (!product) throw ApiError.notFound('Product not found');

  await User.updateOne({ _id: req.user!.id }, { $pull: { wishlist: product._id } });

  const user = await User.findById(req.user!.id).select('wishlist');
  res.status(200).json({
    success: true,
    message: 'Removed from your wishlist',
    data: { count: user?.wishlist.length ?? 0, slugs: await wishlistSlugs(req.user!.id) },
  });
});

/** Slugs are what the storefront compares against to fill in the hearts. */
async function wishlistSlugs(userId: string): Promise<string[]> {
  const user = await User.findById(userId).populate({ path: 'wishlist', select: 'slug' });
  return (user?.wishlist as unknown as { slug: string }[] | undefined)?.map((p) => p.slug) ?? [];
}
