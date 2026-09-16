import crypto from 'node:crypto';
import mongoose, { Schema, type Model, type Types } from 'mongoose';

export const OTP_CHANNELS = ['email', 'phone'] as const;
export type OtpChannel = (typeof OTP_CHANNELS)[number];

/** Long enough to resist guessing at five attempts, short enough to read aloud. */
const CODE_LENGTH = 6;
export const OTP_TTL_MS = 10 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;

export interface IOtp {
  user: Types.ObjectId;
  channel: OtpChannel;
  /** The address or number this code was sent to, so a changed contact invalidates it. */
  destination: string;
  /** Only the hash is stored — a database leak must not hand over working codes. */
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  consumedAt?: Date;
  createdAt: Date;
}

type OtpModel = Model<IOtp>;

const otpSchema = new Schema<IOtp, OtpModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    channel: { type: String, enum: OTP_CHANNELS, required: true },
    destination: { type: String, required: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Mongo clears expired codes on its own, so spent ones do not accumulate.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ user: 1, channel: 1, createdAt: -1 });

/** A six digit code, drawn from a cryptographic source rather than Math.random. */
export function createOtpCode(): string {
  const max = 10 ** CODE_LENGTH;
  return String(crypto.randomInt(0, max)).padStart(CODE_LENGTH, '0');
}

export function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/** Constant-time compare, so a wrong code cannot be narrowed down by timing. */
export function otpMatches(code: string, hash: string): boolean {
  const attempt = Buffer.from(hashOtp(code));
  const stored = Buffer.from(hash);
  return attempt.length === stored.length && crypto.timingSafeEqual(attempt, stored);
}

export const Otp =
  (mongoose.models.Otp as OtpModel) ?? mongoose.model<IOtp, OtpModel>('Otp', otpSchema);
