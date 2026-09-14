/**
 * Seeds the catalogue with the two launch fragrances, including the full
 * profile the product page renders. Re-running updates existing rows in place.
 * Anything else in the database is left alone.
 */
import { connectDB, disconnectDB } from '../config/db.js';
import { assertNotProduction } from '../config/env.js';
import { Product } from '../models/product.model.js';

const products = [
  {
    name: 'atolis',
    slug: 'atolis',
    sku: 'ATT-ATO-50',
    tagline: 'Crisp apple and cold citrus over a quiet, woody warmth',
    description:
      'atolis opens the way a cold morning does — juicy apple, Italian lemon and bergamot lifted by a flicker of star anise. Underneath, plum and cardamom warm the citrus without weighing it down, and orange blossom keeps the whole thing bright. Hours later what remains is soft and skin-close: musk, amber, driftwood and moss.\n\nBuilt as a fresh signature for long days — an office morning that runs into an evening — rather than a scent that shouts on arrival and disappears by noon.',
    price: 599,
    compareAtPrice: 1499,
    stock: 40,
    status: 'active' as const,
    isFeatured: true,
    badge: 'Bestseller',
    accords: [
      { name: 'Fresh-Aquatic', strength: 95 },
      { name: 'Fruity', strength: 90 },
      { name: 'Citrus', strength: 84 },
      { name: 'Aromatic', strength: 70 },
      { name: 'Sweet', strength: 62 },
      { name: 'Musky', strength: 54 },
      { name: 'Fresh spicy', strength: 46 },
      { name: 'Amber', strength: 38 },
    ],
    notes: {
      top: ['Apple', 'Italian Lemon', 'Sicilian Bergamot', 'Star Anise'],
      middle: ['Plum', 'Orange Blossom', 'Cardamom'],
      base: ['Musk', 'Amber', 'Driftwood', 'Moss'],
    },
    inspiredBy: { name: 'Hawas Ice', house: 'Rasasi', closeness: 'Close to 85–90%' },
    performance: { longevity: '8–10 hours on fabric', sillage: 'Strong, room-filling', concentrationPct: '30%+ fragrance load' },
    wear: { seasons: ['Summer', 'Spring', 'Fall'], times: ['Day', 'Night'] },
    highlights: [
      'Invigorating icy citrus opening',
      'Versatile across most seasons and occasions',
      'Compliment-getting, mass-appealing character',
      'Settles into a smooth musk and driftwood base',
      'Signature-worthy for daily wear',
    ],
  },
  {
    name: 'Santalyn',
    slug: 'santalyn',
    sku: 'ATT-SAN-50',
    tagline: 'Creamy sandalwood, tea and benzoin — velvet, not sugar',
    description:
      'Santalyn opens quietly with tea and jasmine, then turns creamy as white musk and cedarwood settle in. The heart of it is sandalwood — smooth, unsweetened, faintly milky — finished with benzoin for that soft, velvety close.\n\nA cosy, centring fragrance rather than a loud one. It reads unisex, sits close to the skin after the first hour, and suits fall and winter, quiet rooms and formal evenings.',
    price: 599,
    compareAtPrice: 1499,
    stock: 25,
    status: 'active' as const,
    isFeatured: true,
    badge: 'New',
    accords: [
      { name: 'Woody', strength: 96 },
      { name: 'Vanilla', strength: 86 },
      { name: 'Amber', strength: 78 },
      { name: 'Powdery', strength: 66 },
      { name: 'Warm spicy', strength: 58 },
      { name: 'Musky', strength: 50 },
      { name: 'Balsamic', strength: 42 },
      { name: 'White floral', strength: 34 },
    ],
    notes: {
      top: ['Tea', 'Jasmine'],
      middle: ['White Musk', 'Cedarwood'],
      base: ['Creamy Sandalwood', 'Benzoin'],
    },
    inspiredBy: { name: 'Velvet Santal | 35', house: 'Kayali', closeness: 'Close to 85%' },
    performance: { longevity: '6–8 hours', sillage: 'Moderate, close to skin', concentrationPct: '30%+ fragrance load' },
    wear: { seasons: ['Fall', 'Winter'], times: ['Day', 'Night'] },
    highlights: [
      'Creamy, smooth sandalwood profile',
      'Refined sweetness that never turns sugary',
      'Truly unisex and easy to wear',
      'Sophisticated for formal occasions',
      'Layers well with fresher fragrances',
    ],
  },
];

async function main() {
  assertNotProduction('seed data');
  await connectDB();

  for (const product of products) {
    // $set keeps stock edits made in admin from being clobbered on reseed.
    const { stock, ...rest } = product;
    await Product.updateOne(
      { slug: product.slug },
      { $set: rest, $setOnInsert: { stock } },
      { upsert: true },
    );
  }

  const count = await Product.countDocuments();
  console.log(`[seed] catalogue ready — ${count} products`);

  await disconnectDB();
  process.exit(0);
}

void main();
