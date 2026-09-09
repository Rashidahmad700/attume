/**
 * Archives products by slug. Archiving rather than deleting keeps them
 * readable in past orders.
 *
 *   npm run archive -- --slugs noirette,verdant
 */
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/product.model.js';

function arg(flag: string): string | undefined {
  const index = process.argv.indexOf(`--${flag}`);
  return index > -1 ? process.argv[index + 1] : undefined;
}

async function main() {
  const slugs = (arg('slugs') ?? '')
    .split(',')
    .map((slug) => slug.trim())
    .filter(Boolean);

  if (slugs.length === 0) {
    console.error('Usage: npm run archive -- --slugs slug-one,slug-two');
    process.exit(1);
  }

  await connectDB();

  const result = await Product.updateMany(
    { slug: { $in: slugs } },
    { $set: { status: 'archived', isFeatured: false } },
  );

  console.log(`[archive] archived ${result.modifiedCount} product(s): ${slugs.join(', ')}`);
  await disconnectDB();
  process.exit(0);
}

void main();
