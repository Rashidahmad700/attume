import { containsFilter } from '../../utils/escapeRegex.js';
import type { FilterQuery } from 'mongoose';
import { Order } from '../../models/order.model.js';
import { User, type IUser } from '../../models/user.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

/** GET /api/v1/admin/customers — read-only list with order counts. */
export const listCustomers = asyncHandler(async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

  const filter: FilterQuery<IUser> = { role: 'customer' };
  if (search) {
    filter.$or = [
      { name: containsFilter(search) },
      { email: containsFilter(search) },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  const orderCounts = await Order.aggregate<{ _id: string; count: number; spent: number }>([
    { $match: { user: { $in: users.map((user) => user._id) } } },
    { $group: { _id: '$user', count: { $sum: 1 }, spent: { $sum: '$amounts.total' } } },
  ]);
  const byUser = new Map(orderCounts.map((row) => [String(row._id), row]));

  res.status(200).json({
    success: true,
    data: {
      customers: users.map((user) => {
        const stats = byUser.get(user.id as string);
        return { ...user.toJSON(), orderCount: stats?.count ?? 0, totalSpent: stats?.spent ?? 0 };
      }),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    },
  });
});
