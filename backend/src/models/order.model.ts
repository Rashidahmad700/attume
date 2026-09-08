import mongoose, { Schema, type HydratedDocument, type Model, type Types } from 'mongoose';

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ['pending', 'paid', 'refunded', 'failed'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  slug: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface IOrderAddress {
  name: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrderEvent {
  status: OrderStatus | PaymentStatus;
  note?: string;
  at: Date;
}

export interface IOrder {
  orderNumber: string;
  /** Client-generated per checkout attempt; a retry returns the first order. */
  idempotencyKey?: string;
  user?: Types.ObjectId;
  customer: { name: string; email: string; phone?: string };
  items: IOrderItem[];
  amounts: { subtotal: number; shipping: number; discount: number; total: number };
  shippingAddress: IOrderAddress;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'cod' | 'online';
  timeline: IOrderEvent[];
  placedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDocument = HydratedDocument<IOrder>;
type OrderModel = Model<IOrder>;

const itemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    // Snapshots — an order must not change when the catalogue does.
    name: { type: String, required: true },
    slug: { type: String, required: true },
    sku: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const addressSchema = new Schema<IOrderAddress>(
  {
    name: { type: String, required: true },
    phone: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder, OrderModel>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    idempotencyKey: { type: String, index: true, sparse: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true, index: true },
      phone: String,
    },
    items: { type: [itemSchema], required: true },
    amounts: {
      subtotal: { type: Number, required: true, min: 0 },
      shipping: { type: Number, default: 0, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    shippingAddress: { type: addressSchema, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending', index: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'pending', index: true },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    timeline: {
      type: [
        new Schema<IOrderEvent>(
          {
            status: { type: String, required: true },
            note: String,
            at: { type: Date, default: Date.now },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    placedAt: { type: Date, default: Date.now, index: true },
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

/** ATT-YYYYMM-0001, sequential within the month. */
export async function nextOrderNumber(): Promise<string> {
  const now = new Date();
  const prefix = `ATT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const last = await Order.findOne({ orderNumber: new RegExp(`^${prefix}`) })
    .sort({ orderNumber: -1 })
    .select('orderNumber')
    .lean();
  const sequence = last ? Number(last.orderNumber.split('-')[2]) + 1 : 1;
  return `${prefix}-${String(sequence).padStart(4, '0')}`;
}

export const Order =
  (mongoose.models.Order as OrderModel) ?? mongoose.model<IOrder, OrderModel>('Order', orderSchema);
