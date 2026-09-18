import mongoose, { Schema, Types } from 'mongoose';

export const PREBOOKING_STATUSES = ['new', 'contacted', 'converted', 'cancelled'] as const;
export type PrebookingStatus = (typeof PREBOOKING_STATUSES)[number];

/** Where the interest was captured, so follow-up can be written accordingly. */
export const PREBOOKING_SOURCES = ['product', 'restock'] as const;
export type PrebookingSource = (typeof PREBOOKING_SOURCES)[number];

export interface IPrebooking {
  /** Set when the pre-booking was made by a signed-in customer. */
  user?: Types.ObjectId;
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
  /**
   * What actually reached someone. Recorded because notification is
   * best-effort: the pre-booking is saved first and a failed send is swallowed
   * so the customer never sees an error. Without this, a shop that stops
   * receiving alerts has nothing to look at — the only trace is a log line on
   * a host that does not keep logs for long.
   */
  notified?: {
    customerEmail: boolean;
    adminEmail: boolean;
    customerWhatsApp: boolean;
    adminWhatsApp: boolean;
    /** When delivery was last attempted, not when the row was created. */
    attemptedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const prebookingSchema = new Schema<IPrebooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
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
    notified: {
      type: new Schema(
        {
          customerEmail: { type: Boolean, default: false },
          adminEmail: { type: Boolean, default: false },
          customerWhatsApp: { type: Boolean, default: false },
          adminWhatsApp: { type: Boolean, default: false },
          attemptedAt: { type: Date, required: true },
        },
        { _id: false },
      ),
      // Absent on rows written before this field existed, which is itself
      // information — those are the ones that cannot be accounted for.
      required: false,
    },
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
