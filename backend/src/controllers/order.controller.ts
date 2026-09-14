import { codAvailableFor, commerce, shippingFor } from '../config/commerce.js';
import { Order, nextOrderNumber } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
import {
  mergeLines,
  releaseStock,
  reservationsFor,
  reserveStock,
  type StockRequest,
} from '../services/inventory.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { PlaceOrderInput } from '../validators/checkout.validator.js';

/** True for a MongoDB duplicate-key error, optionally on a particular field. */
function isDuplicateKeyError(error: unknown, field?: string): boolean {
  const candidate = error as { code?: number; keyPattern?: Record<string, unknown> };
  if (candidate?.code !== 11000) return false;
  return field ? Boolean(candidate.keyPattern && field in candidate.keyPattern) : true;
}

/**
 * Writes the order, allocating its number.
 *
 * Order numbers are read-then-written, so two checkouts in the same moment can
 * choose the same one. The unique index makes that a duplicate-key error rather
 * than two orders sharing a number, and the loser simply takes the next one.
 * A clash on the idempotency key is a different matter and is rethrown.
 */
async function createOrderWithNumber(payload: Record<string, unknown>) {
  const ATTEMPTS = 5;
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await Order.create({ ...payload, orderNumber: await nextOrderNumber() });
    } catch (error) {
      const retryable = isDuplicateKeyError(error, 'orderNumber') && attempt < ATTEMPTS;
      if (!retryable) throw error;
    }
  }
}

/**
 * POST /api/v1/orders
 *
 * The browser sends slugs, quantities and an address choice — nothing else is
 * trusted. Prices, availability, shipping and COD eligibility are all decided
 * here, then stock is reserved before the order is written.
 */
export const placeOrder = asyncHandler(async (req, res) => {
  // While the shop is pre-booking there is no way to take money, so checkout
  // is closed at the API as well as in the interface. A stale tab or a direct
  // call must not be able to create an order nobody can be charged for.
  if (commerce.isPrebook) {
    throw ApiError.badRequest(
      'We are taking pre-bookings rather than orders at the moment — pre-book and we will write to you before anything ships',
    );
  }

  const { items, addressId, address, paymentMethod, saveAddress, idempotencyKey } =
    req.body as PlaceOrderInput;

  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.unauthorized();

  // A retried submit returns the original order instead of charging twice.
  const existing = await Order.findOne({ user: user._id, idempotencyKey });
  if (existing) {
    res.status(200).json({
      success: true,
      message: 'Order already placed',
      data: { order: existing.toJSON() },
    });
    return;
  }

  // --- resolve the delivery address -------------------------------------
  let shippingAddress;
  if (addressId) {
    const saved = user.addresses.find((entry) => entry._id?.toString() === addressId);
    if (!saved) throw ApiError.notFound('That address is no longer in your address book');
    shippingAddress = {
      name: user.name,
      phone: saved.phone ?? user.phone,
      line1: saved.line1,
      line2: saved.line2,
      city: saved.city,
      state: saved.state,
      postalCode: saved.postalCode,
      country: saved.country,
    };
  } else if (address) {
    shippingAddress = address;
  } else {
    throw ApiError.badRequest('Choose a delivery address');
  }

  if (!shippingAddress.phone) {
    throw ApiError.badRequest('A phone number is required for delivery');
  }

  // --- re-price every line from the database -----------------------------
  // Repeated lines are merged first: the per-line cap is a cap per fragrance,
  // and a bag holding the same slug twice must be checked against stock once.
  const mergedItems = mergeLines(items);
  const overCap = mergedItems.find((item) => item.quantity > commerce.maxQuantityPerLine);
  if (overCap) {
    throw ApiError.badRequest(
      `You can order up to ${commerce.maxQuantityPerLine} of any one fragrance`,
    );
  }

  const products = await Product.find({ slug: { $in: mergedItems.map((item) => item.slug) } });
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const orderItems = mergedItems.map((item) => {
    const product = bySlug.get(item.slug);
    if (!product || product.status !== 'active') {
      throw ApiError.badRequest(`${item.slug} is no longer available`);
    }
    if (product.stock < item.quantity) {
      throw ApiError.conflict(
        product.stock === 0
          ? `${product.name} is out of stock`
          : `Only ${product.stock} left of ${product.name}`,
      );
    }
    return {
      product: product._id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      quantity: item.quantity,
      subtotal: product.price * item.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  // --- payment method rules ---------------------------------------------
  if (paymentMethod === 'cod') {
    if (!commerce.cod.enabled) throw ApiError.badRequest('Cash on delivery is unavailable');
    if (!codAvailableFor(total)) {
      throw ApiError.badRequest(
        `Cash on delivery is available on orders above ₹${commerce.cod.minOrderValue}`,
      );
    }
  } else {
    // Online payment arrives with the gateway integration.
    throw ApiError.badRequest('Online payment is not available yet — please choose cash on delivery');
  }

  // --- reserve stock, then write the order -------------------------------
  const reservations: StockRequest[] = orderItems.map((item) => ({
    productId: String(item.product),
    quantity: item.quantity,
    name: item.name,
  }));

  await reserveStock(reservations);

  let order;
  try {
    order = await createOrderWithNumber({
      idempotencyKey,
      user: user._id,
      customer: { name: user.name, email: user.email, phone: shippingAddress.phone },
      items: orderItems,
      amounts: { subtotal, shipping, discount: 0, total },
      shippingAddress,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod,
      timeline: [{ status: 'pending', note: 'Order placed', at: new Date() }],
      placedAt: new Date(),
    });
  } catch (error) {
    // The order failed to write — never keep the stock we took for it.
    await releaseStock(reservations);

    // Two submits of the same checkout raced. The other one won and holds the
    // stock; this one has just given its reservation back, so return that order
    // rather than an error.
    if (isDuplicateKeyError(error, 'idempotencyKey')) {
      const winner = await Order.findOne({ user: user._id, idempotencyKey });
      if (winner) {
        res.status(200).json({
          success: true,
          message: 'Order already placed',
          data: { order: winner.toJSON() },
        });
        return;
      }
    }
    throw error;
  }

  // Past this point the order exists and owns its stock. A failure while
  // saving the address book must not roll the reservation back.
  if (saveAddress && address) {
    try {
      user.addresses.push({
        ...address,
        isDefault: user.addresses.length === 0,
      });
      await user.save();
    } catch {
      // Keeping the address is a convenience, never a reason to fail an order.
    }
  }

  res.status(201).json({
    success: true,
    message: 'Order placed',
    data: { order: order.toJSON() },
  });
});

/** GET /api/v1/orders — the signed-in customer's own orders. */
export const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user!.id }).sort({ placedAt: -1 });
  res.status(200).json({
    success: true,
    data: { orders: orders.map((order) => order.toJSON()) },
  });
});

