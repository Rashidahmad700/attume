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
  /** Snapshotted like the rest, so a confirmation email keeps the picture the
   *  customer actually bought from even if the catalogue is re-shot. */
  image?: string;
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

/** A refund raised against the payment, as the gateway reported it. */
export interface IOrderRefund {
  refundId: string;
  /** Paise, matching how the gateway counts. */
  amount: number;
  reason?: string;
  at: Date;
}

/**
 * The gateway side of an online order.
 *
 * Kept whole rather than spread across the order because it is evidence: when
 * a customer says they were charged and the shop says they were not, this is
 * what is compared against the gateway's dashboard.
 */
export interface IOrderPayment {
  provider: 'razorpay';
  /** The gateway's own order id, created before the customer pays. */
  gatewayOrderId: string;
  /** Set once, when a payment actually succeeds. Absent until then. */
  gatewayPaymentId?: string;
  /** upi | card | netbanking | wallet — whatever the customer chose. */
  method?: string;
  /** Paise. Compared against the order total before anything is marked paid. */
  amount: number;
  capturedAt?: Date;
  /** Why the last attempt failed, straight from the gateway. */
  failureReason?: string;
  refunds: IOrderRefund[];
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
  /** Always 'online' now. 'cod' appears only on orders taken before the
   *  gateway went live. */
  paymentMethod: 'cod' | 'online';
  /** Absent only on those older cash-on-delivery orders. */
  payment?: IOrderPayment;
  timeline: IOrderEvent[];
  /**
   * Whether this order's reserved units have been returned to the catalogue.
   * It is the ledger for stock, not the status: cancelling flips it as part of
   * the same atomic update, so two racing cancels can never release twice.
   */
  stockReleased: boolean;
  /**
   * What actually reached someone when the order was placed. Recorded because
   * notification is best-effort — the order stands whether or not the mail
   * went out, so without this a missing confirmation leaves no trace anywhere.
   */
  notified?: {
    customerEmail: boolean;
    adminEmail: boolean;
    customerWhatsApp: boolean;
    adminWhatsApp: boolean;
    attemptedAt: Date;
  };
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
    image: { type: String },
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

const refundSchema = new Schema<IOrderRefund>(
  {
    refundId: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    reason: String,
    at: { type: Date, default: Date.now },
  },
  { _id: false },
);

const paymentSchema = new Schema<IOrderPayment>(
  {
    provider: { type: String, enum: ['razorpay'], required: true },
    gatewayOrderId: { type: String, required: true },
    gatewayPaymentId: { type: String },
    method: String,
    amount: { type: Number, required: true, min: 0 },
    capturedAt: Date,
    failureReason: String,
    refunds: { type: [refundSchema], default: [] },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder, OrderModel>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    idempotencyKey: { type: String },
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
    // 'cod' stays in the enum although it can no longer be chosen: orders
    // taken before the gateway went live still carry it, and dropping it
    // would make those documents fail validation on any later save.
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'online' },
    payment: { type: paymentSchema, required: false },
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
    stockReleased: { type: Boolean, default: false },
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
      required: false,
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

/**
 * The idempotency key must be unique *per customer*, and enforced by the
 * database rather than by a read-then-write in the controller: two submits
 * landing together would both pass a findOne check and reserve stock twice.
 */
orderSchema.index(
  { user: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } },
);

/**
 * The gateway's order id identifies an order to a webhook, which arrives with
 * no session and no order number. Sparse because older cash-on-delivery
 * orders have none.
 */
orderSchema.index(
  { 'payment.gatewayOrderId': 1 },
  { unique: true, partialFilterExpression: { 'payment.gatewayOrderId': { $type: 'string' } } },
);

/**
 * One payment can confirm one order, enforced by the database.
 *
 * The browser callback and the webhook both try to mark an order paid, and a
 * webhook may be redelivered for days. Without this a replay could confirm
 * twice — and confirming releases nothing but does send a second confirmation
 * email and a second line on the timeline.
 */
orderSchema.index(
  { 'payment.gatewayPaymentId': 1 },
  { unique: true, partialFilterExpression: { 'payment.gatewayPaymentId': { $type: 'string' } } },
);

/**
 * ATT-YYYYMM-0001, sequential within the month.
 *
 * Ordered by creation rather than by the number itself: string sort puts
 * "ATT-202609-10000" below "ATT-202609-9999", so a shop past its 9,999th order
 * in a month would hand out the same number forever. Two checkouts landing
 * together can still pick the same number — the unique index rejects the loser,
 * and placeOrder retries.
 */
export async function nextOrderNumber(): Promise<string> {
  const now = new Date();
  const prefix = `ATT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const last = await Order.findOne({ orderNumber: new RegExp(`^${prefix}-`) })
    .sort({ createdAt: -1 })
    .select('orderNumber')
    .lean();
  const previous = last ? Number(last.orderNumber.split('-')[2]) : 0;
  const sequence = Number.isFinite(previous) ? previous + 1 : 1;
  return `${prefix}-${String(sequence).padStart(4, '0')}`;
}

export const Order =
  (mongoose.models.Order as OrderModel) ?? mongoose.model<IOrder, OrderModel>('Order', orderSchema);
