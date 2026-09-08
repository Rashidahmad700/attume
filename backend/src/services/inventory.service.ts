import { Product } from '../models/product.model.js';
import { ApiError } from '../utils/ApiError.js';

export interface StockRequest {
  productId: string;
  quantity: number;
  name: string;
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

/** Returns reserved units to the catalogue (cancellation, or a failed reservation). */
export async function releaseStock(lines: StockRequest[]): Promise<void> {
  await Promise.all(
    lines.map((line) =>
      Product.updateOne({ _id: line.productId }, { $inc: { stock: line.quantity } }),
    ),
  );
}
