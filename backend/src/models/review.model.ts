import mongoose, { Schema, type HydratedDocument, type Model, type Types } from 'mongoose';

export interface IReview {
  product: Types.ObjectId;
  user: Types.ObjectId;
  authorName: string;
  rating: number;
  title?: string;
  body: string;
  /** Set when the reviewer has a delivered order containing this product. */
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewDocument = HydratedDocument<IReview>;
type ReviewModel = Model<IReview>;

const reviewSchema = new Schema<IReview, ReviewModel>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, minlength: 4, maxlength: 1500 },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.user;
        return ret;
      },
    },
  },
);

// One review per customer per product.
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const Review =
  (mongoose.models.Review as ReviewModel) ??
  mongoose.model<IReview, ReviewModel>('Review', reviewSchema);
