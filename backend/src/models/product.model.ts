import mongoose, { Schema, type HydratedDocument, type Model } from 'mongoose';

export type ProductStatus = 'draft' | 'active' | 'archived';

export interface IProductImage {
  url: string;
  alt?: string;
}

/** Accord strength drives the width of the bar on the product page. */
export interface IAccord {
  name: string;
  strength: number;
}

export interface INotePyramid {
  top: string[];
  middle: string[];
  base: string[];
}

export interface IProduct {
  name: string;
  slug: string;
  tagline: string;
  description: string;
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

  // --- fragrance profile ---
  accords: IAccord[];
  notes: INotePyramid;
  /** The well-known fragrance this composition sits closest to. */
  inspiredBy?: { name: string; house: string; closeness?: string };
  performance: { longevity: string; sillage: string; concentrationPct?: string };
  wear: { seasons: string[]; times: string[] };
  highlights: string[];

  // --- pack copy, mirrors the printed carton ---
  details: {
    ingredients: string;
    howToUse: string[];
    bestBefore: string;
    manufacturedBy: string;
    countryOfOrigin: string;
  };

  // --- denormalised review summary, kept in step by the Review model ---
  rating: { average: number; count: number };

  createdAt: Date;
  updatedAt: Date;
}

export interface IProductVirtuals {
  inStock: boolean;
  isLowStock: boolean;
  discountPercent: number;
}

export type ProductDocument = HydratedDocument<IProduct, IProductVirtuals>;
type ProductModel = Model<IProduct, Record<string, never>, Record<string, never>, IProductVirtuals>;

const imageSchema = new Schema<IProductImage>(
  { url: { type: String, required: true, trim: true }, alt: { type: String, trim: true } },
  { _id: false },
);

const accordSchema = new Schema<IAccord>(
  {
    name: { type: String, required: true, trim: true },
    strength: { type: Number, default: 70, min: 1, max: 100 },
  },
  { _id: false },
);

const productSchema = new Schema<IProduct, ProductModel, Record<string, never>, IProductVirtuals>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    tagline: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: '', trim: true, maxlength: 4000 },
    concentration: { type: String, default: 'Extrait de Parfum', trim: true },
    sizeMl: { type: Number, default: 50, min: 1 },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft', index: true },
    isFeatured: { type: Boolean, default: false },
    badge: { type: String, trim: true, maxlength: 24 },
    images: { type: [imageSchema], default: [] },

    accords: { type: [accordSchema], default: [] },
    notes: {
      top: { type: [String], default: [] },
      middle: { type: [String], default: [] },
      base: { type: [String], default: [] },
    },
    inspiredBy: {
      name: { type: String, trim: true },
      house: { type: String, trim: true },
      closeness: { type: String, trim: true },
    },
    performance: {
      longevity: { type: String, default: '6–8 hours' },
      sillage: { type: String, default: 'Moderate' },
      concentrationPct: { type: String },
    },
    wear: {
      seasons: { type: [String], default: [] },
      times: { type: [String], default: [] },
    },
    highlights: { type: [String], default: [] },

    details: {
      ingredients: { type: String, default: 'Denatured Alcohol, Fragrance, Fixatives.' },
      howToUse: {
        type: [String],
        default: [
          'Spray lightly onto clothing or fabric from a distance of 15–20 cm.',
          'Let it dry naturally.',
          'Press against pulse points for a longer-lasting trail.',
        ],
      },
      bestBefore: { type: String, default: '36 months from the date of manufacturing' },
      manufacturedBy: {
        type: String,
        default: 'attume · D-2, H-758/A, Samsul Road, Jaipur, Badarpur, New Delhi 110044',
      },
      countryOfOrigin: { type: String, default: 'India' },
    },

    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
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

productSchema.virtual('discountPercent').get(function discountPercent(this: IProduct) {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

export const Product =
  (mongoose.models.Product as ProductModel) ??
  mongoose.model<IProduct, ProductModel>('Product', productSchema);
