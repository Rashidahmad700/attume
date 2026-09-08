import { codAvailableFor, commerce, shippingFor } from '../config/commerce.js';
import { Order, nextOrderNumber } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
import { reserveStock, type StockRequest } from '../services/inventory.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { PlaceOrderInput } from '../validators/checkout.validator.js';

/**
 * POST /api/v1/orders
 *
 * The browser sends slugs, quantities and an address choice — nothing else is
 * trusted. Prices, availability, shipping and COD eligibility are all decided
 * here, then stock is reserved before the order is written.
 */
export const placeOrder = asyncHandler(async (req, res) => {
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
  const products = await Product.find({ slug: { $in: items.map((item) => item.slug) } });
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const orderItems = items.map((item) => {
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

  try {
    const order = await Order.create({
      orderNumber: await nextOrderNumber(),
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

    // Convenience: keep a checkout-typed address for next time.
    if (saveAddress && address) {
      user.addresses.push({
        ...address,
        isDefault: user.addresses.length === 0,
      });
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Order placed',
      data: { order: order.toJSON() },
    });
  } catch (error) {
    // The order failed to write — never keep the stock we took for it.
    const { releaseStock } = await import('../services/inventory.service.js');
    await releaseStock(reservations);
    throw error;
  }
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
  const order = await Order.findOne({
    orderNumber: req.params.orderNumber.toUpperCase(),
    user: req.user!.id,
  });
  if (!order) throw ApiError.notFound('Order not found');

  if (!['pending', 'confirmed'].includes(order.status)) {
    throw ApiError.badRequest(`An order that is already ${order.status} cannot be cancelled here`);
  }

  const { releaseStock } = await import('../services/inventory.service.js');
  await releaseStock(
    order.items.map((item) => ({
      productId: String(item.product),
      quantity: item.quantity,
      name: item.name,
    })),
  );

  order.status = 'cancelled';
  order.timeline.push({ status: 'cancelled', note: 'Cancelled by customer', at: new Date() });
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled',
    data: { order: order.toJSON() },
  });
});
