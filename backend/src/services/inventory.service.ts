import { Product } from '../models/product.model.js';
import type { IOrder } from '../models/order.model.js';
import { ApiError } from '../utils/ApiError.js';

export interface StockRequest {
  productId: string;
  quantity: number;
  name: string;
}

/** The reservation an order holds, in the shape releaseStock expects. */
export function reservationsFor(order: Pick<IOrder, 'items'>): StockRequest[] {
  return order.items.map((item) => ({
    productId: String(item.product),
    quantity: item.quantity,
    name: item.name,
  }));
}

/**
 * Collapses repeated lines for one product into a single reservation.
 *
 * Without this, a bag holding the same fragrance on two lines would be checked
 * against full stock twice — and the per-line quantity cap could be multiplied
 * by simply repeating the line.
 */
export function mergeLines<T extends { slug: string; quantity: number }>(lines: T[]): T[] {
  const merged = new Map<string, T>();
  for (const line of lines) {
    const existing = merged.get(line.slug);
    if (existing) existing.quantity += line.quantity;
    else merged.set(line.slug, { ...line });
  }
  return [...merged.values()];
}

/**
 * Atomically reserves stock for a list of lines.
 *
 * Each decrement is a conditional update — `stock >= quantity` is part of the
 * query, so two simultaneous orders for the last bottle cannot both succeed.
 * If any line fails, everything already taken is returned before throwing, so
 * a partial reservation never survives.
 *
 * (A replica set would let this be one transaction. The compensating write
 * keeps the same guarantee on a standalone MongoDB.)
 */
export async function reserveStock(lines: StockRequest[]): Promise<void> {
  const taken: StockRequest[] = [];

  for (const line of lines) {
    const updated = await Product.findOneAndUpdate(
      { _id: line.productId, stock: { $gte: line.quantity }, status: 'active' },
      { $inc: { stock: -line.quantity } },
      { new: true },
    );

    if (!updated) {
      await releaseStock(taken);
      const current = await Product.findById(line.productId).select('stock name');
      throw ApiError.conflict(
        current && current.stock > 0
          ? `Only ${current.stock} left of ${line.name} — please adjust your bag`
          : `${line.name} sold out while you were checking out`,
      );
    }

    taken.push(line);
  }
}

/**
 * Returns reserved units to the catalogue (cancellation, or a failed
 * reservation).
 *
 * Callers must have won the right to release first — for an order that means
 * flipping `stockReleased` in the same update that cancels it. Calling this
 * twice for one order would invent inventory.
 */
export async function releaseStock(lines: StockRequest[]): Promise<void> {
  await Promise.all(
    lines.map((line) =>
      Product.updateOne({ _id: line.productId }, { $inc: { stock: line.quantity } }),
    ),
  );
}
