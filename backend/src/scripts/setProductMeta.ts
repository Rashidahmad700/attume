/**
 * Brings a database in line with the product presentation the repository ships.
 *
 *   npm run set-product-meta                 # report what would change
 *   npm run set-product-meta -- --apply      # write it
 *
 * Three things live in the database rather than in code — the image list, the
 * audience and the inspired-by line — so deploying does not carry them. Every
 * environment needs this run once after the files land, which is why they are
 * in one script instead of three commands to remember.
 *
 * Image files are verified to exist in frontend/public before anything is
 * written, so a typo fails here rather than leaving a broken picture on the
 * storefront.
 *
 * Safe to run repeatedly, and safe against production: it touches only these
 * fields, so stock, prices and order history are never involved. That is the
 * difference between this and re-seeding.
 */
import fs from 'node:fs';
import path from 'node:path';
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/product.model.js';

/** The gallery, in the order it should appear. Keyed by slug. */
const IMAGES: Record<string, string[]> = {
  atolis: ['bottle.jpg', 'notes.jpg', 'ingredients.jpg', 'scent-profile.jpg', 'believe.jpg'],
  santalyn: ['bottle.jpg', 'notes.jpg', 'scent-script.jpg', 'scent-profile.jpg', 'believe.jpg'],
};

/** The composition each one sits closest to. Keyed by slug. */
const INSPIRED_BY: Record<string, string> = {
  atolis: 'Hawas Ice by Rasasi',
  santalyn: 'Kayali The Wedding Velvet Santal 35',
};

const DEFAULT_AUDIENCE = 'Unisex';
const PUBLIC_DIR = path.resolve(process.cwd(), '..', 'frontend', 'public');

/** Absolute paths as the storefront serves them, once the files are proven present. */
function galleryFor(slug: string): { url: string; alt: string }[] | null {
  const files = IMAGES[slug];
  if (!files) return null;

  const missing = files.filter(
    (file) => !fs.existsSync(path.join(PUBLIC_DIR, 'products', slug, file)),
  );
  if (missing.length > 0) {
    console.error(`  ${slug}: missing from frontend/public/products/${slug}/ — ${missing.join(', ')}`);
    process.exitCode = 1;
    return null;
  }

  return files.map((file) => ({ url: `/products/${slug}/${file}`, alt: slug }));
}

async function main() {
  const apply = process.argv.includes('--apply');

  await connectDB();

  // .lean() deliberately: a hydrated document reports the schema default for
  // audience, and the dry run would claim nothing needs writing when the field
  // is absent from the database entirely.
  const products = await Product.find().select('slug name audience inspiredBy images').lean();
  if (products.length === 0) {
    console.log('No products found — is MONGODB_URI pointing at the right database?');
    await disconnectDB();
    return;
  }

  let changed = 0;

  for (const product of products) {
    const wantAudience = product.audience ?? DEFAULT_AUDIENCE;
    const wantInspired = INSPIRED_BY[product.slug] ?? product.inspiredBy;
    const wantImages = galleryFor(product.slug);

    const haveUrls = (product.images ?? []).map((image) => image.url).join('|');
    const wantUrls = wantImages ? wantImages.map((image) => image.url).join('|') : haveUrls;

    const audienceChanges = product.audience !== wantAudience;
    const inspiredChanges = product.inspiredBy !== wantInspired;
    const imagesChange = wantUrls !== haveUrls;

    if (!audienceChanges && !inspiredChanges && !imagesChange) {
      console.log(`  ${product.slug.padEnd(12)} already in step`);
      continue;
    }

    changed += 1;
    console.log(`  ${product.slug}`);
    if (audienceChanges) console.log(`      audience   ${product.audience ?? '—'} → ${wantAudience}`);
    if (inspiredChanges) console.log(`      inspiredBy ${product.inspiredBy ?? '—'} → ${wantInspired ?? '—'}`);
    if (imagesChange) {
      console.log(`      images     ${(product.images ?? []).length} → ${wantImages?.length}`);
      wantImages?.forEach((image) => console.log(`                   ${image.url}`));
    }

    if (apply) {
      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            audience: wantAudience,
            ...(wantInspired ? { inspiredBy: wantInspired } : {}),
            ...(wantImages ? { images: wantImages } : {}),
          },
        },
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
