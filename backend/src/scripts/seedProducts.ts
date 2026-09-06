/** Seeds the catalogue with the four launch fragrances. Safe to re-run. */
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/product.model.js';

const products = [
  {
    name: 'atolis',
    slug: 'atolis',
    sku: 'ATT-ATO-50',
    tagline: 'Crisp apple, bright citrus, a quiet warmth beneath',
    description:
      'A crisp opening of juicy apple and bright citrus, followed by the subtle warmth of plum, cardamom and orange blossom, settling into musk, amber and driftwood.',
    notes: ['Apple', 'Bergamot', 'Cardamom', 'Driftwood'],
    price: 2499,
    compareAtPrice: 2999,
    stock: 40,
    status: 'active' as const,
    isFeatured: true,
    badge: 'Bestseller',
  },
  {
    name: 'Santalyn',
    slug: 'santalyn',
    sku: 'ATT-SAN-50',
    tagline: 'Creamy sandalwood laid over warm amber and musk',
    description: 'Sandalwood at the centre, softened with amber, tonka and a clean white musk.',
    notes: ['Sandalwood', 'Amber', 'Tonka', 'Musk'],
    price: 2699,
    stock: 25,
    status: 'active' as const,
    isFeatured: true,
    badge: 'New',
  },
  {
    name: 'Noirette',
    slug: 'noirette',
    sku: 'ATT-NOI-50',
    tagline: 'Smoked leather and dark plum for the after hours',
    description: 'Leather and plum over oud and vetiver — an evening composition with weight.',
    notes: ['Leather', 'Plum', 'Oud', 'Vetiver'],
    price: 2899,
    stock: 4,
    status: 'active' as const,
    isFeatured: true,
  },
  {
    name: 'Verdant',
    slug: 'verdant',
    sku: 'ATT-VER-50',
    tagline: 'Fig leaf and green moss, cool as morning shade',
    description: 'Green and shaded: fig leaf, moss and vetiver finished with white musk.',
    notes: ['Fig Leaf', 'Moss', 'Vetiver', 'White Musk'],
    price: 2499,
    stock: 0,
    status: 'active' as const,
    isFeatured: true,
  },
];

async function main() {
  await connectDB();

  for (const product of products) {
    await Product.updateOne(
      { slug: product.slug },
      { $setOnInsert: product },
      { upsert: true },
    );
  }

  const count = await Product.countDocuments();
  console.log(`[seed] catalogue ready — ${count} products`);

  await disconnectDB();
  process.exit(0);
}

void main();
