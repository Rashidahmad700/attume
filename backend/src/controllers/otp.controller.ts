import {
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
  Otp,
  createOtpCode,
  hashOtp,
  otpMatches,
  type OtpChannel,
} from '../models/otp.model.js';
import { User } from '../models/user.model.js';
import { sendMail } from '../services/mailer.service.js';
import { sendWhatsApp } from '../services/whatsapp.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** The contact this channel verifies, and whether it is already done. */
function contactFor(user: { email: string; phone?: string; emailVerified: boolean; phoneVerified: boolean }, channel: OtpChannel) {
  return channel === 'email'
    ? { destination: user.email, verified: user.emailVerified }
    : { destination: user.phone ?? '', verified: user.phoneVerified };
}

/**
 * POST /api/v1/auth/otp/send
 *
 * Issues a code for the signed-in customer's own email or phone. The code
 * itself is never returned or logged — it exists in the reply only as far as
 * the message that carries it.
 */
export const sendOtp = asyncHandler(async (req, res) => {
  const { channel } = req.body as { channel: OtpChannel };

  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.unauthorized();

  const { destination, verified } = contactFor(user, channel);
  if (!destination) {
    throw ApiError.badRequest(
      channel === 'phone' ? 'Add a contact number to your account first' : 'No email on this account',
    );
  }
  if (verified) {
    res.status(200).json({
      success: true,
      message: `Your ${channel} is already verified`,
      data: { alreadyVerified: true },
    });
    return;
  }

  // A cooldown on top of the route limiter: the limiter counts requests per
  // address, this stops one account being used to hammer one inbox.
  const latest = await Otp.findOne({ user: user._id, channel }).sort({ createdAt: -1 }).lean();
  if (latest) {
    const waited = Date.now() - new Date(latest.createdAt).getTime();
    if (waited < OTP_RESEND_COOLDOWN_MS) {
      throw ApiError.tooManyRequests(
        `Please wait ${Math.ceil((OTP_RESEND_COOLDOWN_MS - waited) / 1000)}s before asking for another code`,
      );
    }
  }

  // Any earlier code for this channel stops working the moment a new one is
  // sent, so two codes are never valid at once.
  await Otp.deleteMany({ user: user._id, channel });

  const code = createOtpCode();
  await Otp.create({
    user: user._id,
    channel,
    destination,
    codeHash: hashOtp(code),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  const minutes = Math.round(OTP_TTL_MS / 60000);
  const body = [
    `Hello ${user.name.split(' ')[0]},`,
    '',
    `Your attume verification code is ${code}`,
    '',
    `It expires in ${minutes} minutes. If you did not ask for it, you can ignore this message — nothing has changed on your account.`,
    '',
    '— attume',
  ].join('\n');

  if (channel === 'email') {
    await sendMail({ to: destination, subject: `${code} is your attume verification code`, text: body });
  } else {
    await sendWhatsApp({ to: destination, label: 'verification code', text: body });
  }

  res.status(200).json({
    success: true,
    message: `Code sent to your ${channel}`,
    data: {
      channel,
      // Enough to confirm where it went, not enough to reveal the address.
      destination: maskDestination(channel, destination),
      expiresInSeconds: Math.round(OTP_TTL_MS / 1000),
      resendAfterSeconds: Math.round(OTP_RESEND_COOLDOWN_MS / 1000),
    },
  });
});

/** POST /api/v1/auth/otp/verify */
export const verifyOtp = asyncHandler(async (req, res) => {
  const { channel, code } = req.body as { channel: OtpChannel; code: string };

  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.unauthorized();

  const otp = await Otp.findOne({ user: user._id, channel, consumedAt: { $exists: false } }).sort({
    createdAt: -1,
  });
  if (!otp || otp.expiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest('That code has expired — ask for a new one');
  }

  // A code the contact has since changed away from must not verify the new one.
  const { destination } = contactFor(user, channel);
  if (otp.destination !== destination) {
    await otp.deleteOne();
    throw ApiError.badRequest('Your details changed — ask for a new code');
  }

  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    throw ApiError.tooManyRequests('Too many attempts — ask for a new code');
  }

  if (!otpMatches(code, otp.codeHash)) {
    otp.attempts += 1;
    await otp.save();
    const left = Math.max(0, OTP_MAX_ATTEMPTS - otp.attempts);
    throw ApiError.badRequest(
      left > 0 ? `That code is not right — ${left} attempt${left === 1 ? '' : 's'} left` : 'Too many attempts — ask for a new code',
    );
  }

  otp.consumedAt = new Date();
  await otp.save();

  if (channel === 'email') user.emailVerified = true;
  else user.phoneVerified = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: `Your ${channel} is verified`,
    data: { user: user.toJSON() },
  });
});

/** Shows the shape of a contact without giving it away. */
function maskDestination(channel: OtpChannel, value: string): string {
  if (channel === 'phone') return `••••••${value.slice(-4)}`;
  const [name, domain] = value.split('@');
  const head = name.slice(0, 2);
  return `${head}${'•'.repeat(Math.max(1, name.length - 2))}@${domain}`;
}
