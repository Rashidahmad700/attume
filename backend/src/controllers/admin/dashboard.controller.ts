import { Order } from '../../models/order.model.js';
import { Product } from '../../models/product.model.js';
import { User } from '../../models/user.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);

/** GET /api/v1/admin/dashboard — the numbers the storefront owner checks daily. */
export const getDashboard = asyncHandler(async (_req, res) => {
  const [
    totalOrders,
    ordersToday,
    ordersThisWeek,
    ordersByStatus,
    revenueAgg,
    revenueThisMonthAgg,
    totalProducts,
    activeProducts,
    outOfStock,
    lowStock,
    totalCustomers,
    newCustomersThisWeek,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ placedAt: { $gte: startOfToday() } }),
    Order.countDocuments({ placedAt: { $gte: daysAgo(7) } }),
    Order.aggregate<{ _id: string; count: number }>([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    // Revenue counts paid money only, never pending COD.
    Order.aggregate<{ total: number }>([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amounts.total' } } },
    ]),
    Order.aggregate<{ total: number }>([
      { $match: { paymentStatus: 'paid', placedAt: { $gte: daysAgo(30) } } },
      { $group: { _id: null, total: { $sum: '$amounts.total' } } },
    ]),
    Product.countDocuments(),
    Product.countDocuments({ status: 'active' }),
    Product.countDocuments({ stock: 0 }),
    Product.countDocuments({
      $expr: { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$lowStockThreshold'] }] },
    }),
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({ role: 'customer', createdAt: { $gte: daysAgo(7) } }),
    Order.find().sort({ placedAt: -1 }).limit(6),
    Product.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } })
      .sort({ stock: 1 })
      .limit(6),
  ]);

  const statusCounts = Object.fromEntries(ordersByStatus.map((row) => [row._id, row.count]));

  res.status(200).json({
    success: true,
    data: {
      orders: {
        total: totalOrders,
        today: ordersToday,
        thisWeek: ordersThisWeek,
        pending: statusCounts.pending ?? 0,
        confirmed: statusCounts.confirmed ?? 0,
        packed: statusCounts.packed ?? 0,
        shipped: statusCounts.shipped ?? 0,
        delivered: statusCounts.delivered ?? 0,
        cancelled: statusCounts.cancelled ?? 0,
        returned: statusCounts.returned ?? 0,
      },
      revenue: {
        allTime: revenueAgg[0]?.total ?? 0,
        last30Days: revenueThisMonthAgg[0]?.total ?? 0,
      },
      catalogue: {
        total: totalProducts,
        active: activeProducts,
        outOfStock,
        lowStock,
      },
      customers: {
        total: totalCustomers,
        newThisWeek: newCustomersThisWeek,
      },
      recentOrders: recentOrders.map((order) => order.toJSON()),
      lowStockProducts: lowStockProducts.map((product) => product.toJSON()),
    },
  });
});
