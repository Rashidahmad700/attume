import type { FilterQuery } from 'mongoose';
import { Order, type IOrder, type OrderStatus, type PaymentStatus } from '../../models/order.model.js';
import { Product } from '../../models/product.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import type { OrderQueryInput } from '../../validators/order.validator.js';

/** Forward-only status flow; cancelling is allowed until the parcel ships. */
const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  returned: [],
};

/** GET /api/v1/admin/orders */
export const listOrders = asyncHandler(async (req, res) => {
  const { search, status, paymentStatus, page, limit } = req.query as unknown as OrderQueryInput;

  const filter: FilterQuery<IOrder> = {};
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'customer.email': { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ placedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: {
      orders: orders.map((order) => order.toJSON()),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    },
  });
});

/** GET /api/v1/admin/orders/:id */
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  res.status(200).json({ success: true, data: { order: order.toJSON() } });
});

/** PATCH /api/v1/admin/orders/:id/status */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body as { status: OrderStatus; note?: string };
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  if (order.status === status) throw ApiError.badRequest(`Order is already ${status}`);
  if (!allowedTransitions[order.status].includes(status)) {
    throw ApiError.badRequest(
      `Cannot move an order from ${order.status} to ${status}. Allowed: ${
        allowedTransitions[order.status].join(', ') || 'none'
      }`,
    );
  }

  // Cancelling before dispatch returns the reserved units to the catalogue.
  if (status === 'cancelled') {
    await Promise.all(
      order.items.map((item) =>
        Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }),
      ),
    );
  }

  order.status = status;
  order.timeline.push({ status, note, at: new Date() });
  await order.save();

  res.status(200).json({
    success: true,
    message: `Order marked ${status}`,
    data: { order: order.toJSON() },
  });
});

/** PATCH /api/v1/admin/orders/:id/payment */
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, note } = req.body as { paymentStatus: PaymentStatus; note?: string };
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');

  order.paymentStatus = paymentStatus;
  order.timeline.push({ status: paymentStatus, note, at: new Date() });
  await order.save();

  res.status(200).json({
    success: true,
    message: `Payment marked ${paymentStatus}`,
    data: { order: order.toJSON() },
  });
});
