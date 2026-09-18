import { Prebooking } from '../models/prebooking.model.js';
import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
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

  // Open to guests by design, but a signed-in customer's pre-booking is tied
  // to their account so the page can tell them they are already on the list.
  const account = req.user ? await User.findById(req.user.id) : null;

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
  const existing = await Prebooking.findOne({
    email,
    productSlug: product?.slug ?? null,
    source,
  }).lean();

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
        ...(account ? { user: account._id } : {}),
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

  // Written onto the row itself, so an alert that never arrived can be found
  // later in the admin console rather than only in a log that has rotated away.
  // Best-effort like the sending it describes: the pre-booking stands either way.
  await Prebooking.updateOne(
    { _id: prebooking._id },
    { $set: { notified: { ...delivered, attemptedAt: new Date() } } },
  ).catch((error: Error) => {
    console.error('[prebooking] could not record delivery status:', error.message);
  });

  // Loud, because this is the shop's only signal that a customer is waiting.
  if (!delivered.adminEmail) {
    console.error(
      `[prebooking] ADMIN ALERT NOT DELIVERED for ${email} — check RESEND_API_KEY, MAIL_FROM and ADMIN_NOTIFY_EMAIL`,
    );
  }

  // Pre-booking the same fragrance twice is an update, not a failure — say so
  // rather than implying a second place in the queue.
  res.status(existing ? 200 : 201).json({
    success: true,
    message: existing
      ? product
        ? `You are already on the list for ${product.name} — we have updated your details.`
        : 'You are already on the list — we have updated your details.'
      : product
        ? `Pre-booked. We will write to you before ${product.name} ships.`
        : 'You are on the list. We will be in touch.',
    data: { prebooking: prebooking.toJSON(), alreadyPrebooked: Boolean(existing) },
  });
});

/**
 * GET /api/v1/prebookings/mine
 *
 * The slugs this customer has already pre-booked, so the product page can show
 * that state rather than offering the form again.
 */
export const listMyPrebookings = asyncHandler(async (req, res) => {
  const account = await User.findById(req.user!.id).select('email');
  if (!account) throw ApiError.unauthorized();

  // Matched on either the account or the address it was left under, so a
  // pre-booking made as a guest is recognised once that person signs in.
  const rows = await Prebooking.find({
    $or: [{ user: account._id }, { email: account.email }],
    productSlug: { $exists: true },
  })
    .select('productSlug quantity status createdAt')
    .lean();

  res.status(200).json({
    success: true,
    data: {
      prebookings: rows.map((row) => ({
        slug: row.productSlug,
        quantity: row.quantity,
        status: row.status,
      })),
    },
  });
});
