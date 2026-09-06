import mongoose, { Schema, type HydratedDocument, type Model } from 'mongoose';

export type ProductStatus = 'draft' | 'active' | 'archived';

export interface IProductImage {
  url: string;
  alt?: string;
}

export interface IProduct {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  notes: string[];
  concentration: string;
  sizeMl: number;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  isFeatured: boolean;
  badge?: string;
  images: IProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductVirtuals {
  inStock: boolean;
  isLowStock: boolean;
}

export type ProductDocument = HydratedDocument<IProduct, IProductVirtuals>;
type ProductModel = Model<IProduct, Record<string, never>, Record<string, never>, IProductVirtuals>;

const imageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true, trim: true },
    alt: { type: String, trim: true },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct, ProductModel, Record<string, never>, IProductVirtuals>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    tagline: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: '', trim: true, maxlength: 2000 },
    notes: { type: [String], default: [] },
    concentration: { type: String, default: 'Extrait de Parfum', trim: true },
    sizeMl: { type: Number, default: 50, min: 1 },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    // Single source of truth for availability — "out of stock" is stock === 0.
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft', index: true },
    isFeatured: { type: Boolean, default: false },
    badge: { type: String, trim: true, maxlength: 24 },
    images: { type: [imageSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

productSchema.virtual('inStock').get(function inStock(this: IProduct) {
  return this.status === 'active' && this.stock > 0;
});

productSchema.virtual('isLowStock').get(function isLowStock(this: IProduct) {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

export const Product =
  (mongoose.models.Product as ProductModel) ??
  mongoose.model<IProduct, ProductModel>('Product', productSchema);
