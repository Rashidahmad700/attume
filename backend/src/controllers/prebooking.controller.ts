import { Prebooking } from '../models/prebooking.model.js';
import { Product } from '../models/product.model.js';
import { sendMail } from '../services/mailer.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { CreatePrebookingInput } from '../validators/prebooking.validator.js';

/**
 * POST /api/v1/prebookings
 *
 * Records interest in a fragrance before it can be bought. No money changes
 * hands and nothing is promised beyond being told first — the shop runs this
 * way until a payment gateway is approved.
 */
export const createPrebooking = asyncHandler(async (req, res) => {
  const { name, email, phone, slug, quantity, city, note, source } =
    req.body as CreatePrebookingInput;

  // A named fragrance has to exist and be sellable. A missing slug is a plain
  // list sign-up, which is allowed.
  let product = null;
  if (slug) {
    product = await Product.findOne({ slug, status: 'active' });
    if (!product) throw ApiError.notFound('That fragrance is not available to pre-book');
  }

  // Pre-booking the same fragrance twice updates the request rather than
  // queueing the person again.
  const prebooking = await Prebooking.findOneAndUpdate(
    { email, productSlug: product?.slug ?? null, source },
    {
      $set: {
        name,
        email,
        phone,
        product: product?._id,
        productSlug: product?.slug,
        productName: product?.name,
        quantity,
        city,
        note,
        source,
      },
      $setOnInsert: { status: 'new' },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  // Confirmation is best-effort: the request is already safely recorded, and a
  // mail provider being down is not the customer's problem.
  try {
    await sendMail({
      to: email,
      subject: product ? `You are on the list for ${product.name}` : 'You are on the attume list',
      text: [
        `Hello ${name.split(' ')[0]},`,
        '',
        product
          ? `Your pre-booking for ${product.name} (${product.sizeMl} ml) is recorded${
              quantity > 1 ? `, ${quantity} bottles` : ''
            }.`
          : 'You are on the attume list.',
        '',
        'Nothing has been charged. We will write to you with the details before anything is dispatched.',
        '',
        '— attume',
      ].join('\n'),
    });
  } catch (error) {
    console.error('[prebooking] confirmation email failed:', (error as Error).message);
  }

  res.status(201).json({
    success: true,
    message: product
      ? `Pre-booked. We will write to you before ${product.name} ships.`
      : 'You are on the list. We will be in touch.',
    data: { prebooking: prebooking.toJSON() },
  });
});
