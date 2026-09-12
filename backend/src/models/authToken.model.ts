import crypto from 'node:crypto';
import mongoose, { Schema, type Model, type Types } from 'mongoose';

export type AuthTokenType = 'magic-link' | 'password-reset';

export interface IAuthToken {
  user: Types.ObjectId;
  type: AuthTokenType;
  /** Only the hash is stored — a database leak must not yield usable links. */
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

type AuthTokenModel = Model<IAuthToken>;

const authTokenSchema = new Schema<IAuthToken, AuthTokenModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['magic-link', 'password-reset'], required: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Mongo removes expired documents on its own, so spent tokens do not pile up.
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AuthToken =
  (mongoose.models.AuthToken as AuthTokenModel) ??
  mongoose.model<IAuthToken, AuthTokenModel>('AuthToken', authTokenSchema);

/** Raw token goes in the email; only its hash is ever written down. */
export function createRawToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(32).toString('base64url');
  return { raw, hash: hashToken(raw) };
}

export const hashToken = (raw: string): string =>
  crypto.createHash('sha256').update(raw).digest('hex');
