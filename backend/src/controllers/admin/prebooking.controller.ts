import type { FilterQuery } from 'mongoose';
import { Prebooking, type IPrebooking } from '../../models/prebooking.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { containsFilter } from '../../utils/escapeRegex.js';
import type { PrebookingQueryInput } from '../../validators/prebooking.validator.js';

/** GET /api/v1/admin/prebookings */
export const listPrebookings = asyncHandler(async (req, res) => {
  const { search, status, source, slug, page, limit } =
    req.query as unknown as PrebookingQueryInput;

  const filter: FilterQuery<IPrebooking> = {};
  if (status) filter.status = status;
  if (source) filter.source = source;
  if (slug) filter.productSlug = slug;
  if (search) {
    filter.$or = [
      { name: containsFilter(search) },
      { email: containsFilter(search) },
      { phone: containsFilter(search) },
      { city: containsFilter(search) },
    ];
  }

  const [prebookings, total, byStatus] = await Promise.all([
    Prebooking.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Prebooking.countDocuments(filter),
    Prebooking.aggregate<{ _id: string; count: number }>([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      prebookings: prebookings.map((entry) => entry.toJSON()),
      counts: Object.fromEntries(byStatus.map((row) => [row._id, row.count])),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    },
  });
});

/** PATCH /api/v1/admin/prebookings/:id — move one through the follow-up flow. */
export const updatePrebookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body as { status: IPrebooking['status'] };

  const prebooking = await Prebooking.findByIdAndUpdate(
    req.params.id,
    { $set: { status } },
    { new: true, runValidators: true },
  );
  if (!prebooking) throw ApiError.notFound('Pre-booking not found');

  res.status(200).json({
    success: true,
    message: `Marked ${status}`,
    data: { prebooking: prebooking.toJSON() },
  });
});

/**
 * GET /api/v1/admin/prebookings/export — the whole list as CSV.
 *
 * The point of a pre-book list is to mail it the day stock lands, and that
 * happens in whatever tool sends the mail, not in here.
 */
export const exportPrebookings = asyncHandler(async (req, res) => {
  const { status, source, slug } = req.query as unknown as PrebookingQueryInput;

  const filter: FilterQuery<IPrebooking> = {};
  if (status) filter.status = status;
  if (source) filter.source = source;
  if (slug) filter.productSlug = slug;

  const rows = await Prebooking.find(filter).sort({ createdAt: -1 }).lean();

  // Quoted and doubled, so a comma or quote in a name cannot shift a column.
  const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const header = ['Date', 'Name', 'Email', 'Phone', 'Fragrance', 'Quantity', 'City', 'Note', 'Source', 'Status'];
  const csv = [
    header.join(','),
    ...rows.map((row) =>
      [
        new Date(row.createdAt).toISOString().slice(0, 10),
        row.name,
        row.email,
        row.phone,
        row.productName,
        row.quantity,
        row.city,
        row.note,
        row.source,
        row.status,
      ]
        .map(escape)
        .join(','),
    ),
  ].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="attume-prebookings-${new Date().toISOString().slice(0, 10)}.csv"`,
  );
  res.status(200).send(csv);
});
