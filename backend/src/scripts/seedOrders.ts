/**
 * Demo orders so the admin console has something to manage before checkout
 * exists. Development aid only — never run against production data.
 */
import { connectDB, disconnectDB } from '../config/db.js';
import { Order, nextOrderNumber, type OrderStatus, type PaymentStatus } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';

const plan: { status: OrderStatus; paymentStatus: PaymentStatus; method: 'cod' | 'online'; daysAgo: number }[] = [
  { status: 'pending', paymentStatus: 'pending', method: 'cod', daysAgo: 0 },
  { status: 'confirmed', paymentStatus: 'paid', method: 'online', daysAgo: 1 },
  { status: 'packed', paymentStatus: 'paid', method: 'online', daysAgo: 2 },
  { status: 'shipped', paymentStatus: 'paid', method: 'online', daysAgo: 4 },
  { status: 'delivered', paymentStatus: 'paid', method: 'cod', daysAgo: 9 },
  { status: 'cancelled', paymentStatus: 'refunded', method: 'online', daysAgo: 12 },
];

async function main() {
  await connectDB();

  const existing = await Order.countDocuments();
  if (existing > 0) {
    console.log(`[seed] ${existing} orders already present — skipping`);
    await disconnectDB();
    process.exit(0);
  }

  const products = await Product.find({ status: 'active' }).limit(3);
  const customers = await User.find({ role: 'customer' }).limit(3);

  if (products.length === 0 || customers.length === 0) {
    console.error('[seed] need at least one product and one customer first');
    process.exit(1);
  }

  for (const [index, entry] of plan.entries()) {
    const customer = customers[index % customers.length];
    const product = products[index % products.length];
    const quantity = (index % 2) + 1;
    const subtotal = product.price * quantity;
    const shipping = subtotal >= 2000 ? 0 : 99;
    const placedAt = new Date(Date.now() - entry.daysAgo * 86_400_000);

    await Order.create({
      orderNumber: await nextOrderNumber(),
      user: customer._id,
      customer: { name: customer.name, email: customer.email, phone: customer.phone },
      items: [
        {
          product: product._id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: product.price,
          quantity,
          subtotal,
        },
      ],
      amounts: { subtotal, shipping, discount: 0, total: subtotal + shipping },
      shippingAddress: {
        name: customer.name,
        phone: customer.phone ?? '7024484667',
        line1: 'D-2, H-758/A, Samsul Road',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110044',
        country: 'India',
      },
      status: entry.status,
      paymentStatus: entry.paymentStatus,
      paymentMethod: entry.method,
      timeline: [{ status: entry.status, note: 'Seeded', at: placedAt }],
      placedAt,
    });
  }

  console.log(`[seed] created ${plan.length} demo orders`);
  await disconnectDB();
  process.exit(0);
}

void main();
