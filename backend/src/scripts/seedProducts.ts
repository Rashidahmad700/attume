/**
 * Seeds the catalogue with the launch fragrances, including the full profile
 * the product page renders. Re-running updates existing rows in place.
 */
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/product.model.js';

const products = [
  {
    name: 'atolis',
    slug: 'atolis',
    sku: 'ATT-ATO-50',
    tagline: 'Crisp apple and cold citrus over a quiet, woody warmth',
    description:
      'atolis opens the way a cold morning does — juicy apple, Italian lemon and bergamot lifted by a flicker of star anise. Underneath, plum and cardamom warm the citrus without weighing it down, and orange blossom keeps the whole thing bright. Hours later what remains is soft and skin-close: musk, amber, driftwood and moss.\n\nBuilt as a fresh signature for long days — an office morning that runs into an evening — rather than a scent that shouts on arrival and disappears by noon.',
    price: 2499,
    compareAtPrice: 2999,
    stock: 40,
    status: 'active' as const,
    isFeatured: true,
    badge: 'Bestseller',
    accords: [
      { name: 'Fruity', strength: 95 },
      { name: 'Citrus', strength: 88 },
      { name: 'Fresh', strength: 80 },
      { name: 'Aromatic', strength: 72 },
      { name: 'Sweet', strength: 66 },
      { name: 'Musky', strength: 58 },
      { name: 'Fresh spicy', strength: 48 },
      { name: 'Amber', strength: 40 },
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
    price: 2699,
    stock: 25,
    status: 'active' as const,
    isFeatured: true,
    badge: 'New',
    accords: [
      { name: 'Woody', strength: 96 },
      { name: 'Powdery', strength: 82 },
      { name: 'Warm spicy', strength: 70 },
      { name: 'Amber', strength: 64 },
      { name: 'Musky', strength: 58 },
      { name: 'Balsamic', strength: 50 },
      { name: 'White floral', strength: 42 },
      { name: 'Green', strength: 34 },
    ],
    notes: {
      top: ['Tea', 'Jasmine'],
      middle: ['White Musk', 'Cedarwood'],
      base: ['Sandalwood', 'Benzoin'],
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
  {
    name: 'Noirette',
    slug: 'noirette',
    sku: 'ATT-NOI-50',
    tagline: 'Smoked leather and dark plum for the after hours',
    description:
      'Noirette is the evening in the collection. Dark plum and saffron open it, leather and oud carry the middle, and vetiver with tonka closes it out dry and smoky.\n\nWear it after dark, in cold weather, when you want the fragrance to be part of the outfit.',
    price: 2899,
    stock: 4,
    status: 'active' as const,
    isFeatured: true,
    accords: [
      { name: 'Leather', strength: 92 },
      { name: 'Woody', strength: 84 },
      { name: 'Warm spicy', strength: 76 },
      { name: 'Amber', strength: 62 },
      { name: 'Fruity', strength: 48 },
      { name: 'Smoky', strength: 44 },
    ],
    notes: {
      top: ['Plum', 'Saffron'],
      middle: ['Leather', 'Oud'],
      base: ['Vetiver', 'Tonka Bean', 'Amber'],
    },
    performance: { longevity: '9–12 hours', sillage: 'Heavy', concentrationPct: '30%+ fragrance load' },
    wear: { seasons: ['Winter', 'Fall'], times: ['Night'] },
    highlights: [
      'Deep, smoky leather character',
      'Excellent longevity in cold weather',
      'Distinctive without being difficult',
      'A true evening signature',
    ],
  },
  {
    name: 'Verdant',
    slug: 'verdant',
    sku: 'ATT-VER-50',
    tagline: 'Fig leaf and green moss, cool as morning shade',
    description:
      'Verdant is green and shaded — fig leaf and violet leaf up top, moss and vetiver through the middle, white musk and cedar underneath. Cool, dry and quiet.\n\nBuilt for heat: it holds its shape through a humid afternoon instead of turning sweet.',
    price: 2499,
    stock: 0,
    status: 'active' as const,
    isFeatured: true,
    accords: [
      { name: 'Green', strength: 94 },
      { name: 'Woody', strength: 78 },
      { name: 'Aromatic', strength: 70 },
      { name: 'Musky', strength: 56 },
      { name: 'Earthy', strength: 50 },
      { name: 'Citrus', strength: 40 },
    ],
    notes: {
      top: ['Fig Leaf', 'Violet Leaf', 'Bergamot'],
      middle: ['Moss', 'Vetiver'],
      base: ['White Musk', 'Cedarwood'],
    },
    performance: { longevity: '6–8 hours', sillage: 'Moderate', concentrationPct: '30%+ fragrance load' },
    wear: { seasons: ['Summer', 'Spring'], times: ['Day'] },
    highlights: [
      'Cool, dry green character',
      'Holds up in heat and humidity',
      'Understated for office wear',
      'Pairs well with woody fragrances',
    ],
  },
];

async function main() {
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
