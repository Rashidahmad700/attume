import mongoose, { Schema, Types } from 'mongoose';

export const PREBOOKING_STATUSES = ['new', 'contacted', 'converted', 'cancelled'] as const;
export type PrebookingStatus = (typeof PREBOOKING_STATUSES)[number];

/** Where the interest was captured, so follow-up can be written accordingly. */
export const PREBOOKING_SOURCES = ['product', 'restock', 'gifting', 'attar', 'newsletter'] as const;
export type PrebookingSource = (typeof PREBOOKING_SOURCES)[number];

export interface IPrebooking {
  name: string;
  email: string;
  phone?: string;
  /** Absent for list sign-ups that are not about one fragrance. */
  product?: Types.ObjectId;
  productSlug?: string;
  productName?: string;
  quantity: number;
  city?: string;
  note?: string;
  source: PrebookingSource;
  status: PrebookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const prebookingSchema = new Schema<IPrebooking>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    // Snapshotted alongside the reference so the list still reads correctly if
    // a fragrance is renamed or archived before anyone follows it up.
    productSlug: { type: String, index: true },
    productName: { type: String },
    quantity: { type: Number, default: 1, min: 1, max: 5 },
    city: { type: String, trim: true, maxlength: 60 },
    note: { type: String, trim: true, maxlength: 500 },
    source: { type: String, enum: PREBOOKING_SOURCES, default: 'product', index: true },
    status: { type: String, enum: PREBOOKING_STATUSES, default: 'new', index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

/**
 * One row per person per fragrance. Someone who pre-books the same scent twice
 * is updating their request, not joining the queue again — and a reply-all to
 * the list should not reach anyone twice.
 */
prebookingSchema.index({ email: 1, productSlug: 1, source: 1 }, { unique: true });
prebookingSchema.index({ createdAt: -1 });

export const Prebooking =
  (mongoose.models.Prebooking as mongoose.Model<IPrebooking>) ??
  mongoose.model<IPrebooking>('Prebooking', prebookingSchema);
