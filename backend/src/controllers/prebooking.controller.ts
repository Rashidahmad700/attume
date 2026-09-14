import { Prebooking } from '../models/prebooking.model.js';
import { Product } from '../models/product.model.js';
import { checkEmail } from '../services/emailCheck.service.js';
import { notifyPrebooking } from '../services/notify.service.js';
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

  // Checked before anything is stored: a typo or a throwaway address means the
  // person never hears back, and the launch list carries an entry nobody reads.
  const emailCheck = await checkEmail(email);
  if (!emailCheck.ok) {
    throw ApiError.badRequest(emailCheck.reason ?? 'Please check your email address');
  }

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

  // Announced on every channel that is configured — customer and shop, email
  // and WhatsApp. All of it is best-effort: the pre-booking is already saved,
  // and a provider being down is not the customer's problem.
  const delivered = await notifyPrebooking(prebooking);
  console.log(
    `[prebooking] ${email} — email(customer:${delivered.customerEmail} admin:${delivered.adminEmail}) ` +
      `whatsapp(customer:${delivered.customerWhatsApp} admin:${delivered.adminWhatsApp})`,
  );

  res.status(201).json({
    success: true,
    message: product
      ? `Pre-booked. We will write to you before ${product.name} ships.`
      : 'You are on the list. We will be in touch.',
    data: { prebooking: prebooking.toJSON() },
  });
});
