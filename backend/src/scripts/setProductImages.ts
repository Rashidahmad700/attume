/**
 * Attaches image files to a product.
 *
 *   npm run set-images -- --slug atolis --files bottle.jpg,carton.jpg
 *
 * Files must already sit in frontend/public/products/<slug>/. The script
 * verifies each one exists before writing, so a typo fails loudly instead of
 * leaving a broken image on the storefront.
 */
import fs from 'node:fs';
import path from 'node:path';
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/product.model.js';

function arg(flag: string): string | undefined {
  const index = process.argv.indexOf(`--${flag}`);
  return index > -1 ? process.argv[index + 1] : undefined;
}

const PUBLIC_DIR = path.resolve(process.cwd(), '..', 'frontend', 'public');

async function main() {
  const slug = arg('slug')?.trim().toLowerCase();
  const files = (arg('files') ?? '')
    .split(',')
    .map((file) => file.trim())
    .filter(Boolean);

  if (!slug || files.length === 0) {
    console.error('Usage: npm run set-images -- --slug <slug> --files a.jpg,b.jpg');
    process.exit(1);
  }

  const missing = files.filter(
    (file) => !fs.existsSync(path.join(PUBLIC_DIR, 'products', slug, file)),
  );
  if (missing.length > 0) {
    console.error(
      `Missing from frontend/public/products/${slug}/: ${missing.join(', ')}`,
    );
    process.exit(1);
  }

  await connectDB();

  const product = await Product.findOne({ slug });
  if (!product) {
    console.error(`No product with slug "${slug}"`);
    process.exit(1);
  }

  product.images = files.map((file) => ({
    url: `/products/${slug}/${file}`,
    alt: `${product.name} — ${product.concentration}`,
  }));
  await product.save();

  console.log(`[images] ${product.name}: ${product.images.length} image(s) attached`);
  product.images.forEach((image) => console.log(`  ${image.url}`));

  await disconnectDB();
  process.exit(0);
}

void main();
