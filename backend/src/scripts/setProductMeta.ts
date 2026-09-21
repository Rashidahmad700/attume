/**
 * Backfills the fields a Mongoose default cannot reach.
 *
 *   npm run set-product-meta                 # report what would change
 *   npm run set-product-meta -- --apply      # write it
 *
 * `inspiredBy` is per-product and has no default, so it has to be written.
 *
 * `audience` does have a default, and Mongoose applies defaults when it
 * hydrates a document, not only when it creates one — so the storefront
 * already shows the badge without this script. It is still persisted here so
 * the stored data says what it means, rather than relying on the schema to
 * supply it on every read.
 *
 * Safe to run repeatedly, and safe against production: it touches only these
 * two fields, so stock, prices and order history are never involved. That is
 * the difference between this and re-seeding.
 */
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/product.model.js';

/** Keyed by slug. A product not listed here still gets the audience default. */
const INSPIRED_BY: Record<string, string> = {
  atolis: 'Hawas Ice by Rasasi',
  santalyn: 'Kayali The Wedding Velvet Santal 35',
};

const DEFAULT_AUDIENCE = 'Unisex';

async function main() {
  const apply = process.argv.includes('--apply');

  await connectDB();

  // .lean() deliberately: a hydrated document would report the schema default
  // for audience, and the dry run would claim nothing needs writing.
  const products = await Product.find().select('slug name audience inspiredBy').lean();
  if (products.length === 0) {
    console.log('No products found — is MONGODB_URI pointing at the right database?');
    await disconnectDB();
    return;
  }

  let changed = 0;

  for (const product of products) {
    const wantAudience = product.audience ?? DEFAULT_AUDIENCE;
    const wantInspired = INSPIRED_BY[product.slug] ?? product.inspiredBy;

    const audienceChanges = product.audience !== wantAudience;
    const inspiredChanges = product.inspiredBy !== wantInspired;

    if (!audienceChanges && !inspiredChanges) {
      console.log(`  ${product.slug.padEnd(12)} already set`);
      continue;
    }

    changed += 1;
    console.log(
      `  ${product.slug.padEnd(12)} audience: ${product.audience ?? '—'} → ${wantAudience}` +
        `  |  inspiredBy: ${product.inspiredBy ?? '—'} → ${wantInspired ?? '—'}`,
    );

    if (apply) {
      await Product.updateOne(
        { _id: product._id },
        { $set: { audience: wantAudience, ...(wantInspired ? { inspiredBy: wantInspired } : {}) } },
      );
    }
  }

  console.log(
    changed === 0
      ? '\nNothing to change.'
      : apply
        ? `\nUpdated ${changed} product${changed === 1 ? '' : 's'}.`
        : `\n${changed} product${changed === 1 ? '' : 's'} would change. Re-run with --apply to write.`,
  );

  await disconnectDB();
}

void main();