/** GET /api/v1/orders/:orderNumber */
export const getMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    orderNumber: req.params.orderNumber.toUpperCase(),
    user: req.user!.id,
  });
  if (!order) throw ApiError.notFound('Order not found');

  res.status(200).json({ success: true, data: { order: order.toJSON() } });
});

/** PATCH /api/v1/orders/:orderNumber/cancel — allowed until the parcel ships. */
export const cancelMyOrder = asyncHandler(async (req, res) => {
  const orderNumber = req.params.orderNumber.toUpperCase();

  // Cancelling and claiming the stock are one update. A second cancel — a
  // double-clicked button, or the admin cancelling the same order at the same
  // moment — finds nothing to match and so cannot release the units twice.
  const order = await Order.findOneAndUpdate(
    {
      orderNumber,
      user: req.user!.id,
      status: { $in: ['pending', 'confirmed'] },
      // $ne rather than false: orders written before this field existed do
      // not carry it, and they still hold their reservation.
      stockReleased: { $ne: true },
    },
    {
      $set: { status: 'cancelled', stockReleased: true },
      $push: { timeline: { status: 'cancelled', note: 'Cancelled by customer', at: new Date() } },
    },
    { new: true },
  );

  if (!order) {
    // Nothing was cancelled: say why, without leaking other customers' orders.
    const existing = await Order.findOne({ orderNumber, user: req.user!.id });
    if (!existing) throw ApiError.notFound('Order not found');
    throw ApiError.badRequest(
      `An order that is already ${existing.status} cannot be cancelled here`,
    );
  }

  await releaseStock(reservationsFor(order));

  res.status(200).json({
    success: true,
    message: 'Order cancelled',
    data: { order: order.toJSON() },
  });
});
