import { codAvailableFor, commerce, shippingFor } from '../config/commerce.js';
import { Product } from '../models/product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

interface CartLineInput {
  slug: string;
  quantity: number;
}

/**
 * POST /api/v1/cart/validate
 *
 * The browser keeps the cart, but never the prices. This endpoint re-prices
 * every line from the database, clamps quantities to what is actually in
 * stock, and returns the authoritative totals the cart page renders.
 */
export const validateCart = asyncHandler(async (req, res) => {
  const input = (req.body.items ?? []) as CartLineInput[];

  const slugs = input.map((line) => line.slug);
  const products = await Product.find({ slug: { $in: slugs } });
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const lines = input.map((line) => {
    const product = bySlug.get(line.slug);

    if (!product || product.status !== 'active') {
      return {
        slug: line.slug,
        quantity: line.quantity,
        available: false,
        reason: 'This fragrance is no longer available',
      };
    }

    const requested = Math.max(1, Math.min(line.quantity, commerce.maxQuantityPerLine));
    const quantity = Math.min(requested, product.stock);
    const adjusted = quantity !== line.quantity;

    return {
      id: product.id as string,
      slug: product.slug,
      name: product.name,
      tagline: product.tagline,
      sku: product.sku,
      sizeMl: product.sizeMl,
      concentration: product.concentration,
      image: product.images[0]?.url,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      quantity,
      requestedQuantity: line.quantity,
      subtotal: product.price * quantity,
      stock: product.stock,
      available: product.stock > 0,
      adjusted,
      reason:
        product.stock === 0
          ? 'Out of stock'
          : adjusted
            ? `Only ${product.stock} left — quantity reduced`
            : undefined,
    };
  });

  const purchasable = lines.filter((line) => line.available && (line.quantity ?? 0) > 0);
  const subtotal = purchasable.reduce((sum, line) => sum + (line.subtotal ?? 0), 0);
  const shipping = shippingFor(subtotal);

  res.status(200).json({
    success: true,
    data: {
      lines,
      amounts: {
        subtotal,
        shipping,
        discount: 0,
        total: subtotal + shipping,
      },
      itemCount: purchasable.reduce((sum, line) => sum + (line.quantity ?? 0), 0),
      freeShippingThreshold: commerce.freeShippingThreshold,
      amountToFreeShipping: Math.max(0, commerce.freeShippingThreshold - subtotal),
      maxQuantityPerLine: commerce.maxQuantityPerLine,
      payment: {
        codAvailable: codAvailableFor(subtotal + shipping),
        codMinOrderValue: commerce.cod.minOrderValue,
      },
    },
  });
});
